import { Venue, Vendor, EventEntity, Guest, RSVP, CommunicationMessage, AgentActionLog, ReplanningHistory } from './types.js';

export const SEED_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'CyberCity Grand Auditorium & Arena',
    location: 'Tech Corridor, Sector 5, City Center',
    city: 'Bangalore',
    capacity: 1000,
    cost_per_day: 150000,
    features: ['High-Speed Wi-Fi', 'Dual 4K Projectors', '3-Phase Power Backup', 'Acoustic Soundproofing', 'VIP Lounge', 'Security Desk'],
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    contact_email: 'events@cybercityhall.com',
    suitable_event_types: ['Hackathon', 'Conference', 'Tech Summit', 'Product Launch']
  },
  {
    id: 'venue-2',
    name: 'Silicon Pavilion Expo Center',
    location: 'Whitefield Innovation Hub',
    city: 'Bangalore',
    capacity: 750,
    cost_per_day: 110000,
    features: ['Gigabit Fiber', 'Stage Lighting Array', 'Power Backup', 'Food Court Area', '200 Car Parking'],
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    contact_email: 'booking@siliconpavilion.io',
    suitable_event_types: ['Hackathon', 'Developer Meetup', 'Exhibition']
  },
  {
    id: 'venue-3',
    name: 'InnovateSpace Community Hall',
    location: 'Koramangala 4th Block',
    city: 'Bangalore',
    capacity: 450,
    cost_per_day: 65000,
    features: ['Wi-Fi 6', 'Single HD Projector', 'Basic Sound System', 'Breakout Rooms', 'Coffee Bar'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    contact_email: 'hello@innovatespace.co',
    suitable_event_types: ['Hackathon', 'Workshop', 'Networking']
  },
  {
    id: 'venue-4',
    name: 'Apex Imperial Convention Hall',
    location: 'Outer Ring Road, Marathahalli',
    city: 'Bangalore',
    capacity: 1500,
    cost_per_day: 220000,
    features: ['High-Density Wi-Fi', 'LED Wall Stage', 'Central AC', 'Full Power Generator', 'In-house Security Team', '500 Car Parking'],
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    contact_email: 'events@apeximperial.com',
    suitable_event_types: ['Conference', 'Hackathon', 'Gala', 'Corporate Summit']
  }
];

export const SEED_VENDORS: Vendor[] = [
  {
    id: 'vendor-cat-1',
    name: 'ByteBites Tech Catering',
    category: 'Catering',
    pricing_type: 'per_attendee',
    base_cost: 20000,
    unit_cost_per_attendee: 350,
    rating: 4.8,
    contact_email: 'orders@bytebites.in',
    description: 'Specialized 24/7 catering for hackathons & tech events. Includes midnight snacks, unlimited coffee, live counters, and high-protein buffet.',
    features: ['24/7 Refreshment Station', 'Midnight Pizza & Tacos', 'Dietary/Vegan Options', 'Eco-friendly Cutlery']
  },
  {
    id: 'vendor-cat-2',
    name: 'Royal Banquet Hospitality',
    category: 'Catering',
    pricing_type: 'per_attendee',
    base_cost: 30000,
    unit_cost_per_attendee: 550,
    rating: 4.9,
    contact_email: 'events@royalbanquet.com',
    description: 'Premium multi-cuisine dining with live chef stations and mocktail bars.',
    features: ['3-Course Plated Meal', 'Live Waffle Station', 'Barista Coffee Bar', 'Uniformed Staff']
  },
  {
    id: 'vendor-av-1',
    name: 'Apex Sound & Vision Production',
    category: 'Audio/Visual',
    pricing_type: 'per_attendee',
    base_cost: 35000,
    unit_cost_per_attendee: 40,
    rating: 4.8,
    contact_email: 'tech@apexav.com',
    description: 'State-of-the-art concert audio, stage LED screens, wireless lapel mics, and live streaming rigs.',
    features: ['Live Streaming Setup', 'Wireless Mics', 'Stage LED Panels', 'On-site AV Tech Team']
  },
  {
    id: 'vendor-infra-1',
    name: 'GigaBand Event Network & Power',
    category: 'Infrastructure',
    pricing_type: 'per_attendee',
    base_cost: 25000,
    unit_cost_per_attendee: 30,
    rating: 4.9,
    contact_email: 'support@gigaband.io',
    description: 'Enterprise dual-WAN redundant fiber deployment, high-density access points (1000+ devices), and heavy-duty DG power backup.',
    features: ['Redundant Fiber', 'High-Density Access Points', 'Silent Diesel Generators', 'Lan Extension Cords']
  },
  {
    id: 'vendor-sec-1',
    name: 'ShieldGuard Event Security',
    category: 'Security',
    pricing_type: 'per_attendee',
    base_cost: 15000,
    unit_cost_per_attendee: 20,
    rating: 4.7,
    contact_email: 'dispatch@shieldguard.com',
    description: 'Licensed security personnel, metal detectors, RFID badge scanning kiosks, and crowd control barriers.',
    features: ['RFID Gate Scanning', '24/7 Patrol', 'First Aid Station Staff', 'Crowd Barriers']
  },
  {
    id: 'vendor-decor-1',
    name: 'Matrix Stage Design & Signage',
    category: 'Decor & Staging',
    pricing_type: 'per_attendee',
    base_cost: 25000,
    unit_cost_per_attendee: 25,
    rating: 4.6,
    contact_email: 'info@matrixdecor.com',
    description: 'Custom hackathon backdrop, sponsor booths, directional signage, photo ops, and ambient LED ambient lighting.',
    features: ['Sponsor Booth Wall', 'Main Stage Backdrop', 'Directional Signage', 'Photo Booth']
  },
  {
    id: 'vendor-photo-1',
    name: 'LensCraft Media & Video',
    category: 'Photography',
    pricing_type: 'fixed',
    base_cost: 45000,
    unit_cost_per_attendee: 0,
    rating: 4.9,
    contact_email: 'creatives@lenscraft.media',
    description: 'Full-day event photography, drone aerials, highlight reel video editing, and instant digital photo delivery portal.',
    features: ['4K Camera Crews', '48-Hour Highlight Reel', 'Drone Coverage', 'Real-time Photo Feed']
  }
];

// In-memory Database Store
class EventPilotDatabase {
  private events: Map<string, EventEntity> = new Map();
  private guests: Map<string, Guest[]> = new Map();
  private rsvps: Map<string, RSVP[]> = new Map();
  private messages: Map<string, CommunicationMessage[]> = new Map();
  private agentActions: Map<string, AgentActionLog[]> = new Map();
  private replanningHistory: Map<string, ReplanningHistory[]> = new Map();

  constructor() {
    this.seedInitialEvent();
  }

  private seedInitialEvent() {
    const seedEventId = 'evt-hackathon-2026';
    const sampleEvent: EventEntity = {
      id: seedEventId,
      name: 'College Tech Innovation Hackathon',
      type: 'College Hackathon',
      date: '2026-09-20',
      location: 'Bangalore, India',
      expected_attendees: 500,
      total_budget: 500000,
      currency: 'INR (₹)',
      requirements: ['Wi-Fi', 'Food', 'Projectors', 'Power backup', 'Security'],
      status: 'Planning',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.events.set(seedEventId, sampleEvent);

    // Seed Guests
    const initialGuests: Guest[] = [
      { id: 'g-1', event_id: seedEventId, name: 'Dr. Anita Roy', email: 'anita.roy@university.edu', phone: '+91 98765 43210', role: 'VIP', rsvp_status: 'Attending', plus_ones: 0, dietary_requirements: 'Vegetarian' },
      { id: 'g-2', event_id: seedEventId, name: 'Vikram Malhotra', email: 'vikram@techfund.vc', phone: '+91 98765 11223', role: 'Sponsor', rsvp_status: 'Attending', plus_ones: 1 },
      { id: 'g-3', event_id: seedEventId, name: 'Siddharth Rao', email: 'sid@ai.org', phone: '+91 98123 45678', role: 'Speaker', rsvp_status: 'Attending', plus_ones: 0 },
      { id: 'g-4', event_id: seedEventId, name: 'Priya Sharma', email: 'priya@student.edu', phone: '+91 99887 76655', role: 'Attendee', rsvp_status: 'Pending', plus_ones: 0 },
      { id: 'g-5', event_id: seedEventId, name: 'Rahul Verma', email: 'rahul@student.edu', phone: '+91 97766 55443', role: 'Attendee', rsvp_status: 'Attending', plus_ones: 0 }
    ];
    this.guests.set(seedEventId, initialGuests);

    // Seed RSVPs
    const initialRSVPs: RSVP[] = initialGuests.map(g => ({
      id: `rsvp-${g.id}`,
      event_id: seedEventId,
      guest_id: g.id,
      guest_name: g.name,
      status: g.rsvp_status,
      responding_count: 1 + g.plus_ones,
      dietary_notes: g.dietary_requirements,
      updated_at: new Date().toISOString()
    }));
    this.rsvps.set(seedEventId, initialRSVPs);

    this.messages.set(seedEventId, []);
    this.agentActions.set(seedEventId, []);
    this.replanningHistory.set(seedEventId, []);
  }

  // Event CRUD
  getAllEvents(): EventEntity[] {
    return Array.from(this.events.values());
  }

  getEventById(id: string): EventEntity | undefined {
    return this.events.get(id);
  }

  saveEvent(event: EventEntity): EventEntity {
    event.updated_at = new Date().toISOString();
    this.events.set(event.id, event);
    return event;
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }

  // Guests & RSVPs
  getGuestsByEvent(eventId: string): Guest[] {
    return this.guests.get(eventId) || [];
  }

  addGuest(eventId: string, guest: Guest): Guest {
    const list = this.getGuestsByEvent(eventId);
    list.push(guest);
    this.guests.set(eventId, list);

    // Also add default RSVP record
    const rsvp: RSVP = {
      id: `rsvp-${guest.id}`,
      event_id: eventId,
      guest_id: guest.id,
      guest_name: guest.name,
      status: guest.rsvp_status,
      responding_count: 1 + guest.plus_ones,
      dietary_notes: guest.dietary_requirements,
      updated_at: new Date().toISOString()
    };
    this.saveRSVP(eventId, rsvp);

    return guest;
  }

  getRSVPsByEvent(eventId: string): RSVP[] {
    return this.rsvps.get(eventId) || [];
  }

  saveRSVP(eventId: string, rsvp: RSVP): RSVP {
    const list = this.getRSVPsByEvent(eventId);
    const index = list.findIndex(r => r.id === rsvp.id || r.guest_id === rsvp.guest_id);
    if (index >= 0) {
      list[index] = rsvp;
    } else {
      list.push(rsvp);
    }
    this.rsvps.set(eventId, list);
    return rsvp;
  }

  // Messages
  getMessagesByEvent(eventId: string): CommunicationMessage[] {
    return this.messages.get(eventId) || [];
  }

  addMessage(eventId: string, message: CommunicationMessage): CommunicationMessage {
    const list = this.getMessagesByEvent(eventId);
    list.unshift(message);
    this.messages.set(eventId, list);
    return message;
  }

  // Agent Actions
  getAgentActionsByEvent(eventId: string): AgentActionLog[] {
    return this.agentActions.get(eventId) || [];
  }

  logAgentAction(action: AgentActionLog): AgentActionLog {
    const list = this.agentActions.get(action.event_id) || [];
    list.unshift(action);
    this.agentActions.set(action.event_id, list);
    return action;
  }

  // Replanning History
  getReplanningHistory(eventId: string): ReplanningHistory[] {
    return this.replanningHistory.get(eventId) || [];
  }

  addReplanningHistory(eventId: string, history: ReplanningHistory): ReplanningHistory {
    const list = this.getReplanningHistory(eventId);
    list.unshift(history);
    this.replanningHistory.set(eventId, list);
    return history;
  }

  // Venues & Vendors Query
  getVenues(): Venue[] {
    return SEED_VENUES;
  }

  getVendors(): Vendor[] {
    return SEED_VENDORS;
  }
}

export const db = new EventPilotDatabase();
