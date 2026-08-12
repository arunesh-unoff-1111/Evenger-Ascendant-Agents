import { Venue, Vendor, SelectedVendor, BudgetBreakdown, CostAlternative, EventEntity, ReplanRequest, ReplanDiff } from './types.js';

export function safeFormatINR(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Deterministic vendor cost calculator
 */
export function calculateVendorCost(vendor: Vendor, attendees: number): SelectedVendor {
  let calculatedCost = 0;
  let quantity = attendees;

  if (vendor.pricing_type === 'fixed') {
    calculatedCost = vendor.base_cost;
    quantity = 1;
  } else if (vendor.pricing_type === 'per_attendee') {
    calculatedCost = vendor.base_cost + (vendor.unit_cost_per_attendee * attendees);
  } else {
    // Tiered calculation
    calculatedCost = vendor.base_cost + Math.ceil(attendees / 100) * (vendor.unit_cost_per_attendee * 100);
  }

  return {
    vendor_id: vendor.id,
    vendor_name: vendor.name,
    category: vendor.category,
    calculated_cost: Math.round(calculatedCost),
    unit_cost: vendor.unit_cost_per_attendee,
    quantity,
    notes: `${vendor.category} package for ${attendees} attendees (${vendor.pricing_type === 'fixed' ? 'Fixed Fee' : `₹${vendor.unit_cost_per_attendee}/person`})`
  };
}

/**
 * Deterministic full budget breakdown calculator
 */
export function calculateBudgetBreakdown(
  totalBudget: number,
  venueCost: number,
  selectedVendors: SelectedVendor[],
  contingencyPct: number = 0.08
): BudgetBreakdown {
  const totalVendorCost = selectedVendors.reduce((sum, v) => sum + v.calculated_cost, 0);
  const baseSubtotal = venueCost + totalVendorCost;
  const contingencyCost = Math.round(baseSubtotal * contingencyPct);
  const estimatedTotal = baseSubtotal + contingencyCost;
  const remainingBudget = totalBudget - estimatedTotal;
  const isOverBudget = estimatedTotal > totalBudget;
  const overBudgetAmount = isOverBudget ? estimatedTotal - totalBudget : 0;

  return {
    id: `budget-${Date.now()}`,
    event_id: '',
    total_budget: totalBudget,
    venue_cost: venueCost,
    vendor_costs: selectedVendors,
    total_vendor_cost: totalVendorCost,
    contingency_cost: contingencyCost,
    estimated_total: estimatedTotal,
    remaining_budget: remainingBudget,
    is_over_budget: isOverBudget,
    over_budget_amount: overBudgetAmount
  };
}

/**
 * Deterministic change detector comparing current event state with replan request
 */
export function detectEventDiff(currentEvent: EventEntity, req: ReplanRequest): ReplanDiff {
  const newAttendees = req.expected_attendees ?? currentEvent.expected_attendees;
  const newBudget = req.total_budget ?? currentEvent.total_budget;
  const newLocation = req.location ?? currentEvent.location;

  const attendeeDiff = newAttendees - currentEvent.expected_attendees;
  const budgetDiff = newBudget - currentEvent.total_budget;
  const hasAttendeeChange = attendeeDiff !== 0;
  const hasBudgetChange = budgetDiff !== 0;
  const hasLocationChange = newLocation !== currentEvent.location;
  const hasReqsChange = !!req.requirements && JSON.stringify(req.requirements) !== JSON.stringify(currentEvent.requirements);

  const affectedAgentsSet = new Set<string>();

  if (hasAttendeeChange) {
    affectedAgentsSet.add('Venue Agent');
    affectedAgentsSet.add('Vendor Agent');
    affectedAgentsSet.add('Budget Agent');
    affectedAgentsSet.add('Schedule Agent');
    affectedAgentsSet.add('Communication Agent');
  }

  if (hasBudgetChange) {
    affectedAgentsSet.add('Budget Agent');
    affectedAgentsSet.add('Venue Agent');
    affectedAgentsSet.add('Vendor Agent');
  }

  if (hasLocationChange) {
    affectedAgentsSet.add('Venue Agent');
    affectedAgentsSet.add('Schedule Agent');
    affectedAgentsSet.add('Communication Agent');
  }

  if (hasReqsChange) {
    affectedAgentsSet.add('Venue Agent');
    affectedAgentsSet.add('Vendor Agent');
  }

  const affectedAgents = Array.from(affectedAgentsSet);

  let summaryParts: string[] = [];
  if (hasAttendeeChange) {
    summaryParts.push(`${attendeeDiff > 0 ? '+' : ''}${attendeeDiff} Attendees (${currentEvent.expected_attendees} → ${newAttendees})`);
  }
  if (hasBudgetChange) {
    summaryParts.push(`Budget shift: ₹${safeFormatINR(currentEvent.total_budget)} → ₹${safeFormatINR(newBudget)}`);
  }
  if (hasLocationChange) {
    summaryParts.push(`Location change to ${newLocation}`);
  }

  return {
    has_attendee_change: hasAttendeeChange,
    attendee_diff: attendeeDiff,
    has_budget_change: hasBudgetChange,
    budget_diff: budgetDiff,
    has_location_change: hasLocationChange,
    has_requirements_change: hasReqsChange,
    affected_agents: affectedAgents.length > 0 ? affectedAgents : ['Event Manager'],
    summary: summaryParts.length > 0 ? summaryParts.join(' | ') : 'Manual plan optimization requested'
  };
}

/**
 * Check if venue fits attendee capacity
 */
export function evaluateVenueCapacity(venue: Venue, attendees: number): { isSuitable: boolean; capacityRatio: number; message: string } {
  const ratio = attendees / venue.capacity;
  if (attendees > venue.capacity) {
    return {
      isSuitable: false,
      capacityRatio: ratio,
      message: `INSUFFICIENT CAPACITY: Event requires ${attendees} seats, but ${venue.name} max capacity is ${venue.capacity} (Short by ${attendees - venue.capacity} seats).`
    };
  }
  if (ratio > 0.95) {
    return {
      isSuitable: true,
      capacityRatio: ratio,
      message: `AT MAX CAPACITY: ${venue.name} will be tight at ${Math.round(ratio * 100)}% capacity (${attendees}/${venue.capacity}).`
    };
  }
  return {
    isSuitable: true,
    capacityRatio: ratio,
    message: `SUITABLE: ${venue.name} comfortably supports ${attendees} attendees (${Math.round(ratio * 100)}% capacity).`
  };
}

/**
 * Deterministic cost optimization alternative generator
 */
export function generateCostSavingAlternatives(
  overBudgetAmount: number,
  allVenues: Venue[],
  allVendors: Vendor[],
  currentVenue: Venue,
  currentVendors: SelectedVendor[],
  attendees: number
): CostAlternative[] {
  const alternatives: CostAlternative[] = [];

  // 1. Alternative cheaper venue
  const cheaperVenues = allVenues.filter(v => v.capacity >= attendees && v.cost_per_day < currentVenue.cost_per_day);
  if (cheaperVenues.length > 0) {
    const bestCheaper = cheaperVenues.sort((a, b) => a.cost_per_day - b.cost_per_day)[0];
    const savings = currentVenue.cost_per_day - bestCheaper.cost_per_day;
    alternatives.push({
      title: `Switch Venue to ${bestCheaper.name}`,
      description: `Migrate to ${bestCheaper.name} which holds ${bestCheaper.capacity} capacity at ₹${safeFormatINR(bestCheaper.cost_per_day)}/day.`,
      potential_savings: savings,
      trade_off: `Slightly smaller venue buffer (${bestCheaper.capacity} vs ${currentVenue.capacity} capacity).`,
      action_type: 'venue_switch'
    });
  }

  // 2. Catering optimization
  const cateringVendor = currentVendors.find(v => v.category === 'Catering');
  if (cateringVendor) {
    const alternativeCaterer = allVendors.find(v => v.category === 'Catering' && v.unit_cost_per_attendee < cateringVendor.unit_cost);
    if (alternativeCaterer) {
      const currentCatTotal = cateringVendor.calculated_cost;
      const newCatTotal = alternativeCaterer.base_cost + (alternativeCaterer.unit_cost_per_attendee * attendees);
      const catSavings = currentCatTotal - newCatTotal;
      if (catSavings > 0) {
        alternatives.push({
          title: `Switch Catering to ${alternativeCaterer.name}`,
          description: `Change to ${alternativeCaterer.name} at ₹${alternativeCaterer.unit_cost_per_attendee}/person standard buffet menu.`,
          potential_savings: catSavings,
          trade_off: `Standard multi-course meal instead of 3-course gourmet dining.`,
          action_type: 'catering_tier'
        });
      }
    }
  }

  // 3. Contingency buffer trim
  const contingencySavings = Math.round(overBudgetAmount * 0.5);
  alternatives.push({
    title: 'Adjust Emergency Contingency Buffer',
    description: 'Reduce the emergency contingency line item from 8% down to 4% for tight budget execution.',
    potential_savings: contingencySavings,
    trade_off: 'Less financial cushion for last-minute unbudgeted requests on event day.',
    action_type: 'contingency_adjustment'
  });

  return alternatives;
}
