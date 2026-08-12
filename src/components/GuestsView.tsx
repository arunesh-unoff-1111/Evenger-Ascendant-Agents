import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Mail, 
  Phone, 
  Utensils, 
  Plus, 
  Filter,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Guest, EventEntity } from '../types';
import { fetchGuests, createGuest, submitRSVP } from '../lib/api';

interface GuestsViewProps {
  currentEvent: EventEntity;
}

export const GuestsView: React.FC<GuestsViewProps> = ({ currentEvent }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'VIP' | 'Speaker' | 'Attendee' | 'Sponsor' | 'Press'>('Attendee');
  const [newDiet, setNewDiet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGuests = () => {
    setLoading(true);
    fetchGuests(currentEvent.id)
      .then(res => setGuests(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGuests();
  }, [currentEvent.id]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setIsSubmitting(true);
    try {
      await createGuest(currentEvent.id, {
        name: newName,
        email: newEmail,
        phone: newPhone,
        role: newRole,
        dietary_requirements: newDiet
      });
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewDiet('');
      loadGuests();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRSVP = async (guestId: string, status: 'Attending' | 'Declined' | 'Pending') => {
    try {
      await submitRSVP(currentEvent.id, {
        guest_id: guestId,
        status: status
      });
      loadGuests();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalGuests = guests.length;
  const attendingCount = guests.filter(g => g.rsvp_status === 'Attending').length;
  const pendingCount = guests.filter(g => g.rsvp_status === 'Pending').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'Declined').length;
  const invitedCount = guests.filter(g => g.rsvp_status === 'Invited').length;

  const rsvpData = [
    { name: 'Attending', value: attendingCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Declined', value: declinedCount, color: '#ef4444' },
    { name: 'Invited', value: invitedCount, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  // Filtered List
  const filteredGuests = guests.filter(g => {
    if (filterRole !== 'ALL' && g.role !== filterRole) return false;
    if (filterStatus !== 'ALL' && g.rsvp_status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
            ATTENDEE MESH & RSVP TRACKER
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Guests & RSVP Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Real-time guest registration feed, dietary preferences tracker, and badge dispatch system.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded border border-red-400 flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg grid grid-cols-2 gap-3 col-span-2">
          <div className="bg-[#080a0e] p-3 rounded border border-emerald-900/40">
            <span className="text-[10px] text-emerald-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Confirmed Attending
            </span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{attendingCount}</span>
          </div>

          <div className="bg-[#080a0e] p-3 rounded border border-amber-900/40">
            <span className="text-[10px] text-amber-400 uppercase flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Pending Responses
            </span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{pendingCount}</span>
          </div>

          <div className="bg-[#080a0e] p-3 rounded border border-red-900/40">
            <span className="text-[10px] text-red-400 uppercase flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Declined
            </span>
            <span className="text-2xl font-bold text-red-400 mt-1 block">{declinedCount}</span>
          </div>

          <div className="bg-[#080a0e] p-3 rounded border border-blue-900/40">
            <span className="text-[10px] text-blue-400 uppercase">Total Guest Registry</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalGuests}</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg flex flex-col justify-center items-center relative">
          <h4 className="text-xs text-zinc-400 uppercase mb-2">RSVP Ratio Breakdown</h4>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rsvpData} innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {rsvpData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} stroke="#0e1017" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#090b10', borderColor: '#7f1d1d', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-red-900/20">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400 uppercase">Filter Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-[#121520] text-white border border-red-900/40 rounded px-2 py-1 text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="VIP">VIP</option>
              <option value="Speaker">Speaker</option>
              <option value="Attendee">Attendee</option>
              <option value="Sponsor">Sponsor</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 uppercase">Filter RSVP:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#121520] text-white border border-red-900/40 rounded px-2 py-1 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Attending">Attending</option>
              <option value="Pending">Pending</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#080a0e] text-zinc-400 border-b border-red-900/40 uppercase">
                <th className="p-3">Guest Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Dietary Request</th>
                <th className="p-3">RSVP Status</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20 text-zinc-300">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-[#121520]">
                  <td className="p-3 font-bold text-white">{g.name}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      g.role === 'VIP' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                      g.role === 'Speaker' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {g.role}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{g.email}</td>
                  <td className="p-3 text-zinc-400">{g.dietary_requirements || 'None'}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      g.rsvp_status === 'Attending' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      g.rsvp_status === 'Declined' ? 'bg-red-950 text-red-300 border-red-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {g.rsvp_status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleQuickRSVP(g.id, 'Attending')}
                      className="text-[10px] bg-emerald-950 hover:bg-emerald-800 text-emerald-200 border border-emerald-800 px-1.5 py-0.5 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleQuickRSVP(g.id, 'Declined')}
                      className="text-[10px] bg-red-950 hover:bg-red-800 text-red-200 border border-red-800 px-1.5 py-0.5 rounded"
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border-2 border-red-600 rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-400" />
              Add Guest to Registry
            </h3>

            <form onSubmit={handleAddGuest} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-1.5"
                />
              </div>

              <div>
                <label className="text-zinc-400 uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-1.5"
                />
              </div>

              <div>
                <label className="text-zinc-400 uppercase block mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-1.5"
                >
                  <option value="Attendee">Attendee</option>
                  <option value="VIP">VIP</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Press">Press</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase block mb-1">Dietary Requirements</label>
                <input
                  type="text"
                  value={newDiet}
                  onChange={(e) => setNewDiet(e.target.value)}
                  className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-1.5"
                  placeholder="e.g. Vegetarian, Gluten-Free"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-white px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
