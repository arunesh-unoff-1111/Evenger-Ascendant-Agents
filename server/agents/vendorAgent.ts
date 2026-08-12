import { SelectedVendor, AgentActionLog } from '../types.js';
import { db } from '../db.js';
import { calculateVendorCost, safeFormatINR } from '../calculations.js';
import { generateAgentResponse } from '../aiService.js';

export interface VendorAgentInput {
  eventId: string;
  eventType: string;
  expectedAttendees: number;
  requirements: string[];
}

export interface VendorAgentOutput {
  selectedVendors: SelectedVendor[];
  totalVendorCost: number;
  notes: string;
  actionLog: AgentActionLog;
}

export async function runVendorAgent(input: VendorAgentInput): Promise<VendorAgentOutput> {
  const startTime = Date.now();
  const allVendors = db.getVendors();

  // Select 1 top vendor per category relevant to requirements
  const categoriesNeeded = ['Catering', 'Audio/Visual', 'Infrastructure', 'Security', 'Decor & Staging', 'Photography'];
  const selectedVendors: SelectedVendor[] = [];

  for (const cat of categoriesNeeded) {
    const catVendors = allVendors.filter(v => v.category === cat);
    if (catVendors.length > 0) {
      // Pick best matching vendor (defaults to highest rating)
      const bestVendor = catVendors.sort((a, b) => b.rating - a.rating)[0];
      const vendorCostItem = calculateVendorCost(bestVendor, input.expectedAttendees);
      selectedVendors.push(vendorCostItem);
    }
  }

  const totalVendorCost = selectedVendors.reduce((sum, v) => sum + v.calculated_cost, 0);

  // Gemini AI summary
  const systemPrompt = `You are the Vendor Agent for EventPilot AI.
Generate a JSON output in this schema:
{
  "notes": "2-sentence summary explaining how vendor quantities (catering meals, Wi-Fi bandwidth APs, security guards) scaled to ${input.expectedAttendees} attendees."
}`;

  const userPrompt = `Event Type: ${input.eventType}
Attendees: ${input.expectedAttendees}
Selected Vendors: ${selectedVendors.map(v => `${v.category}: ${v.vendor_name} (₹${v.calculated_cost})`).join(', ')}`;

  let notes = `Vendor requirements successfully auto-scaled for ${input.expectedAttendees} attendees across Catering, AV, Fiber Internet, Security, Decor, and Media Production.`;

  const aiResultText = await generateAgentResponse(systemPrompt, userPrompt);
  if (aiResultText) {
    try {
      const parsed = JSON.parse(aiResultText);
      if (parsed.notes) notes = parsed.notes;
    } catch (e) {
      // Fallback
    }
  }

  const executionTime = Date.now() - startTime;
  const actionLog: AgentActionLog = {
    id: `act-${Date.now()}-vendor`,
    event_id: input.eventId,
    agent_name: 'Vendor Agent',
    action_type: 'VENDOR_SELECTION_AND_QUANTITY_SCALING',
    input_summary: `Scaled ${selectedVendors.length} vendors for ${input.expectedAttendees} attendees`,
    output_summary: `Total calculated vendor cost: ₹${safeFormatINR(totalVendorCost)} across ${selectedVendors.length} vendor categories`,
    status: 'Success',
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
    details: { selectedVendors, totalVendorCost }
  };

  db.logAgentAction(actionLog);

  return {
    selectedVendors,
    totalVendorCost,
    notes,
    actionLog
  };
}
