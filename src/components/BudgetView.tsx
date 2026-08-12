import React from 'react';
import { 
  PieChart as PieIcon, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Users,
  Building2,
  Store
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { EventEntity } from '../types';
import { formatCurrencyINR } from '../lib/api';

interface BudgetViewProps {
  currentEvent: EventEntity;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ currentEvent }) => {
  const plan = currentEvent.plan;
  const budget = plan?.budget;
  const vendors = plan?.selected_vendors || [];

  const totalBudget = currentEvent.total_budget;
  const venueCost = budget?.venue_cost || 0;
  const totalVendorCost = budget?.total_vendor_cost || 0;
  const contingencyCost = budget?.contingency_cost || 0;
  const estimatedTotal = budget?.estimated_total || 0;
  const remainingBudget = budget?.remaining_budget ?? (totalBudget - estimatedTotal);
  const isOverBudget = budget?.is_over_budget;

  const costPerAttendee = currentEvent.expected_attendees > 0
    ? Math.round(estimatedTotal / currentEvent.expected_attendees)
    : 0;

  // Chart Data
  const categoriesData = [
    { name: 'Venue', cost: venueCost, color: '#ef4444' },
    ...vendors.map((v, i) => ({
      name: v.category,
      cost: v.calculated_cost,
      color: ['#f97316', '#3b82f6', '#a855f7', '#10b981', '#ec4899', '#eab308'][i % 6]
    })),
    { name: 'Contingency', cost: contingencyCost, color: '#06b6d4' }
  ];

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1017] p-4 rounded-lg border border-red-900/30">
          <span className="text-[10px] uppercase text-zinc-400 font-mono">Target Budget Allocation</span>
          <div className="text-xl font-bold text-white mt-1">{formatCurrencyINR(totalBudget)}</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Baseline Allocation</span>
        </div>

        <div className="bg-[#0e1017] p-4 rounded-lg border border-red-900/30">
          <span className="text-[10px] uppercase text-zinc-400 font-mono">Total Estimated Cost</span>
          <div className="text-xl font-bold text-red-400 mt-1">{formatCurrencyINR(estimatedTotal)}</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Venue + Vendors + Contingency</span>
        </div>

        <div className={`p-4 rounded-lg border ${isOverBudget ? 'bg-red-950/80 border-red-600/80 text-red-200' : 'bg-[#0e1017] border-emerald-800/40'}`}>
          <span className="text-[10px] uppercase font-mono">{isOverBudget ? 'Budget Deficit' : 'Remaining Contingency Surplus'}</span>
          <div className="text-xl font-bold mt-1">{formatCurrencyINR(remainingBudget)}</div>
          <span className="text-[10px] mt-1 block">{isOverBudget ? 'Requires AI Optimization' : 'Buffer Intact'}</span>
        </div>

        <div className="bg-[#0e1017] p-4 rounded-lg border border-red-900/30">
          <span className="text-[10px] uppercase text-zinc-400 font-mono">Per-Attendee Unit Cost</span>
          <div className="text-xl font-bold text-amber-400 mt-1">₹{costPerAttendee.toLocaleString('en-IN')}/head</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">For {currentEvent.expected_attendees} expected guests</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-red-400" />
            Budget Breakdown by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriesData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis type="number" stroke="#6b7280" tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={90} />
                <Tooltip formatter={(val: number) => [formatCurrencyINR(val), 'Cost']} contentStyle={{ backgroundColor: '#090b10', borderColor: '#7f1d1d', color: '#fff' }} />
                <Bar dataKey="cost" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Saving AI Trade-offs */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              AI Budget Agent Optimization Analysis
            </h3>
            <p className="text-xs text-zinc-400 font-sans mb-4">
              Real-time financial audit performed against current market vendor price indices.
            </p>

            {budget?.cost_saving_alternatives && budget.cost_saving_alternatives.length > 0 ? (
              <div className="space-y-3">
                {budget.cost_saving_alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-[#080a0e] p-3 rounded border border-red-900/30 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>{alt.title}</span>
                      <span className="text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 text-[10px]">
                        Save {formatCurrencyINR(alt.potential_savings)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans">{alt.description}</p>
                    <div className="text-[10px] text-zinc-500">
                      <span className="text-amber-400">Trade-off:</span> {alt.trade_off}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 p-6 text-center border border-dashed border-red-900/30 rounded">
                ✓ Budget allocation is optimal. No cost-saving compromises needed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Line Items Table */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-400" />
          Master Expense Line Items
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#080a0e] text-zinc-400 border-b border-red-900/40 uppercase">
                <th className="p-3">Category</th>
                <th className="p-3">Vendor / Service Provider</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3">Scaled Quantity</th>
                <th className="p-3">Total Calculated Cost</th>
                <th className="p-3">Logistics Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20 text-zinc-300">
              {/* Venue */}
              <tr className="hover:bg-[#121520]">
                <td className="p-3 font-bold text-white">Venue Rental</td>
                <td className="p-3 text-red-400 font-semibold">{plan?.selected_venue?.name || 'Unassigned'}</td>
                <td className="p-3">{formatCurrencyINR(plan?.selected_venue?.cost_per_day || 0)}/day</td>
                <td className="p-3">1 day</td>
                <td className="p-3 font-bold text-white">{formatCurrencyINR(venueCost)}</td>
                <td className="p-3 text-zinc-400 text-[11px]">{plan?.selected_venue?.location}</td>
              </tr>

              {/* Vendors */}
              {vendors.map((v) => (
                <tr key={v.vendor_id} className="hover:bg-[#121520]">
                  <td className="p-3 font-bold text-white">{v.category}</td>
                  <td className="p-3 text-red-400 font-semibold">{v.vendor_name}</td>
                  <td className="p-3">{v.unit_cost > 0 ? `₹${v.unit_cost}/unit` : 'Fixed Fee'}</td>
                  <td className="p-3">{v.quantity}</td>
                  <td className="p-3 font-bold text-white">{formatCurrencyINR(v.calculated_cost)}</td>
                  <td className="p-3 text-zinc-400 text-[11px]">{v.notes}</td>
                </tr>
              ))}

              {/* Contingency Line */}
              <tr className="hover:bg-[#121520] bg-[#0c0f18]">
                <td className="p-3 font-bold text-emerald-400">Contingency Buffer</td>
                <td className="p-3 text-zinc-300">Emergency Reserve (8% baseline)</td>
                <td className="p-3">Variable %</td>
                <td className="p-3">1 event</td>
                <td className="p-3 font-bold text-emerald-400">{formatCurrencyINR(contingencyCost)}</td>
                <td className="p-3 text-zinc-400 text-[11px]">Unbudgeted last-minute expense cushion</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
