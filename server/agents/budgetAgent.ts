import { Venue, SelectedVendor, BudgetBreakdown, CostAlternative, AgentActionLog } from '../types.js';
import { db } from '../db.js';
import { calculateBudgetBreakdown, generateCostSavingAlternatives, safeFormatINR } from '../calculations.js';
import { generateAgentResponse } from '../aiService.js';

export interface BudgetAgentInput {
  eventId: string;
  totalBudget: number;
  venue: Venue;
  selectedVendors: SelectedVendor[];
  expectedAttendees: number;
}

export interface BudgetAgentOutput {
  budget: BudgetBreakdown;
  alternatives: CostAlternative[];
  analysis: string;
  actionLog: AgentActionLog;
}

export async function runBudgetAgent(input: BudgetAgentInput): Promise<BudgetAgentOutput> {
  const startTime = Date.now();
  const safeTotalBudget = Number(input.totalBudget) || 500000;

  // Deterministic math calculation
  const budget = calculateBudgetBreakdown(
    safeTotalBudget,
    input.venue?.cost_per_day || 0,
    input.selectedVendors || []
  );
  budget.event_id = input.eventId;

  let alternatives: CostAlternative[] = [];

  if (budget.is_over_budget) {
    const allVenues = db.getVenues();
    const allVendors = db.getVendors();
    alternatives = generateCostSavingAlternatives(
      budget.over_budget_amount,
      allVenues,
      allVendors,
      input.venue,
      input.selectedVendors,
      input.expectedAttendees
    );
    budget.cost_saving_alternatives = alternatives;
  }

  // Gemini AI Analysis
  const systemPrompt = `You are the Budget Agent for EventPilot AI.
Analyze the event budget and return JSON:
{
  "analysis": "2-sentence executive budget audit summarizing budget efficiency and risk factors."
}`;

  const userPrompt = `Total Budget: ₹${safeFormatINR(safeTotalBudget)}
Estimated Cost: ₹${safeFormatINR(budget.estimated_total)}
Status: ${budget.is_over_budget ? `OVER BUDGET by ₹${safeFormatINR(budget.over_budget_amount)}` : `UNDER BUDGET with ₹${safeFormatINR(budget.remaining_budget)} reserve`}
Venue Cost: ₹${safeFormatINR(budget.venue_cost)}
Vendor Cost: ₹${safeFormatINR(budget.total_vendor_cost)}
Contingency: ₹${safeFormatINR(budget.contingency_cost)}`;

  let analysis = budget.is_over_budget
    ? `Budget threshold exceeded by ₹${safeFormatINR(budget.over_budget_amount)}. Cost optimization alternatives generated.`
    : `Total projected cost of ₹${safeFormatINR(budget.estimated_total)} is within the target ₹${safeFormatINR(safeTotalBudget)} budget, maintaining a ₹${safeFormatINR(budget.remaining_budget)} safety buffer.`;

  const aiResultText = await generateAgentResponse(systemPrompt, userPrompt);
  if (aiResultText) {
    try {
      const parsed = JSON.parse(aiResultText);
      if (parsed.analysis) analysis = parsed.analysis;
    } catch (e) {
      // Fallback
    }
  }

  const executionTime = Date.now() - startTime;
  const actionLog: AgentActionLog = {
    id: `act-${Date.now()}-budget`,
    event_id: input.eventId,
    agent_name: 'Budget Agent',
    action_type: 'BUDGET_AUDIT_AND_CONTINGENCY_CALCULATION',
    input_summary: `Auditing budget of ₹${safeFormatINR(safeTotalBudget)} against estimated expenses of ₹${safeFormatINR(budget.estimated_total)}`,
    output_summary: budget.is_over_budget
      ? `OVER BUDGET: Exceeds by ₹${safeFormatINR(budget.over_budget_amount)}. ${alternatives.length} cost-saving options proposed.`
      : `WITHIN BUDGET: ₹${safeFormatINR(budget.remaining_budget)} remaining contingency balance`,
    status: budget.is_over_budget ? 'Warning' : 'Success',
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
    details: { budget, alternativesCount: alternatives.length }
  };

  db.logAgentAction(actionLog);

  return {
    budget,
    alternatives,
    analysis,
    actionLog
  };
}
