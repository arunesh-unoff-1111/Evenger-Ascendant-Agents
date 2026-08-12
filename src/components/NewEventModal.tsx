import React, { useState } from 'react';
import { PlusCircle, Sparkles, X, Calendar, MapPin, Users, IndianRupee } from 'lucide-react';
import { createNewEvent } from '../lib/api';
import { EventEntity } from '../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventEntity) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Hackathon');
  const [date, setDate] = useState('2026-10-15');
  const [location, setLocation] = useState('Bangalore, India');
  const [attendees, setAttendees] = useState(600);
  const [budget, setBudget] = useState(600000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendees || !budget) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createNewEvent({
        name,
        type,
        date,
        location,
        expected_attendees: Number(attendees),
        total_budget: Number(budget),
        requirements: ['High-speed Wi-Fi', 'Gourmet Catering', 'A/V Stage', 'Security']
      });

      onEventCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0e1017] border-2 border-red-600 rounded-lg p-6 max-w-lg w-full shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-red-900/40">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-red-400" />
            Initialize New Event Scope
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950 border border-red-500 text-red-200 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-400 uppercase block mb-1">Event Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Innovation Summit 2026"
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 uppercase block mb-1">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Conference">Conference</option>
                <option value="Tech Summit">Tech Summit</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Gala Dinner">Gala Dinner</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 uppercase block mb-1">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 uppercase block mb-1">Headcount (Attendees)</label>
              <input
                type="number"
                required
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 uppercase block mb-1">Total Budget (₹)</label>
              <input
                type="number"
                required
                step={50000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 uppercase block mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-red-900/30">
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Synthesizing...' : 'Create & Synthesize Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
