import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  Star, 
  Mail, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { Venue, EventEntity } from '../types';
import { fetchAllVenues, formatCurrencyINR } from '../lib/api';

interface VenuesViewProps {
  currentEvent: EventEntity;
}

export const VenuesView: React.FC<VenuesViewProps> = ({ currentEvent }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAllVenues()
      .then(res => setVenues(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedVenue = currentEvent.plan?.selected_venue;
  const expectedAttendees = currentEvent.expected_attendees || 500;

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Banner */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
            CAPACITY & LOGISTICS EVALUATOR
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Venue Agent Selection Portal
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            AI Venue Agent evaluates capacity safety buffer (minimum {expectedAttendees} guests required), amenities, and daily rental rates.
          </p>
        </div>

        <div className="bg-[#080a0e] px-4 py-2 rounded border border-red-900/30 text-xs text-right">
          <span className="text-zinc-500 block">Target Headcount:</span>
          <span className="font-bold text-red-400">{expectedAttendees} Attendees</span>
        </div>
      </div>

      {/* Recommended Selected Venue Highlight */}
      {selectedVenue && (
        <div className="bg-[#11090b] border-2 border-red-600/80 rounded-lg p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> AI SELECTED VENUE
            </span>
            <span className="text-xs text-zinc-400">Match score: 98%</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="relative h-48 rounded-md overflow-hidden border border-red-900/40">
              <img src={selectedVenue.image_url} alt={selectedVenue.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/80 text-amber-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> {selectedVenue.rating}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVenue.name}</h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {selectedVenue.location}, {selectedVenue.city}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#080a0e] p-2.5 rounded border border-red-900/30">
                  <span className="text-[10px] text-zinc-500 block">Max Capacity</span>
                  <span className="font-bold text-white">{selectedVenue.capacity} Guests</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    ({Math.round((expectedAttendees / selectedVenue.capacity) * 100)}% load ratio)
                  </span>
                </div>

                <div className="bg-[#080a0e] p-2.5 rounded border border-red-900/30">
                  <span className="text-[10px] text-zinc-500 block">Daily Rental</span>
                  <span className="font-bold text-red-400">{formatCurrencyINR(selectedVenue.cost_per_day)}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Includes full hall access</span>
                </div>

                <div className="bg-[#080a0e] p-2.5 rounded border border-red-900/30 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-500 block">Contact Desk</span>
                  <span className="font-bold text-zinc-300 truncate block">{selectedVenue.contact_email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase text-zinc-400">Included High-Tech Amenities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVenue.features.map((feat, idx) => (
                    <span key={idx} className="text-[10px] bg-[#1a1317] text-red-200 border border-red-900/50 px-2 py-0.5 rounded">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Available Venues Comparison */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-400" />
          All Evaluated Venues Directory
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading venue directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => {
              const isSelected = selectedVenue?.id === venue.id;
              const isSuitable = venue.capacity >= expectedAttendees;

              return (
                <div
                  key={venue.id}
                  className={`bg-[#0e1017] rounded-lg p-4 border transition-all flex flex-col justify-between ${
                    isSelected ? 'border-red-500 bg-[#120a0d]' : 'border-red-900/30 hover:border-red-600/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative h-32 rounded overflow-hidden">
                      <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded border border-zinc-700">
                        Cap: {venue.capacity}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          SELECTED
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{venue.name}</h4>
                      <p className="text-[11px] text-zinc-400">{venue.location}, {venue.city}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-red-900/20">
                      <span className="text-zinc-400">Cost per day:</span>
                      <span className="font-bold text-red-400">{formatCurrencyINR(venue.cost_per_day)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Capacity check:</span>
                      <span className={`font-bold ${isSuitable ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isSuitable ? `✓ Suitable (${venue.capacity} cap)` : `✕ Too small (${venue.capacity} cap)`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-red-900/20 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Rating: ★ {venue.rating}</span>
                    <span>{venue.suitable_event_types.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
