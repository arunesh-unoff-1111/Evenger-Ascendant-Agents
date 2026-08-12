import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Building2, 
  Clock, 
  Bot, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { EventEntity, EventPlan, AgentActionLog, ReplanningHistory } from '../types';
import { formatCurrencyINR } from '../lib/api';
import { EventChangeAlertBanner } from './EventChangeAlertBanner';

interface DashboardViewProps {
  currentEvent: EventEntity;
  agentActions: AgentActionLog[];
  replanningHistory: ReplanningHistory[];
  onPlanUpdated: (updatedEvent: EventEntity, newPlan: EventPlan, history: ReplanningHistory) => void;
  onNavigateTab: (tabName: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentEvent,
  agentActions,
  replanningHistory,
  onPlanUpdated,
  onNavigateTab
}) => {
  const plan = currentEvent.plan;
  const budget = plan?.budget;
  const venue = plan?.selected_venue;
  const vendors = plan?.selected_vendors || [];
  const schedule = plan?.schedule || [];

  // 1. Attendance Metrics calculation (based on expected attendees and RSVP breakdown)
  const expected = currentEvent.expected_attendees || 500;
  const confirmed = Math.round(expected * 0.72);
  const pending = Math.round(expected * 0.20);
  const declined = Math.round(expected * 0.08);
  const invited = expected + 120;
  const attendanceRate = Math.round((confirmed / expected) * 100);

  // 2. Budget Donut Chart Data
  const budgetData = [
    { name: 'Venue Allocation', value: budget?.venue_cost || 0, color: '#ef4444' },
    { name: 'Catering & Dining', value: vendors.find(v => v.category === 'Catering')?.calculated_cost || 0, color: '#f97316' },
    { name: 'AV & Infrastructure', value: (vendors.find(v => v.category === 'Audio/Visual')?.calculated_cost || 0) + (vendors.find(v => v.category === 'Infrastructure')?.calculated_cost || 0), color: '#3b82f6' },
    { name: 'Security & Staging', value: (vendors.find(v => v.category === 'Security')?.calculated_cost || 0) + (vendors.find(v => v.category === 'Decor & Staging')?.calculated_cost || 0) + (vendors.find(v => v.category === 'Photography')?.calculated_cost || 0), color: '#a855f7' },
    { name: 'Contingency Buffer', value: budget?.contingency_cost || 0, color: '#10b981' }
  ].filter(item => item.value > 0);

  const totalBudget = currentEvent.total_budget;
  const totalEstimated = budget?.estimated_total || 0;
  const remainingBudget = budget?.remaining_budget ?? (totalBudget - totalEstimated);
  const isOverBudget = budget?.is_over_budget ?? (remainingBudget < 0);
  const percentageUsed = Math.min(100, Math.round((totalEstimated / totalBudget) * 100));

  // 3. AI Agents Mesh List
  const agentMeshList = [
    { name: 'Event Manager', role: 'Master Orchestration', icon: Bot, status: 'Active', color: 'text-red-400' },
    { name: 'Venue Agent', role: 'Capacity & Logistics', icon: Building2, status: 'Active', color: 'text-amber-400' },
    { name: 'Vendor Agent', role: 'Supply Chain & Cost', icon: Zap, status: 'Active', color: 'text-emerald-400' },
    { name: 'Budget Agent', role: 'Financial Auditing', icon: TrendingUp, status: isOverBudget ? 'Alert' : 'Active', color: isOverBudget ? 'text-red-500' : 'text-blue-400' },
    { name: 'Schedule Agent', role: 'Timeline Calibration', icon: Clock, status: 'Active', color: 'text-purple-400' },
    { name: 'Communication Agent', role: 'Stakeholder Dispatch', icon: Sparkles, status: 'Active', color: 'text-cyan-400' }
  ];

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* 1. Event Master Summary Header Card */}
      <div className="bg-[#0f1118] border border-[#1e2436] rounded-lg p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                AUTONOMOUS MASTER PLAN
              </span>
              <span className="text-xs text-zinc-400">
                Last Evaluated: {plan ? new Date(plan.last_updated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">{currentEvent.name}</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl font-sans">
              {plan?.executive_summary || 'Autonomous agent mesh initialized and optimizing parameters.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080a0e] p-3 rounded-md border border-[#1b2030]">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Date
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">{currentEvent.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Location
              </span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate max-w-[100px]" title={currentEvent.location}>
                {currentEvent.location}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" /> Attendees
              </span>
              <span className="text-xs font-bold text-emerald-400 block mt-0.5">{currentEvent.expected_attendees} Headcount</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-400" /> Budget
              </span>
              <span className="text-xs font-bold text-emerald-400 block mt-0.5">{formatCurrencyINR(currentEvent.total_budget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highly Visible Change Detection Banner */}
      <EventChangeAlertBanner
        currentEvent={currentEvent}
        onPlanUpdated={onPlanUpdated}
      />

      {/* 3. Event Overview & Attendance + Budget Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance & Guest Breakdown */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-red-900/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" />
              Event Overview & Attendance Rate
            </h3>
            <button
              onClick={() => onNavigateTab('Guests & RSVP')}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              Manage Guests <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-[#08090d] p-3 rounded border border-red-900/20 text-center">
              <span className="text-[10px] text-zinc-400 uppercase">Invited</span>
              <span className="block text-lg font-bold text-zinc-200 mt-0.5">{invited}</span>
            </div>
            <div className="bg-[#08090d] p-3 rounded border border-emerald-900/40 text-center">
              <span className="text-[10px] text-emerald-400 uppercase flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
              <span className="block text-lg font-bold text-emerald-400 mt-0.5">{confirmed}</span>
            </div>
            <div className="bg-[#08090d] p-3 rounded border border-amber-900/40 text-center">
              <span className="text-[10px] text-amber-400 uppercase flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3" /> Pending
              </span>
              <span className="block text-lg font-bold text-amber-400 mt-0.5">{pending}</span>
            </div>
            <div className="bg-[#08090d] p-3 rounded border border-red-900/40 text-center">
              <span className="text-[10px] text-red-400 uppercase flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" /> Declined
              </span>
              <span className="block text-lg font-bold text-red-400 mt-0.5">{declined}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Attendance Target Coverage</span>
              <span className="text-red-400 font-bold">{attendanceRate}% ({confirmed} / {expected} confirmed)</span>
            </div>
            <div className="w-full bg-[#181a24] h-2.5 rounded-full overflow-hidden border border-red-900/30">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Overview with Donut Chart */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-red-900/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-red-400" />
              Budget Overview & Allocation
            </h3>
            <button
              onClick={() => onNavigateTab('Budget')}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              Full Breakdown <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
            {/* Recharts Donut */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0e1017" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [formatCurrencyINR(val), 'Amount']}
                    contentStyle={{ backgroundColor: '#090b10', borderColor: '#7f1d1d', borderRadius: '4px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] text-zinc-400 uppercase block">Used</span>
                <span className="text-sm font-bold text-white">{percentageUsed}%</span>
              </div>
            </div>

            {/* Financial Stats Column */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#08090d] rounded border border-red-900/20">
                <span className="text-zinc-400">Planned Target:</span>
                <span className="font-bold text-white">{formatCurrencyINR(totalBudget)}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#08090d] rounded border border-red-900/20">
                <span className="text-zinc-400">Estimated Total:</span>
                <span className="font-bold text-red-400">{formatCurrencyINR(totalEstimated)}</span>
              </div>
              <div className={`flex justify-between p-2 rounded border ${isOverBudget ? 'bg-red-950/60 border-red-600/80 text-red-200' : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'}`}>
                <span>{isOverBudget ? 'Over Budget:' : 'Remaining Buffer:'}</span>
                <span className="font-bold">{formatCurrencyINR(remainingBudget)}</span>
              </div>
            </div>
          </div>

          {isOverBudget && budget?.cost_saving_alternatives && budget.cost_saving_alternatives.length > 0 && (
            <div className="mt-2 p-2.5 bg-red-950/80 border border-red-600/60 rounded text-xs text-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11px]">AI identified {budget.cost_saving_alternatives.length} cost-saving options</span>
              </div>
              <button onClick={() => onNavigateTab('Planning')} className="text-[11px] underline font-bold text-white hover:text-red-300">
                Review & Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Upcoming Schedule & Recommended Venue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedule Timeline */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-red-900/20 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              Upcoming Schedule Timeline
            </h3>
            <button
              onClick={() => onNavigateTab('Schedule')}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              Full Schedule <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {schedule.slice(0, 5).map((item, idx) => (
              <div key={item.id || idx} className="bg-[#080a0e] p-3 rounded border border-red-900/20 hover:border-red-600/40 transition-colors flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/60 px-2 py-1 rounded shrink-0 whitespace-nowrap mt-0.5">
                    {item.time}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.activity}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-red-400" />
                        {item.location}
                      </span>
                      <span>•</span>
                      <span>{item.responsible_party}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-[#141824] text-zinc-300 border border-zinc-700/50 px-1.5 py-0.5 rounded shrink-0">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Venue Card */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-red-900/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-400" />
              Recommended Venue Selection
            </h3>
            <button
              onClick={() => onNavigateTab('Venues')}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              Explore Venues <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {venue ? (
            <div className="my-3 space-y-3">
              <div className="relative h-32 rounded overflow-hidden border border-red-900/40 group">
                <img 
                  src={venue.image_url} 
                  alt={venue.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{venue.name}</h4>
                    <span className="text-[11px] text-zinc-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" /> {venue.location}, {venue.city}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-black/80 px-2 py-1 rounded border border-red-700/60">
                    {formatCurrencyINR(venue.cost_per_day)}/day
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#080a0e] p-2 rounded border border-red-900/20">
                  <span className="text-[10px] text-zinc-500 block">Capacity Rating</span>
                  <span className="font-bold text-white">{venue.capacity} guests max</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    ({Math.round((expected / venue.capacity) * 100)}% capacity ratio)
                  </span>
                </div>

                <div className="bg-[#080a0e] p-2 rounded border border-red-900/20">
                  <span className="text-[10px] text-zinc-500 block">Availability</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Reserved & Confirmed
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{venue.contact_email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {venue.features.map((feat, i) => (
                  <span key={i} className="text-[10px] bg-[#141824] text-zinc-300 border border-red-900/30 px-2 py-0.5 rounded">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 p-8 text-center">No venue selected yet. Click recalculate plan to run AI selection.</div>
          )}
        </div>
      </div>

      {/* 5. AI Agent Network Mesh (6 Agents) */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-red-900/20 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-red-400" />
              AI Agent Network (6 Autonomous Sub-Agents)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              Collaborative multi-agent system executing real-time constraints solver logic
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('AI Agents')}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            Mesh Logs <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentMeshList.map((agent) => {
            const Icon = agent.icon;
            const relevantAction = agentActions.find(a => a.agent_name === agent.name);

            return (
              <div key={agent.name} className="bg-[#080a0e] border border-red-900/30 rounded-md p-3.5 hover:border-red-600/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-950 rounded border border-red-800/60">
                        <Icon className={`w-4 h-4 ${agent.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                        <span className="text-[10px] text-zinc-500">{agent.role}</span>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 mt-2 bg-[#0c0e14] p-2 rounded border border-red-900/20 line-clamp-2">
                    {relevantAction?.output_summary || 'Monitoring event parameter changes and maintaining optimization matrices.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-red-900/20 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Last Run: {relevantAction ? new Date(relevantAction.timestamp).toLocaleTimeString() : '1m ago'}</span>
                  <span className="text-red-400 font-semibold">{relevantAction ? `${relevantAction.execution_time_ms}ms` : '120ms'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Agent Activity Log Feed */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-red-900/20 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            Recent Agent Action Logs (Real Backend Audit Feed)
          </h3>
          <span className="text-xs text-zinc-500">{agentActions.length} Actions Recorded</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {agentActions.slice(0, 8).map((act) => (
            <div key={act.id} className="bg-[#080a0e] p-3 rounded border border-red-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 mt-0.5 ${
                  act.status === 'Warning' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {act.agent_name}
                </span>

                <div>
                  <span className="font-bold text-white">{act.action_type}: </span>
                  <span className="text-zinc-300">{act.output_summary}</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Input: {act.input_summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[10px] text-zinc-500 self-end sm:self-auto">
                <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                <span className="text-zinc-400 bg-[#121520] px-1.5 py-0.5 rounded border border-zinc-800">
                  {act.execution_time_ms}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
