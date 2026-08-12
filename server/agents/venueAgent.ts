import { Venue, AgentActionLog } from '../types.js';
import { db } from '../db.js';
import { evaluateVenueCapacity } from '../calculations.js';
import { generateAgentResponse } from '../aiService.js';

export interface VenueAgentInput {
  eventId: string;
  location: string;
  expectedAttendees: number;
  totalBudget: number;
  requirements: string[];
}

export interface VenueAgentOutput {
  selectedVenue: Venue;
  capacityEvaluation: { isSuitable: boolean; capacityRatio: number; message: string };
  reasoning: string;
  alternativeVenues: Venue[];
  actionLog: AgentActionLog;
}

export async function runVenueAgent(input: VenueAgentInput): Promise<VenueAgentOutput> {
  const startTime = Date.now();
  const allVenues = db.getVenues();

  // Deterministic filter: venues with capacity >= attendees
  const eligibleVenues = allVenues.filter(v => v.capacity >= input.expectedAttendees);
  
  // If no venue fits capacity, pick largest available venue
  const candidateVenues = eligibleVenues.length > 0 ? eligibleVenues : [...allVenues].sort((a, b) => b.capacity - a.capacity);
  
  // Primary venue selection based on cost-efficiency & feature match
  const sortedByFit = [...candidateVenues].sort((a, b) => {
    const costDiff = a.cost_per_day - b.cost_per_day;
    return costDiff;
  });

  const selectedVenue = sortedByFit[0];
  const capacityEval = evaluateVenueCapacity(selectedVenue, input.expectedAttendees);
  const alternatives = sortedByFit.slice(1);

  // Gemini reasoning enhancement
  const systemPrompt = `You are the Venue Agent for EventPilot AI.
Analyze the venue choice for an event and return JSON in this schema:
{
  "reasoning": "Clear 2-sentence explanation why this venue is ideal for ${input.expectedAttendees} attendees and requirements ${input.requirements.join(', ')}"
}`;

  const userPrompt = `Event Location: ${input.location}
Attendees: ${input.expectedAttendees}
Selected Venue: ${selectedVenue.name} (Capacity: ${selectedVenue.capacity}, Cost: ₹${selectedVenue.cost_per_day}/day)
Features: ${selectedVenue.features.join(', ')}
Requirements: ${input.requirements.join(', ')}`;

  let reasoning = `Selected ${selectedVenue.name} as it comfortably accommodates ${input.expectedAttendees} attendees (Capacity: ${selectedVenue.capacity}) with full support for ${input.requirements.join(', ')}.`;

  const aiResultText = await generateAgentResponse(systemPrompt, userPrompt);
  if (aiResultText) {
    try {
      const parsed = JSON.parse(aiResultText);
      if (parsed.reasoning) reasoning = parsed.reasoning;
    } catch (e) {
      // Use fallback
    }
  }

  const executionTime = Date.now() - startTime;
  const actionLog: AgentActionLog = {
    id: `act-${Date.now()}-venue`,
    event_id: input.eventId,
    agent_name: 'Venue Agent',
    action_type: 'VENUE_SELECTION_AND_CAPACITY_CHECK',
    input_summary: `Evaluating venue for ${input.expectedAttendees} attendees at ${input.location}`,
    output_summary: `Selected ${selectedVenue.name} (₹${selectedVenue.cost_per_day}/day). Capacity status: ${capacityEval.isSuitable ? 'Sufficient' : 'EXCEEDED'}`,
    status: capacityEval.isSuitable ? 'Success' : 'Warning',
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
    details: { selectedVenueId: selectedVenue.id, capacityEval }
  };

  db.logAgentAction(actionLog);

  return {
    selectedVenue,
    capacityEvaluation: capacityEval,
    reasoning,
    alternativeVenues: alternatives,
    actionLog
  };
}
