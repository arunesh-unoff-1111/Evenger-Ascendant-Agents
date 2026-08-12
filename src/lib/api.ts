import { 
  EventEntity, 
  EventPlan, 
  ReplanningHistory, 
  AgentActionLog, 
  Venue, 
  Guest, 
  RSVP, 
  CommunicationMessage, 
  ReplanResponse 
} from '../types';

const API_BASE = '/api';

export async function fetchAllEvents(): Promise<EventEntity[]> {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(eventId: string): Promise<EventEntity> {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  if (!res.ok) throw new Error(`Failed to fetch event ${eventId}`);
  return res.json();
}

export async function createNewEvent(payload: {
  name: string;
  type?: string;
  date?: string;
  location?: string;
  expected_attendees: number;
  total_budget: number;
  requirements?: string[];
}): Promise<EventEntity> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create event');
  }
  return res.json();
}

export async function generateEventPlan(eventId: string): Promise<EventPlan> {
  const res = await fetch(`${API_BASE}/events/${eventId}/plan`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate event plan');
  }
  return res.json();
}

export async function triggerDynamicReplan(
  eventId: string,
  payload: {
    expected_attendees?: number;
    total_budget?: number;
    date?: string;
    location?: string;
    requirements?: string[];
    reason?: string;
  }
): Promise<ReplanResponse> {
  const res = await fetch(`${API_BASE}/events/${eventId}/replan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Dynamic replanning failed');
  }
  return res.json();
}

export async function fetchReplanningHistory(eventId: string): Promise<ReplanningHistory[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/history`);
  if (!res.ok) throw new Error('Failed to fetch replanning history');
  return res.json();
}

export async function fetchAgentActions(eventId: string): Promise<AgentActionLog[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/agent-actions`);
  if (!res.ok) throw new Error('Failed to fetch agent action logs');
  return res.json();
}

export async function fetchAllVenues(): Promise<Venue[]> {
  const res = await fetch(`${API_BASE}/venues`);
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function fetchAllVendors(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/vendors`);
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
}

export async function fetchGuests(eventId: string): Promise<Guest[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests`);
  if (!res.ok) throw new Error('Failed to fetch guests');
  return res.json();
}

export async function createGuest(
  eventId: string,
  guestData: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    dietary_requirements?: string;
    plus_ones?: number;
  }
): Promise<Guest> {
  const res = await fetch(`${API_BASE}/events/${eventId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guestData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add guest');
  }
  return res.json();
}

export async function submitRSVP(
  eventId: string,
  rsvpData: {
    guest_id: string;
    guest_name?: string;
    status: 'Attending' | 'Declined' | 'Pending';
    responding_count?: number;
    dietary_notes?: string;
  }
): Promise<RSVP> {
  const res = await fetch(`${API_BASE}/events/${eventId}/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rsvpData)
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

export async function fetchMessages(eventId: string): Promise<CommunicationMessage[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(
  eventId: string,
  msgPayload: {
    recipient_type?: string;
    recipient_target?: string;
    channel?: string;
    title: string;
    content: string;
    trigger_reason?: string;
  }
): Promise<CommunicationMessage> {
  const res = await fetch(`${API_BASE}/events/${eventId}/messages/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msgPayload)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export function formatCurrencyINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);
  const formatted = absVal.toLocaleString('en-IN');
  return `${isNegative ? '-₹' : '₹'}${formatted}`;
}
