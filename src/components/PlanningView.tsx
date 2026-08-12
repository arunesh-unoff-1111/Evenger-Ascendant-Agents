import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  IndianRupee, 
  Users, 
  Building2, 
  Store, 
  History,
  Sliders,
  Check
} from 'lucide-react';
import { EventEntity, EventPlan, ReplanningHistory } from '../types';
import { formatCurrencyINR, triggerDynamicReplan } from '../lib/api';

interface PlanningViewProps {
  currentEvent: EventEntity;
  replanningHistory: ReplanningHistory[];
  onPlanUpdated: (updatedEvent: EventEntity, newPlan: EventPlan, history: ReplanningHistory) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  currentEvent,
  replanningHistory,
  onPlanUpdated
}) => {
  const plan = currentEvent.plan;
  const budget = plan?.budget;

  // Form State
  const [attendees, setAttendees] = useState<number>(currentEvent.expected_attendees || 500);
  const [totalBudget, setTotalBudget] = useState<number>(currentEvent.total_budget || 500000);
  const [eventDate, setEventDate] = useState<string>(currentEvent.date || '');
  const [location, setLocation] = useState<string>(currentEvent.location || '');
  const [changeReason, setChangeReason] = useState<string>('Registration Surge & Logistics Optimization');
  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Snapshot of old state for side-by-side comparison
  const [oldPlanSnapshot, setOldPlanSnapshot] = useState<{
    attendees: number;
    budget: number;
    venueName: string;
    venueCost: number;
    cateringCost: number;
    equipmentCost: number;
    securityCost: number;
    otherCost: number;
    totalCost: number;
    remainingBudget: number;
  } | null>(() => {
    if (!plan) return null;
    const vendors = plan.selected_vendors || [];
    const catering = vendors.find(v => v.category === 'Catering')?.calculated_cost || 0;
    const avCost = vendors.find(v => v.category === 'Audio/Visual')?.calculated_cost || 0;
    const infraCost = vendors.find(v => v.category === 'Infrastructure')?.calculated_cost || 0;
    const secCost = vendors.find(v => v.category === 'Security')?.calculated_cost || 0;
    const decorCost = vendors.find(v => v.category === 'Decor & Staging')?.calculated_cost || 0;
    const photoCost = vendors.find(v => v.category === 'Photography')?.calculated_cost || 0;

    return {
      attendees: currentEvent.expected_attendees,
      budget: currentEvent.total_budget,
      venueName: plan.selected_venue?.name || 'Unassigned',
      venueCost: plan.selected_venue?.cost_per_day || 0,
      cateringCost: catering,
      equipmentCost: avCost + infraCost,
      securityCost: secCost,
      otherCost: decorCost + photoCost,
      totalCost: plan.budget?.estimated_total || 0,
      remainingBudget: plan.budget?.remaining_budget || 0
    };
  });

  const handleRunReplan = async () => {
    setIsReplanning(true);
    setErrorMsg(null);

    // Save old plan snapshot before updating
    if (plan) {
      const vendors = plan.selected_vendors || [];
      const catering = vendors.find(v => v.category === 'Catering')?.calculated_cost || 0;
      const avCost = vendors.find(v => v.category === 'Audio/Visual')?.calculated_cost || 0;
      const infraCost = vendors.find(v => v.category === 'Infrastructure')?.calculated_cost || 0;
      const secCost = vendors.find(v => v.category === 'Security')?.calculated_cost || 0;
      const decorCost = vendors.find(v => v.category === 'Decor & Staging')?.calculated_cost || 0;
      const photoCost = vendors.find(v => v.category === 'Photography')?.calculated_cost || 0;

      setOldPlanSnapshot({
        attendees: currentEvent.expected_attendees,
        budget: currentEvent.total_budget,
        venueName: plan.selected_venue?.name || 'Unassigned',
        venueCost: plan.selected_venue?.cost_per_day || 0,
        cateringCost: catering,
        equipmentCost: avCost + infraCost,
        securityCost: secCost,
        otherCost: decorCost + photoCost,
        totalCost: plan.budget?.estimated_total || 0,
        remainingBudget: plan.budget?.remaining_budget || 0
      });
    }

    try {
      const res = await triggerDynamicReplan(currentEvent.id, {
        expected_attendees: attendees,
        total_budget: totalBudget,
        date: eventDate,
        location: location,
        reason: changeReason
      });

      onPlanUpdated(res.event, res.plan, res.history);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dynamic replanning failed');
    } finally {
      setIsReplanning(false);
    }
  };

  // Helper to extract cost breakdown for current plan
  const vendors = plan?.selected_vendors || [];
  const catering = vendors.find(v => v.category === 'Catering')?.calculated_cost || 0;
  const avCost = vendors.find(v => v.category === 'Audio/Visual')?.calculated_cost || 0;
  const infraCost = vendors.find(v => v.category === 'Infrastructure')?.calculated_cost || 0;
  const secCost = vendors.find(v => v.category === 'Security')?.calculated_cost || 0;
  const decorCost = vendors.find(v => v.category === 'Decor & Staging')?.calculated_cost || 0;
  const photoCost = vendors.find(v => v.category === 'Photography')?.calculated_cost || 0;

  const currentPlanData = {
    attendees: currentEvent.expected_attendees,
    budget: currentEvent.total_budget,
    venueName: plan?.selected_venue?.name || 'Unassigned',
    venueCost: plan?.selected_venue?.cost_per_day || 0,
    cateringCost: catering,
    equipmentCost: avCost + infraCost,
    securityCost: secCost,
    otherCost: decorCost + photoCost,
    totalCost: budget?.estimated_total || 0,
    remainingBudget: budget?.remaining_budget || 0
  };

  const isOverBudget = budget?.is_over_budget;

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Workspace Header */}
      <div className="bg-[#0f1118] border border-[#1e2436] rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
            REAL-TIME CONSTRAINT SOLVER
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Dynamic Replanning & What-If Studio
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans max-w-2xl">
            Modify event constraints (headcount, budget, location) and trigger the 6-agent mesh to synthesize a calibrated event master plan instantly.
          </p>
        </div>

        <button
          onClick={handleRunReplan}
          disabled={isReplanning}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-3 rounded border border-emerald-400/60 shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 fill-current ${isReplanning ? 'animate-spin' : ''}`} />
          <span>{isReplanning ? 'AGENT MESH EXECUTING...' : 'RECALCULATE PLAN'}</span>
        </button>
      </div>

      {/* Parameter Control Panel */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-red-900/20">
          <Sliders className="w-4 h-4 text-red-400" />
          Event Constraint Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Headcount */}
          <div className="bg-[#08090d] p-3 rounded border border-red-900/30">
            <label className="text-xs text-zinc-400 uppercase font-mono block mb-1 flex justify-between">
              <span>Expected Attendees</span>
              <span className="text-red-400 font-bold">{attendees} p</span>
            </label>
            <input
              type="number"
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value))}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-1.5 mt-2">
              {[500, 800, 1000, 1200].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAttendees(val)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${attendees === val ? 'bg-red-950 border-red-500 text-white' : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="bg-[#08090d] p-3 rounded border border-red-900/30">
            <label className="text-xs text-zinc-400 uppercase font-mono block mb-1 flex justify-between">
              <span>Total Target Budget</span>
              <span className="text-emerald-400 font-bold">{formatCurrencyINR(totalBudget)}</span>
            </label>
            <input
              type="number"
              step={50000}
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-1.5 mt-2">
              {[500000, 750000, 1000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTotalBudget(val)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${totalBudget === val ? 'bg-red-950 border-red-500 text-white' : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  ₹{(val/100000).toFixed(1)}L
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="bg-[#08090d] p-3 rounded border border-red-900/30">
            <label className="text-xs text-zinc-400 uppercase font-mono block mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Location */}
          <div className="bg-[#08090d] p-3 rounded border border-red-900/30">
            <label className="text-xs text-zinc-400 uppercase font-mono block mb-1">
              Destination Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 uppercase font-mono block mb-1">
            Replanning Change Reason / Audit Trigger
          </label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-red-500"
            placeholder="e.g. Surge in registration headcount (+300 attendees)"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950 border border-red-500 text-red-200 text-xs rounded">
            Error during execution: {errorMsg}
          </div>
        )}
      </div>

      {/* OLD PLAN vs NEW PLAN Comparison Table */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-red-900/20 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            OLD PLAN vs NEW PLAN Comparison Matrix
          </h3>
          <span className="text-xs text-zinc-400">
            Auto-calculated across Venue, Catering, Equipment & Security
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#080a0e] text-zinc-400 border-b border-red-900/40 uppercase">
                <th className="p-3">Cost Center / Module</th>
                <th className="p-3">OLD PLAN ({oldPlanSnapshot ? `${oldPlanSnapshot.attendees} guests` : 'Initial'})</th>
                <th className="p-3 text-red-400">NEW PLAN ({currentPlanData.attendees} guests)</th>
                <th className="p-3 text-right">Cost Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20 text-zinc-300">
              {/* Venue */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Venue Allocation
                </td>
                <td className="p-3 text-zinc-400">
                  {oldPlanSnapshot ? `${oldPlanSnapshot.venueName} (${formatCurrencyINR(oldPlanSnapshot.venueCost)})` : 'N/A'}
                </td>
                <td className="p-3 text-white font-bold">
                  {currentPlanData.venueName} ({formatCurrencyINR(currentPlanData.venueCost)})
                </td>
                <td className="p-3 text-right font-bold text-zinc-300">
                  {oldPlanSnapshot ? formatCurrencyINR(currentPlanData.venueCost - oldPlanSnapshot.venueCost) : '0'}
                </td>
              </tr>

              {/* Food (Catering) */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-semibold text-white flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-orange-400" />
                  Food & Catering
                </td>
                <td className="p-3 text-zinc-400">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.cateringCost) : 'N/A'}
                </td>
                <td className="p-3 text-white font-bold">
                  {formatCurrencyINR(currentPlanData.cateringCost)}
                </td>
                <td className="p-3 text-right font-bold text-red-400">
                  {oldPlanSnapshot ? `+${formatCurrencyINR(currentPlanData.cateringCost - oldPlanSnapshot.cateringCost)}` : '0'}
                </td>
              </tr>

              {/* Equipment */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-semibold text-white flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Equipment & Infra (AV + Wifi)
                </td>
                <td className="p-3 text-zinc-400">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.equipmentCost) : 'N/A'}
                </td>
                <td className="p-3 text-white font-bold">
                  {formatCurrencyINR(currentPlanData.equipmentCost)}
                </td>
                <td className="p-3 text-right font-bold text-red-400">
                  {oldPlanSnapshot ? `+${formatCurrencyINR(currentPlanData.equipmentCost - oldPlanSnapshot.equipmentCost)}` : '0'}
                </td>
              </tr>

              {/* Security */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  Security & Crowd Management
                </td>
                <td className="p-3 text-zinc-400">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.securityCost) : 'N/A'}
                </td>
                <td className="p-3 text-white font-bold">
                  {formatCurrencyINR(currentPlanData.securityCost)}
                </td>
                <td className="p-3 text-right font-bold text-zinc-300">
                  {oldPlanSnapshot ? formatCurrencyINR(currentPlanData.securityCost - oldPlanSnapshot.securityCost) : '0'}
                </td>
              </tr>

              {/* Other */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-semibold text-white">Other (Decor & Photography)</td>
                <td className="p-3 text-zinc-400">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.otherCost) : 'N/A'}
                </td>
                <td className="p-3 text-white font-bold">
                  {formatCurrencyINR(currentPlanData.otherCost)}
                </td>
                <td className="p-3 text-right font-bold text-zinc-300">₹0</td>
              </tr>

              {/* Total Estimated Expense */}
              <tr className="bg-[#121520] font-bold border-t-2 border-red-800">
                <td className="p-3 text-white uppercase">TOTAL ESTIMATED EXPENSE</td>
                <td className="p-3 text-zinc-300">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.totalCost) : 'N/A'}
                </td>
                <td className="p-3 text-red-400 text-sm">
                  {formatCurrencyINR(currentPlanData.totalCost)}
                </td>
                <td className="p-3 text-right text-red-400 text-sm">
                  {oldPlanSnapshot ? `+${formatCurrencyINR(currentPlanData.totalCost - oldPlanSnapshot.totalCost)}` : '0'}
                </td>
              </tr>

              {/* Remaining Budget */}
              <tr className={`font-bold ${isOverBudget ? 'bg-red-950/80 text-red-200' : 'bg-emerald-950/40 text-emerald-300'}`}>
                <td className="p-3 uppercase">{isOverBudget ? 'REMAINING BUDGET (DEFICIT)' : 'REMAINING BUDGET (SURPLUS)'}</td>
                <td className="p-3">
                  {oldPlanSnapshot ? formatCurrencyINR(oldPlanSnapshot.remainingBudget) : 'N/A'}
                </td>
                <td className="p-3 text-sm">
                  {formatCurrencyINR(currentPlanData.remainingBudget)}
                </td>
                <td className="p-3 text-right text-sm">
                  {isOverBudget ? 'OVER BUDGET BREACH' : 'BALANCED'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Generated Alternatives Section (If Over Budget) */}
      {isOverBudget && budget?.cost_saving_alternatives && (
        <div className="bg-[#150a0c] border-2 border-red-600/80 rounded-lg p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-red-800/60">
            <div className="p-2 bg-red-950 rounded border border-red-600 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                CRITICAL BUDGET OVERFLOW DETECTED (+{formatCurrencyINR(budget.over_budget_amount)})
              </h3>
              <p className="text-xs text-red-300 mt-0.5">
                The Budget Agent has synthesized AI cost-saving trade-off alternatives to bring expenditures back below the ₹{currentEvent.total_budget.toLocaleString('en-IN')} threshold.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budget.cost_saving_alternatives.map((alt, idx) => (
              <div key={idx} className="bg-[#090b10] p-4 rounded-md border border-red-800/60 space-y-2 relative">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    {alt.title}
                  </h4>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Save {formatCurrencyINR(alt.potential_savings)}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans">{alt.description}</p>

                <div className="pt-2 border-t border-red-900/30 text-[11px] text-zinc-400">
                  <span className="text-amber-400 font-bold">Trade-off: </span>
                  {alt.trade_off}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replanning History Feed */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-red-900/20">
          <History className="w-4 h-4 text-red-400" />
          Replanning History & Audit Logs
        </h3>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {replanningHistory.map((hist) => (
            <div key={hist.id} className="bg-[#080a0e] p-3 rounded border border-red-900/20 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{hist.change_trigger}</span>
                  <span className="text-[10px] text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800/60">
                    {hist.delta_summary}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{hist.resolution_strategy}</p>
              </div>

              <div className="text-[10px] text-zinc-500 shrink-0">
                {new Date(hist.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
