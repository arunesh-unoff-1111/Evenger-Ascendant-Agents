import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Key, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [currency, setCurrency] = useState('INR (₹)');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl">
        <span className="text-[10px] uppercase tracking-widest text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
          SYSTEM CONFIGURATION
        </span>
        <h2 className="text-xl font-bold text-white tracking-wide mt-1">
          EventPilot System Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5 font-sans">
          Configure Gemini AI integration parameters, server endpoints, and global formatting choices.
        </p>
      </div>

      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-400 uppercase block mb-1 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-red-400" />
              AI Model Engine
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast Constraint Solver)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning Solver)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 uppercase block mb-1 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-400" />
              Backend Service Integration
            </label>
            <input
              type="text"
              readOnly
              value="Full-Stack Express Node Engine (Port 3000)"
              className="w-full bg-[#131620] text-zinc-400 border border-zinc-800 rounded px-3 py-2 font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-400 uppercase block mb-1 font-bold">
              Default Financial Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 font-mono"
            >
              <option value="INR (₹)">Indian Rupee (₹ - INR)</option>
              <option value="USD ($)">US Dollar ($ - USD)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-red-900/20">
            {saved ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Configuration Saved!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded border border-red-400"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
