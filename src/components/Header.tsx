import React from 'react';
import { 
  Zap, 
  RotateCw, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { EventEntity, NavTab } from '../types';
import { formatCurrencyINR } from '../lib/api';

interface HeaderProps {
  currentEvent?: EventEntity;
  activeTab: NavTab;
  onRefresh: () => void;
  onQuickReplanClick: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentEvent,
  activeTab,
  onRefresh,
  onQuickReplanClick,
  isRefreshing
}) => {
  const isOverBudget = currentEvent?.plan?.budget?.is_over_budget;

  return (
    <header className="bg-[#0b0d13]/90 backdrop-blur-md border-b border-[#1b2030] px-6 py-3 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <span className="text-emerald-500">//</span> {activeTab}
            </h1>
            {currentEvent && (
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px] px-2 py-0.5 rounded font-mono font-medium tracking-wider uppercase">
                {currentEvent.status}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
            <span>EventPilot Autonomous Control Center</span>
            <span>•</span>
            <span className="text-zinc-400">ID: {currentEvent?.id || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Middle Parameter Status Strip */}
      {currentEvent && (
        <div className="hidden lg:flex items-center gap-4 bg-[#080a0e] border border-[#1a1f2e] px-3.5 py-1.5 rounded-md font-mono text-xs text-zinc-300 shadow-inner">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Headcount:</span>
            <span className="font-semibold text-white">{currentEvent.expected_attendees} attendees</span>
          </div>

          <div className="h-3 w-[1px] bg-zinc-800" />

          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Budget:</span>
            <span className="font-semibold text-white">{formatCurrencyINR(currentEvent.total_budget)}</span>
          </div>

          <div className="h-3 w-[1px] bg-zinc-800" />

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300 truncate max-w-[120px]">{currentEvent.location}</span>
          </div>

          {isOverBudget && (
            <>
              <div className="h-3 w-[1px] bg-zinc-800" />
              <div className="flex items-center gap-1 text-red-400 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>OVER BUDGET</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onQuickReplanClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-3.5 py-1.5 rounded border border-emerald-400/50 flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>RECALCULATE PLAN</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-[#131622] hover:bg-[#1a1e2e] text-zinc-300 border border-[#22283a] hover:border-emerald-500/50 font-mono text-xs px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all disabled:opacity-50"
          title="Refresh Data from AI Mesh"
        >
          <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
};
