import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Users, 
  IndianRupee, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { EventEntity, SelectedVendor } from '../types';
import { fetchAllVendors, formatCurrencyINR } from '../lib/api';

interface VendorsViewProps {
  currentEvent: EventEntity;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ currentEvent }) => {
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAllVendors()
      .then(res => setAllVendors(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedVendors = currentEvent.plan?.selected_vendors || [];
  const expectedAttendees = currentEvent.expected_attendees || 500;
  const totalVendorCost = selectedVendors.reduce((acc, curr) => acc + curr.calculated_cost, 0);

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Banner */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
            DYNAMIC SUPPLY CHAIN SCALER
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Vendor Agent & Procurement Matrix
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            AI Vendor Agent scales supply line items (catering plates, Wi-Fi bandwidth, security guards) dynamically based on headcount ({expectedAttendees} attendees).
          </p>
        </div>

        <div className="bg-[#080a0e] px-4 py-2 rounded border border-red-900/30 text-xs text-right">
          <span className="text-zinc-500 block">Total Scaled Procurement:</span>
          <span className="font-bold text-red-400">{formatCurrencyINR(totalVendorCost)}</span>
        </div>
      </div>

      {/* Selected Vendors Scaled Matrix */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-red-900/20 pb-3">
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4 text-red-400" />
            Active Scaled Vendor Allocations
          </span>
          <span className="text-xs text-zinc-400">{selectedVendors.length} Service Categories</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="bg-[#080a0e] border border-red-900/30 rounded-md p-4 hover:border-red-600/50 transition-colors flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                    {v.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {formatCurrencyINR(v.calculated_cost)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2">{v.vendor_name}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">{v.notes}</p>
              </div>

              <div className="pt-2 border-t border-red-900/20 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Unit Cost</span>
                  <span className="text-zinc-200 font-bold">{v.unit_cost > 0 ? `₹${v.unit_cost}/person` : 'Fixed Fee'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Scaled Headcount</span>
                  <span className="text-red-400 font-bold">{v.quantity} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog of Vendor Directory */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <Layers className="w-4 h-4 text-red-400" />
          Master Vendor Catalog & Category Options
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#080a0e] text-zinc-400 border-b border-red-900/40 uppercase">
                  <th className="p-3">Category</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Tier / Model</th>
                  <th className="p-3">Unit Price Rate</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/20 text-zinc-300">
                {allVendors.map((v) => {
                  const isSelected = selectedVendors.some(sv => sv.vendor_id === v.id);
                  return (
                    <tr key={v.id} className={`hover:bg-[#121520] ${isSelected ? 'bg-red-950/20 font-bold' : ''}`}>
                      <td className="p-3 text-white">{v.category}</td>
                      <td className="p-3 text-red-400">{v.name}</td>
                      <td className="p-3 text-zinc-400">{v.tier}</td>
                      <td className="p-3">{v.unit_cost > 0 ? `₹${v.unit_cost}/person` : `₹${v.base_cost.toLocaleString('en-IN')} fixed`}</td>
                      <td className="p-3">
                        {isSelected ? (
                          <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            ✓ ACTIVE IN PLAN
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[10px]">Catalog Option</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
