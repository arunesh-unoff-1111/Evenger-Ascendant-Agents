import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateInitialPlan, executeDynamicReplan } from './server/orchestrator.js';
import { EventEntity, ReplanRequest, Guest, RSVP, CommunicationMessage } from './server/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS and JSON Middleware headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Healthcheck API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'EventPilot AI Backend', timestamp: new Date().toISOString() });
  });

  // 1. GET /api/events - List all events
  app.get('/api/events', (_req, res) => {
    const events = db.getAllEvents();
    res.json(events);
  });

  // 2. POST /api/events - Create new event
  app.post('/api/events', async (req, res) => {
    try {
      const { name, type, date, location, expected_attendees, total_budget, requirements } = req.body;
      if (!name || !expected_attendees || !total_budget) {
        return res.status(400).json({ error: 'Missing required fields: name, expected_attendees, total_budget' });
      }

      const newEvent: EventEntity = {
        id: `evt-${Date.now()}`,
        name,
        type: type || 'Conference',
        date: date || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        location: location || 'Bangalore, India',
        expected_attendees: Number(expected_attendees),
        total_budget: Number(total_budget),
        currency: 'INR (₹)',
        requirements: requirements || ['Wi-Fi', 'Food', 'Projectors', 'Power backup', 'Security'],
        status: 'Planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.saveEvent(newEvent);

      // Auto-trigger plan generation
      const plan = await generateInitialPlan(newEvent.id);
      const updatedEvent = db.getEventById(newEvent.id);

      res.status(201).json(updatedEvent || newEvent);
    } catch (err: any) {
      console.error('[EventPilot API Error] Create Event failed:', err);
      res.status(500).json({ error: err.message || 'Failed to create event' });
    }
  });

  // 3. GET /api/events/:id - Get event details
  app.get('/api/events/:id', async (req, res) => {
    const event = db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Auto generate initial plan if not present
    if (!event.plan) {
      try {
        await generateInitialPlan(event.id);
      } catch (e) {
        console.error('Initial plan generation auto-fallback error:', e);
      }
    }

    res.json(db.getEventById(req.params.id) || event);
  });

  // 4. POST /api/events/:id/plan - Generate/Regenerate initial plan
  app.post('/api/events/:id/plan', async (req, res) => {
    try {
      const plan = await generateInitialPlan(req.params.id);
      res.json(plan);
    } catch (err: any) {
      console.error('Plan generation error stack:', err);
      res.status(500).json({ error: err.message || 'Plan generation failed' });
    }
  });

  // 5. POST /api/events/:id/replan - DYNAMIC REPLANNING ENDPOINT
  app.post('/api/events/:id/replan', async (req, res) => {
    try {
      const { expected_attendees, total_budget, date, location, requirements, reason } = req.body;
      const replanReq: ReplanRequest = {
        expected_attendees: expected_attendees !== undefined ? Number(expected_attendees) : undefined,
        total_budget: total_budget !== undefined ? Number(total_budget) : undefined,
        date,
        location,
        requirements,
        reason: reason || 'User triggered event parameter modification'
      };

      const result = await executeDynamicReplan(req.params.id, replanReq);
      const updatedEvent = db.getEventById(req.params.id);

      res.json({
        success: true,
        event: updatedEvent,
        plan: result.plan,
        history: result.history,
        diff_summary: result.diffSummary
      });
    } catch (err: any) {
      console.error('[EventPilot API Error] Dynamic Replanning failed:', err);
      res.status(500).json({ error: err.message || 'Dynamic replanning failed' });
    }
  });

  // 6. GET /api/events/:id/history - Replanning History
  app.get('/api/events/:id/history', (req, res) => {
    const history = db.getReplanningHistory(req.params.id);
    res.json(history);
  });

  // 7. GET /api/events/:id/agent-actions - Agent Action Logs
  app.get('/api/events/:id/agent-actions', (req, res) => {
    const actions = db.getAgentActionsByEvent(req.params.id);
    res.json(actions);
  });

  // 8. GET /api/venues - Venues list
  app.get('/api/venues', (_req, res) => {
    res.json(db.getVenues());
  });

  // 9. GET /api/vendors - Vendors list
  app.get('/api/vendors', (_req, res) => {
    res.json(db.getVendors());
  });

  // 10. Guests & RSVPs
  app.get('/api/events/:id/guests', (req, res) => {
    res.json(db.getGuestsByEvent(req.params.id));
  });

  app.post('/api/events/:id/guests', (req, res) => {
    const { name, email, phone, role, dietary_requirements, plus_ones } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const guest: Guest = {
      id: `g-${Date.now()}`,
      event_id: req.params.id,
      name,
      email,
      phone: phone || '',
      role: role || 'Attendee',
      rsvp_status: 'Pending',
      dietary_requirements,
      plus_ones: Number(plus_ones) || 0
    };
    db.addGuest(req.params.id, guest);
    res.status(201).json(guest);
  });

  app.post('/api/events/:id/rsvps', (req, res) => {
    const { guest_id, status, responding_count, dietary_notes } = req.body;
    const rsvp: RSVP = {
      id: `rsvp-${guest_id || Date.now()}`,
      event_id: req.params.id,
      guest_id,
      guest_name: req.body.guest_name || 'Guest',
      status: status || 'Attending',
      responding_count: Number(responding_count) || 1,
      dietary_notes,
      updated_at: new Date().toISOString()
    };
    db.saveRSVP(req.params.id, rsvp);
    res.json(rsvp);
  });

  // 11. Messages & Communications
  app.get('/api/events/:id/messages', (req, res) => {
    res.json(db.getMessagesByEvent(req.params.id));
  });

  app.post('/api/events/:id/messages/send', (req, res) => {
    const { recipient_type, recipient_target, channel, title, content, trigger_reason } = req.body;
    const message: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      event_id: req.params.id,
      recipient_type: recipient_type || 'all',
      recipient_target: recipient_target || 'All Event Stakeholders',
      channel: channel || 'Email',
      title: title || 'Event Update',
      content: content || 'Logistics and timeline update.',
      status: 'Sent',
      created_at: new Date().toISOString(),
      trigger_reason: trigger_reason || 'Manual Dispatch'
    };
    db.addMessage(req.params.id, message);
    res.status(201).json(message);
  });

  // Mount Vite middleware for development or serve static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EventPilot AI] Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
