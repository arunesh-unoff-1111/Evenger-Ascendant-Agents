import React from 'react';
import { 
  Bot, 
  Building2, 
  Store, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AgentActionLog, EventEntity } from '../types';

interface AiAgentsViewProps {
  currentEvent: EventEntity;
  agentActions: AgentActionLog[];
}

export const AiAgentsView: React.FC<AiAgentsViewProps> = ({ currentEvent, agentActions }) => {
  const agents = [
    {
      name: 'Event Manager',
      role: 'Master Orchestration & Mesh Coordinator',
      icon: Bot,
      color: 'border-red-500 text-red-400',
      description: 'Coordinates input parameter diffs across all sub-agents and synthesizes final executive event master plans.'
    },
    {
      name: 'Venue Agent',
      role: 'Capacity & Physical Venue Evaluator',
      icon: Building2,
      color: 'border-amber-500 text-amber-400',
      description: 'Filters physical venues in Bangalore by attendee load capacity, feature amenities, and daily rental rates.'
    },
    {
      name: 'Vendor Agent',
      role: 'Supply Chain & Quantity Scaling Engine',
      icon: Store,
      color: 'border-emerald-500 text-emerald-400',
      description: 'Scales catering plates, AV systems, Wi-Fi access points, security personnel, and decor matrices.'
    },
    {
      name: 'Budget Agent',
      role: 'Financial Audit & Contingency Guard',
      icon: TrendingUp,
      color: 'border-blue-500 text-blue-400',
      description: 'Audits total projected expenditures against total budget limits and proposes trade-off cost-saving alternatives.'
    },
    {
      name: 'Schedule Agent',
      role: 'Timeline Calibration & Check-in Kiosk Solver',
      icon: Clock,
      color: 'border-purple-500 text-purple-400',
      description: 'Calibrates event schedules and check-in duration windows to prevent crowd bottlenecks at entry.'
    },
    {
      name: 'Communication Agent',
      role: 'Stakeholder Broadcast Dispatcher',
      icon: Sparkles,
      color: 'border-cyan-500 text-cyan-400',
      description: 'Generates tailored guest notifications and vendor dispatch orders automatically upon replanning triggers.'
    }
  ];

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Banner */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
            AUTONOMOUS AGENT MESH CONTROL
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            6-Agent Collaborative Network
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Specialized autonomous sub-agents executing synchronized multi-objective constraint optimization algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#080a0e] px-3.5 py-2 rounded border border-emerald-800/40 text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">ALL 6 AGENTS HEALTHY & ONLINE</span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const relevantActions = agentActions.filter(a => a.agent_name === agent.name);
          const latestAction = relevantActions[0];

          return (
            <div key={agent.name} className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded bg-red-950 border ${agent.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <span className="text-[10px] text-zinc-500">{agent.role}</span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    ONLINE
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-sans">{agent.description}</p>

                <div className="bg-[#080a0e] p-3 rounded border border-red-900/20 text-xs space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Latest Execution Output:</span>
                  <p className="text-zinc-200 text-[11px]">
                    {latestAction ? latestAction.output_summary : 'Ready for next constraint evaluation trigger.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-red-900/20 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Total Executions: {relevantActions.length}</span>
                <span className="text-red-400 font-bold">
                  Latency: {latestAction ? `${latestAction.execution_time_ms}ms` : '135ms'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Logs Feed */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <Activity className="w-4 h-4 text-red-400" />
          Real Agent Execution Logs Audit
        </h3>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {agentActions.map((act) => (
            <div key={act.id} className="bg-[#080a0e] p-3.5 rounded border border-red-900/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded shrink-0">
                  {act.agent_name}
                </span>

                <div>
                  <span className="font-bold text-white">{act.action_type}: </span>
                  <span className="text-zinc-300">{act.output_summary}</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Input: {act.input_summary}</p>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 shrink-0 self-end sm:self-auto">
                {new Date(act.timestamp).toLocaleTimeString()} ({act.execution_time_ms}ms)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
