import { ScheduleItem, AgentActionLog } from '../types.js';
import { db } from '../db.js';
import { generateAgentResponse } from '../aiService.js';

export interface ScheduleAgentInput {
  eventId: string;
  eventName: string;
  eventType: string;
  date: string;
  expectedAttendees: number;
  venueName: string;
}

export interface ScheduleAgentOutput {
  schedule: ScheduleItem[];
  reasoning: string;
  actionLog: AgentActionLog;
}

export async function runScheduleAgent(input: ScheduleAgentInput): Promise<ScheduleAgentOutput> {
  const startTime = Date.now();

  // Registration window scales dynamically based on attendee count
  const regWindowMinutes = input.expectedAttendees > 600 ? 90 : 60;
  const regStartTime = "08:00 AM";
  const regEndTime = regWindowMinutes === 90 ? "09:30 AM" : "09:00 AM";
  const keynoteTime = regWindowMinutes === 90 ? "09:30 AM - 10:30 AM" : "09:00 AM - 10:00 AM";

  const defaultSchedule: ScheduleItem[] = [
    {
      id: `sch-1`,
      time: `${regStartTime} - ${regEndTime}`,
      activity: `Participant Check-in & RFID Badge Distribution`,
      location: `${input.venueName} - Main Lobby`,
      description: `Check-in desk with ${Math.ceil(input.expectedAttendees / 100)} active RFID scanning kiosks for ${input.expectedAttendees} attendees.`,
      responsible_party: 'ShieldGuard Security & Volunteer Team',
      category: 'Logistics'
    },
    {
      id: `sch-2`,
      time: keynoteTime,
      activity: 'Opening Ceremony & Keynote Address',
      location: `${input.venueName} - Main Stage`,
      description: 'Welcome address, problem statement announcement, and hackathon rules breakdown.',
      responsible_party: 'Organizing Committee',
      category: 'Main Session'
    },
    {
      id: `sch-3`,
      time: '10:30 AM - 01:00 PM',
      activity: 'Hacking Sprint 1 & Technical Mentorship',
      location: `${input.venueName} - Innovation Bay`,
      description: 'Teams commence building. Mentor office hours open.',
      responsible_party: 'Technical Mentors',
      category: 'Breakout'
    },
    {
      id: `sch-4`,
      time: '01:00 PM - 02:00 PM',
      activity: 'Networking Buffet Lunch',
      location: `${input.venueName} - Dining Lawn`,
      description: `Multi-cuisine buffet served by ByteBites Catering for ${input.expectedAttendees} attendees.`,
      responsible_party: 'ByteBites Catering Team',
      category: 'Food & Beverage'
    },
    {
      id: `sch-5`,
      time: '02:00 PM - 06:00 PM',
      activity: 'Hacking Sprint 2 & Sponsor Expo',
      location: `${input.venueName} - Main Hall`,
      description: 'Mid-way checkpoint & sponsor interactive workshops.',
      responsible_party: 'Sponsor Leads',
      category: 'Networking'
    },
    {
      id: `sch-6`,
      time: '06:00 PM - 08:00 PM',
      activity: 'Project Submissions, Pitching & Grand Finale',
      location: `${input.venueName} - Auditorium`,
      description: 'Top 10 finalist team demos, jury evaluation, and prize ceremony.',
      responsible_party: 'Jury Panel & Hosts',
      category: 'Closing'
    }
  ];

  // Gemini AI schedule enhancement
  const systemPrompt = `You are the Schedule Agent for EventPilot AI.
Return JSON:
{
  "reasoning": "2-sentence explanation of schedule timing adjustments tailored for ${input.expectedAttendees} attendees."
}`;

  const userPrompt = `Event: ${input.eventName} (${input.eventType})
Date: ${input.date}
Attendees: ${input.expectedAttendees}
Venue: ${input.venueName}`;

  let reasoning = `Schedule calibrated for ${input.expectedAttendees} attendees, allocating a ${regWindowMinutes}-minute check-in buffer to prevent hall entry bottlenecks.`;

  const aiResultText = await generateAgentResponse(systemPrompt, userPrompt);
  if (aiResultText) {
    try {
      const parsed = JSON.parse(aiResultText);
      if (parsed.reasoning) reasoning = parsed.reasoning;
    } catch (e) {
      // Fallback
    }
  }

  const executionTime = Date.now() - startTime;
  const actionLog: AgentActionLog = {
    id: `act-${Date.now()}-schedule`,
    event_id: input.eventId,
    agent_name: 'Schedule Agent',
    action_type: 'SCHEDULE_GENERATION_AND_TL_CALIBRATION',
    input_summary: `Generated ${defaultSchedule.length}-slot timeline for ${input.expectedAttendees} attendees`,
    output_summary: `Timeline finalized with ${regWindowMinutes}-min check-in window at ${input.venueName}`,
    status: 'Success',
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
    details: { itemsCount: defaultSchedule.length, regWindowMinutes }
  };

  db.logAgentAction(actionLog);

  return {
    schedule: defaultSchedule,
    reasoning,
    actionLog
  };
}
