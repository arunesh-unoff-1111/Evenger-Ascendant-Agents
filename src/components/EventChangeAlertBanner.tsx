import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  IndianRupee, 
  ShieldAlert, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EventEntity, EventPlan, ReplanningHistory } from '../types';
import { formatCurrencyINR, triggerDynamicReplan } from '../lib/api';

interface EventChangeAlertBannerProps {
  currentEvent: EventEntity;
  onPlanUpdated: (updatedEvent: EventEntity, newPlan: EventPlan, history: ReplanningHistory) => void;
}

export const EventChangeAlertBanner: React.FC<EventChangeAlertBannerProps> = ({
  currentEvent,
  onPlanUpdated
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [customAttendees, setCustomAttendees] = useState<number>(currentEvent.expected_attendees + 300);
  const [customBudget, setCustomBudget] = useState<number>(currentEvent.total_budget);
  const [changeReason, setChangeReason] = useState<string>('Registration Surge (+300 attendees)');
  const [showTuner, setShowTuner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset triggers
  const currentAttendees = currentEvent.expected_attendees;
  const currentBudget = currentEvent.total_budget;
  const plan = currentEvent.plan;

  const handleExecuteReplanning = async (attendeesToUse?: number, budgetToUse?: number, reasonToUse?: string) => {
    setIsExecuting(true);
    setErrorMessage(null);
    try {
      const att = attendeesToUse ?? customAttendees;
      const bdg = budgetToUse ?? customBudget;
      const rsn = reasonToUse ?? changeReason;

      const res = await triggerDynamicReplan(currentEvent.id, {
        expected_attendees: att,
        total_budget: bdg,
        reason: rsn
      });

      onPlanUpdated(res.event, res.plan, res.history);
      setShowTuner(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to trigger replanning');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[#0b1017] border border-amber-500/40 rounded-lg p-4 md:p-5 shadow-2xl relative overflow-hidden font-mono">
      {/* Background Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff8808_1px,transparent_1px),linear-gradient(to_bottom,#00ff8808_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pb-3 border-b border-[#1b2234]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
                EVENT CHANGE DETECTED
              </span>
              <span className="text-[11px] text-zinc-400 font-sans">Triggered by Real-Time Event Monitoring</span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white mt-1 flex items-center gap-2">
              <span>Attendance Scope Escalation:</span>
              <span className="text-zinc-400 font-normal">{currentAttendees} attendees</span>
              <ArrowRight className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400 font-bold">{customAttendees} attendees</span>
              <span className="bg-emerald-950/80 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-700/50">
                +{customAttendees - currentAttendees} attendees
              </span>
            </h3>
          </div>
        </div>

        {/* Action Button & Toggle */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className="text-xs text-zinc-300 hover:text-white bg-[#131826] border border-[#232a3e] hover:border-emerald-500 px-3 py-2 rounded flex items-center gap-1.5 transition-all"
          >
            <span>Modify Parameters</span>
            {showTuner ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => handleExecuteReplanning()}
            disabled={isExecuting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded border border-emerald-400/60 shadow-lg shadow-emerald-950/80 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'REPLANNING MESH...' : 'RECALCULATE PLAN'}</span>
          </button>
        </div>
      </div>

      {/* Affected Agents & Modules */}
      <div className="mt-3 flex flex-wrap items-center gap-2 relative z-10 text-xs text-zinc-300">
        <span className="text-zinc-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Affected Modules:
        </span>
        {['Venue Agent', 'Catering / Vendors', 'Budget & Contingency', 'Schedule & Check-in', 'Guest Broadcasts'].map((mod) => (
          <span key={mod} className="bg-[#121926] text-emerald-200 border border-emerald-800/40 px-2 py-0.5 rounded text-[11px]">
            {mod}
          </span>
        ))}
      </div>

      {/* Parameter Modifier Tuner (Collapsible) */}
      {showTuner && (
        <div className="mt-4 pt-4 border-t border-red-900/40 bg-[#0d0708] p-4 rounded-md border border-red-900/60 relative z-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 text-[11px] uppercase mb-1">Target Attendees</label>
              <input
                type="number"
                value={customAttendees}
                onChange={(e) => setCustomAttendees(Number(e.target.value))}
                className="w-full bg-[#181014] text-white border border-red-800/60 rounded px-3 py-1.5 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[11px] uppercase mb-1">Total Budget (₹)</label>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                className="w-full bg-[#181014] text-white border border-red-800/60 rounded px-3 py-1.5 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[11px] uppercase mb-1">Trigger Reason</label>
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full bg-[#181014] text-white border border-red-800/60 rounded px-3 py-1.5 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-400">
              Preset: <button type="button" onClick={() => { setCustomAttendees(800); setChangeReason('Surge (+300 attendees)'); }} className="text-red-400 underline hover:text-red-300 ml-1">800 attendees</button>
              {' | '}<button type="button" onClick={() => { setCustomAttendees(1000); setChangeReason('Major Registration Spike (+500)'); }} className="text-red-400 underline hover:text-red-300">1000 attendees</button>
            </span>
            <button
              onClick={() => handleExecuteReplanning()}
              disabled={isExecuting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit & Run AI Mesh</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-2 bg-red-950/90 border border-red-500 text-red-200 text-xs rounded">
          Replanning Error: {errorMessage}
        </div>
      )}
    </div>
  );
};
