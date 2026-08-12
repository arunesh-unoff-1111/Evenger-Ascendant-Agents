export interface Venue {
  id: string;
  name: string;
  location: string;
  city: string;
  capacity: number;
  cost_per_day: number;
  features: string[];
  rating: number;
  image_url: string;
  contact_email: string;
  suitable_event_types: string[];
}

export interface SelectedVendor {
  vendor_id: string;
  vendor_name: string;
  category: string;
  calculated_cost: number;
  unit_cost: number;
  quantity: number;
  notes: string;
}

export interface CostSavingAlternative {
  title: string;
  description: string;
  potential_savings: number;
  trade_off: string;
  action_type: string;
}

export interface VendorCostItem {
  vendor_id: string;
  vendor_name: string;
  category: string;
  calculated_cost: number;
  unit_cost: number;
  quantity: number;
  notes: string;
}

export interface BudgetBreakdown {
  id: string;
  event_id: string;
  total_budget: number;
  venue_cost: number;
  vendor_costs: VendorCostItem[];
  total_vendor_cost: number;
  contingency_cost: number;
  estimated_total: number;
  remaining_budget: number;
  is_over_budget: boolean;
  over_budget_amount: number;
  cost_saving_alternatives: CostSavingAlternative[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  description: string;
  responsible_party: string;
  category: string;
}

export interface CommunicationMessage {
  id: string;
  event_id: string;
  recipient_type: 'guest' | 'vendor' | 'all';
  recipient_target: string;
  channel: 'Email' | 'SMS' | 'Portal' | 'WhatsApp';
  title: string;
  content: string;
  status: 'Draft' | 'Sent' | 'Failed';
  created_at: string;
  trigger_reason: string;
}

export interface EventPlan {
  event_id: string;
  selected_venue: Venue;
  selected_vendors: SelectedVendor[];
  budget: BudgetBreakdown;
  schedule: ScheduleItem[];
  generated_messages: CommunicationMessage[];
  executive_summary: string;
  recommendations: string[];
  last_updated: string;
}

export interface EventEntity {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  expected_attendees: number;
  total_budget: number;
  currency: string;
  requirements: string[];
  status: 'Planning' | 'Active' | 'Completed' | 'Replanning';
  plan?: EventPlan;
  created_at: string;
  updated_at: string;
}

export interface ReplanningHistory {
  id: string;
  event_id: string;
  timestamp: string;
  change_trigger: string;
  previous_attendees: number;
  new_attendees: number;
  previous_budget: number;
  new_budget: number;
  affected_agents: string[];
  delta_summary: string;
  resolution_strategy: string;
  status: 'Completed' | 'Requires Attention';
}

export interface AgentActionLog {
  id: string;
  event_id: string;
  agent_name: 'Event Manager' | 'Venue Agent' | 'Vendor Agent' | 'Budget Agent' | 'Schedule Agent' | 'Communication Agent';
  action_type: string;
  input_summary: string;
  output_summary: string;
  status: 'Success' | 'Warning' | 'Error';
  execution_time_ms: number;
  timestamp: string;
  details?: Record<string, any>;
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'VIP' | 'Speaker' | 'Attendee' | 'Sponsor' | 'Press';
  rsvp_status: 'Attending' | 'Declined' | 'Pending' | 'Invited';
  dietary_requirements?: string;
  plus_ones: number;
}

export interface RSVP {
  id: string;
  event_id: string;
  guest_id: string;
  guest_name: string;
  status: 'Attending' | 'Declined' | 'Pending';
  responding_count: number;
  dietary_notes?: string;
  updated_at: string;
}

export interface ReplanResponse {
  success: boolean;
  event: EventEntity;
  plan: EventPlan;
  history: ReplanningHistory;
  diff_summary: string;
}

export type NavTab = 
  | 'Dashboard'
  | 'Events'
  | 'Planning'
  | 'Budget'
  | 'Venues'
  | 'Vendors'
  | 'Guests & RSVP'
  | 'Schedule'
  | 'Communications'
  | 'AI Agents'
  | 'Reports'
  | 'Settings';
