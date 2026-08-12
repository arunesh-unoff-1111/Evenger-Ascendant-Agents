import React from 'react';
import { 
  FileSpreadsheet, 
  History, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Layers
} from 'lucide-react';
import { EventEntity, ReplanningHistory, AgentActionLog } from '../types';

interface ReportsViewProps {
  currentEvent: EventEntity;
  replanningHistory: ReplanningHistory[];
  agentActions: AgentActionLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentEvent, replanningHistory, agentActions }) => {
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      event: currentEvent,
      history: replanningHistory,
      agentActions: agentActions
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eventpilot-${currentEvent.id}-audit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
            AUDIT TRAIL & COMPLIANCE LOGS
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Replanning Audit & System Reports
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Immutable audit record of all parameter change triggers, agent resolutions, and budget variances.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded border border-red-400 flex items-center justify-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit JSON</span>
        </button>
      </div>

      {/* Audit History List */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <History className="w-4 h-4 text-red-400" />
          Replanning Event History Audit Log
        </h3>

        <div className="space-y-3">
          {replanningHistory.map((h) => (
            <div key={h.id} className="bg-[#080a0e] p-4 rounded-md border border-red-900/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{h.change_trigger}</span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                    {h.delta_summary}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {new Date(h.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-zinc-300 font-sans">{h.resolution_strategy}</p>

              <div className="pt-2 border-t border-red-900/20 flex flex-wrap items-center justify-between text-[10px] text-zinc-500">
                <span>Affected Agents: <strong className="text-zinc-300">{h.affected_agents.join(', ')}</strong></span>
                <span className={`font-bold ${h.status === 'Requires Attention' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Status: {h.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
