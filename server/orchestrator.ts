import { EventPlan, ReplanRequest, ReplanningHistory } from './types.js';
import { db } from './db.js';
import { detectEventDiff, safeFormatINR } from './calculations.js';
import { runVenueAgent } from './agents/venueAgent.js';
import { runVendorAgent } from './agents/vendorAgent.js';
import { runBudgetAgent } from './agents/budgetAgent.js';
import { runScheduleAgent } from './agents/scheduleAgent.js';
import { runCommunicationAgent } from './agents/communicationAgent.js';
import { runEventManager } from './agents/eventManager.js';

export async function generateInitialPlan(eventId: string): Promise<EventPlan> {
  const event = db.getEventById(eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found.`);
  }

  const attendees = event.expected_attendees ?? 500;

  // Step 1: Run Venue Agent
  const venueResult = await runVenueAgent({
    eventId: event.id,
    location: event.location,
    expectedAttendees: attendees,
    totalBudget: event.total_budget,
    requirements: event.requirements
  });

  // Step 2: Run Vendor Agent
  const vendorResult = await runVendorAgent({
    eventId: event.id,
    eventType: event.type,
    expectedAttendees: attendees,
    requirements: event.requirements
  });

  // Step 3: Run Budget Agent
  const budgetResult = await runBudgetAgent({
    eventId: event.id,
    totalBudget: event.total_budget,
    venue: venueResult.selectedVenue,
    selectedVendors: vendorResult.selectedVendors,
    expectedAttendees: attendees
  });

  // Step 4: Run Schedule Agent
  const scheduleResult = await runScheduleAgent({
    eventId: event.id,
    eventName: event.name,
    eventType: event.type,
    date: event.date,
    expectedAttendees: attendees,
    venueName: venueResult.selectedVenue.name
  });

  // Step 5: Run Communication Agent
  const commResult = await runCommunicationAgent({
    eventId: event.id,
    eventName: event.name,
    date: event.date,
    venueName: venueResult.selectedVenue.name,
    expectedAttendees: attendees,
    triggerReason: 'INITIAL_EVENT_PLANNING'
  });

  // Step 6: Orchestrate Final Plan via Event Manager
  const managerResult = await runEventManager({
    event,
    venueResult,
    vendorResult,
    budgetResult,
    scheduleResult,
    commResult,
    isReplanning: false
  });

  // Save plan in event
  event.plan = managerResult.plan;
  event.status = managerResult.plan.budget.is_over_budget ? 'Replanning Needed' : 'Confirmed';
  db.saveEvent(event);

  return managerResult.plan;
}

export async function executeDynamicReplan(eventId: string, req: ReplanRequest): Promise<{ plan: EventPlan; history: ReplanningHistory; diffSummary: string }> {
  const event = db.getEventById(eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found.`);
  }

  const prevAttendees = event.expected_attendees;
  const prevBudget = event.total_budget;

  // 1. Detect changes & identify affected agents
  const diff = detectEventDiff(event, req);

  // 2. Apply state updates to event entity
  if (req.expected_attendees !== undefined) event.expected_attendees = req.expected_attendees;
  if (req.total_budget !== undefined) event.total_budget = req.total_budget;
  if (req.date !== undefined) event.date = req.date;
  if (req.location !== undefined) event.location = req.location;
  if (req.requirements !== undefined) event.requirements = req.requirements;

  // 3. Re-run affected agents
  const venueResult = await runVenueAgent({
    eventId: event.id,
    location: event.location,
    expectedAttendees: event.expected_attendees,
    totalBudget: event.total_budget,
    requirements: event.requirements
  });

  const vendorResult = await runVendorAgent({
    eventId: event.id,
    eventType: event.type,
    expectedAttendees: event.expected_attendees,
    requirements: event.requirements
  });

  const budgetResult = await runBudgetAgent({
    eventId: event.id,
    totalBudget: event.total_budget,
    venue: venueResult.selectedVenue,
    selectedVendors: vendorResult.selectedVendors,
    expectedAttendees: event.expected_attendees
  });

  const scheduleResult = await runScheduleAgent({
    eventId: event.id,
    eventName: event.name,
    eventType: event.type,
    date: event.date,
    expectedAttendees: event.expected_attendees,
    venueName: venueResult.selectedVenue.name
  });

  const commResult = await runCommunicationAgent({
    eventId: event.id,
    eventName: event.name,
    date: event.date,
    venueName: venueResult.selectedVenue.name,
    expectedAttendees: event.expected_attendees,
    triggerReason: req.reason || 'EVENT_REQUIREMENTS_CHANGED',
    deltaSummary: diff.summary
  });

  // 4. Synthesize via Event Manager
  const managerResult = await runEventManager({
    event,
    venueResult,
    vendorResult,
    budgetResult,
    scheduleResult,
    commResult,
    isReplanning: true,
    deltaSummary: diff.summary
  });

  // 5. Store Replanning History Record
  const historyRecord: ReplanningHistory = {
    id: `replan-${Date.now()}`,
    event_id: event.id,
    timestamp: new Date().toISOString(),
    change_trigger: req.reason || 'User modified event parameters',
    previous_attendees: prevAttendees,
    new_attendees: event.expected_attendees,
    previous_budget: prevBudget,
    new_budget: event.total_budget,
    affected_agents: diff.affected_agents,
    delta_summary: diff.summary,
    resolution_strategy: budgetResult.budget.is_over_budget
      ? `Venue re-checked (${venueResult.selectedVenue.name}). Budget threshold breached by ₹${safeFormatINR(budgetResult.budget.over_budget_amount)}; ${budgetResult.alternatives.length} alternatives generated.`
      : `All vendor allocations dynamically auto-scaled. Plan optimized within budget.`,
    status: budgetResult.budget.is_over_budget ? 'Requires Attention' : 'Completed'
  };

  db.addReplanningHistory(event.id, historyRecord);

  // 6. Save updated plan to event entity
  event.plan = managerResult.plan;
  event.status = budgetResult.budget.is_over_budget ? 'Replanning Needed' : 'Confirmed';
  db.saveEvent(event);

  return {
    plan: managerResult.plan,
    history: historyRecord,
    diffSummary: diff.summary
  };
}
