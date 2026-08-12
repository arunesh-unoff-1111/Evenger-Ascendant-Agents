import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Zap, 
  PieChart, 
  Building2, 
  Store, 
  Users, 
  Clock, 
  Radio, 
  Bot, 
  FileSpreadsheet, 
  Sliders,
  ChevronRight,
  PlusCircle,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { NavTab, EventEntity } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  events: EventEntity[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  onOpenNewEventModal: () => void;
  isReplanningPending?: boolean;
}

const NAV_ITEMS: { tab: NavTab; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'Dashboard', icon: LayoutDashboard },
  { tab: 'Events', icon: CalendarDays },
  { tab: 'Planning', icon: Zap },
  { tab: 'Budget', icon: PieChart },
  { tab: 'Venues', icon: Building2 },
  { tab: 'Vendors', icon: Store },
  { tab: 'Guests & RSVP', icon: Users },
  { tab: 'Schedule', icon: Clock },
  { tab: 'Communications', icon: Radio },
  { tab: 'AI Agents', icon: Bot },
  { tab: 'Reports', icon: FileSpreadsheet },
  { tab: 'Settings', icon: Sliders },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  events,
  selectedEventId,
  setSelectedEventId,
  onOpenNewEventModal,
  isReplanningPending
}) => {
  const currentEvent = events.find(e => e.id === selectedEventId);

  return (
    <aside className="w-64 bg-[#0a0c10] border-r border-[#1b2030] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1b2030] bg-[#0d0f15]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-950 border border-emerald-500/50 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Zap className="w-5 h-5 text-emerald-100" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-black"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-sm text-white uppercase font-mono">EventPilot</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight">Autonomous Control Mesh</p>
          </div>
        </div>
      </div>

      {/* Active Event Selector */}
      <div className="p-3 border-b border-[#1b2030] bg-[#07080b]">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500" />
            Target Scope
          </label>
          <button
            onClick={onOpenNewEventModal}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-emerald-950/40"
            title="Create New Event"
          >
            <PlusCircle className="w-3 h-3" />
            New
          </button>
        </div>
        
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-[#11141c] text-xs text-zinc-200 border border-[#22283a] rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
        >
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.name} ({evt.expected_attendees} p)
            </option>
          ))}
        </select>

        {currentEvent && (
          <div className="mt-2 text-[11px] font-mono text-zinc-400 bg-emerald-950/20 border border-emerald-900/30 rounded p-1.5 flex items-center justify-between">
            <span className="truncate max-w-[130px] text-zinc-300">{currentEvent.location}</span>
            <span className="text-emerald-400 font-semibold">{currentEvent.date}</span>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
        <div className="px-2 pb-1.5 text-[10px] uppercase font-mono tracking-widest text-zinc-500">
          Core Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          const isPlanningTab = item.tab === 'Planning';

          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/70 to-[#181a24] text-white border-l-2 border-emerald-500 shadow-md shadow-emerald-950/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#12151e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-zinc-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="font-mono text-[12.5px] tracking-tight">{item.tab}</span>
              </div>

              {isPlanningTab && isReplanningPending && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-500/80" />}
            </button>
          );
        })}
      </nav>

      {/* Agent Mesh Footer Status */}
      <div className="p-3 border-t border-[#1b2030] bg-[#07080b] font-mono text-[11px]">
        <div className="flex items-center justify-between text-zinc-400 mb-1">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            6 AGENTS ONLINE
          </span>
          <span className="text-[10px] text-zinc-400">v2.4-ai</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-[#0e1017] p-1.5 rounded border border-[#1e2436]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Autonomous Mesh Operational</span>
        </div>
      </div>
    </aside>
  );
};
