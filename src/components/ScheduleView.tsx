import React from 'react';
import { 
  Clock, 
  MapPin, 
  UserCheck, 
  Layers, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { EventEntity } from '../types';

interface ScheduleViewProps {
  currentEvent: EventEntity;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ currentEvent }) => {
  const schedule = currentEvent.plan?.schedule || [];
  const expectedAttendees = currentEvent.expected_attendees || 500;

  // Check-in kiosk buffer calculation
  const kioskCount = Math.max(3, Math.ceil(expectedAttendees / 100));
  const checkinDuration = expectedAttendees > 700 ? 90 : 60;

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Banner */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded">
            CALIBRATED EVENT TIMELINE
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Schedule Agent Timeline Engine
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            AI Schedule Agent calibrates check-in buffer windows ({checkinDuration} min for {expectedAttendees} guests across {kioskCount} RFID kiosks) and session transitions.
          </p>
        </div>

        <div className="bg-[#080a0e] px-4 py-2 rounded border border-red-900/30 text-xs text-right">
          <span className="text-zinc-500 block">Check-in Throughput:</span>
          <span className="font-bold text-emerald-400">{kioskCount} Kiosks Active</span>
        </div>
      </div>

      {/* Check-in Buffer Banner */}
      <div className="bg-[#120a10] border border-purple-900/50 rounded-lg p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-950 rounded border border-purple-800 text-purple-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white uppercase">Check-in Kiosk Buffer Calibrated</h4>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Allocated {checkinDuration} minutes window for {expectedAttendees} guests. Expected check-in density peak at T+15m.
            </p>
          </div>
        </div>
        <span className="bg-purple-950 text-purple-200 border border-purple-800 text-[10px] px-2 py-1 rounded font-bold">
          {checkinDuration}m Registration Window
        </span>
      </div>

      {/* Timeline List */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <Clock className="w-4 h-4 text-red-400" />
          Master Event Schedule
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-900/40">
          {schedule.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-red-950 border-2 border-red-500 group-hover:scale-125 transition-transform" />

              <div className="bg-[#080a0e] p-4 rounded-md border border-red-900/30 hover:border-red-600/50 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800/60 w-fit">
                    {item.time}
                  </span>
                  <span className="text-[10px] bg-[#141824] text-zinc-300 border border-zinc-700/50 px-2 py-0.5 rounded w-fit">
                    {item.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{item.activity}</h4>
                <p className="text-xs text-zinc-300 font-sans">{item.description}</p>

                <div className="pt-2 border-t border-red-900/20 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {item.location}
                  </span>
                  <span className="text-zinc-500">
                    Lead: <strong className="text-zinc-300">{item.responsible_party}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
