import { CommunicationMessage, AgentActionLog } from '../types.js';
import { db } from '../db.js';
import { generateAgentResponse } from '../aiService.js';

export interface CommunicationAgentInput {
  eventId: string;
  eventName: string;
  date: string;
  venueName: string;
  expectedAttendees: number;
  triggerReason: string;
  deltaSummary?: string;
}

export interface CommunicationAgentOutput {
  generatedMessages: CommunicationMessage[];
  actionLog: AgentActionLog;
}

export async function runCommunicationAgent(input: CommunicationAgentInput): Promise<CommunicationAgentOutput> {
  const startTime = Date.now();

  const messages: CommunicationMessage[] = [];

  // Message 1: Guest Broadcast Update
  const guestMsg: CommunicationMessage = {
    id: `msg-${Date.now()}-guest`,
    event_id: input.eventId,
    recipient_type: 'guest',
    recipient_target: 'All Registered Guests & Attendees',
    channel: 'Email',
    title: `[EventPilot Notice] Important Update: ${input.eventName}`,
    content: `Dear Attendee,\n\nWe are excited to welcome you to ${input.eventName} on ${input.date} at ${input.venueName}.\n\n` +
      (input.deltaSummary
        ? `Note on Plan Adjustment: ${input.deltaSummary}. All check-in passes and schedule details have been refreshed.`
        : `Please ensure you arrive by 08:00 AM for RFID badge pickup.`) +
      `\n\nLooking forward to an extraordinary event!`,
    status: 'Draft',
    created_at: new Date().toISOString(),
    trigger_reason: input.triggerReason
  };
  messages.push(guestMsg);

  // Message 2: Vendor Logistics Dispatch
  const vendorMsg: CommunicationMessage = {
    id: `msg-${Date.now()}-vendor`,
    event_id: input.eventId,
    recipient_type: 'vendor',
    recipient_target: 'Selected Vendor Partners (Catering, AV, Infra)',
    channel: 'Portal',
    title: `[Vendor Dispatch] Headcount & Logistics Update: ${input.eventName}`,
    content: `Attention Vendor Partners,\n\nOfficial headcount confirmation for ${input.eventName}:\n- Target Attendance: ${input.expectedAttendees} guests\n- Venue Location: ${input.venueName}\n- Date: ${input.date}\n\n` +
      `Please review and adjust line-item supply quantities and technician staff allocations accordingly.`,
    status: 'Draft',
    created_at: new Date().toISOString(),
    trigger_reason: input.triggerReason
  };
  messages.push(vendorMsg);

  // Gemini AI draft refinement
  const systemPrompt = `You are the Communication Agent for EventPilot AI.
Refine the guest notification email subject and content for clarity. Return JSON:
{
  "title": "Refined email subject line",
  "content": "Professional email body under 100 words"
}`;

  const userPrompt = `Event: ${input.eventName}
Date: ${input.date}
Venue: ${input.venueName}
Attendees: ${input.expectedAttendees}
Trigger: ${input.triggerReason}
Details: ${input.deltaSummary || 'Standard Event Invitation'}`;

  const aiResultText = await generateAgentResponse(systemPrompt, userPrompt);
  if (aiResultText) {
    try {
      const parsed = JSON.parse(aiResultText);
      if (parsed.title) guestMsg.title = parsed.title;
      if (parsed.content) guestMsg.content = parsed.content;
    } catch (e) {
      // Fallback
    }
  }

  // Save generated messages in DB
  for (const m of messages) {
    db.addMessage(input.eventId, m);
  }

  const executionTime = Date.now() - startTime;
  const actionLog: AgentActionLog = {
    id: `act-${Date.now()}-comm`,
    event_id: input.eventId,
    agent_name: 'Communication Agent',
    action_type: 'NOTIFICATION_DRAFTING_AND_DISPATCH',
    input_summary: `Drafted communications for ${input.triggerReason}`,
    output_summary: `Generated ${messages.length} communication drafts (Guest Broadcast & Vendor Dispatch)`,
    status: 'Success',
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
    details: { messagesCount: messages.length, triggerReason: input.triggerReason }
  };

  db.logAgentAction(actionLog);

  return {
    generatedMessages: messages,
    actionLog
  };
}
