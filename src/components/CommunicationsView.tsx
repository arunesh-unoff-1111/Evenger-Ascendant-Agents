import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Store, 
  MessageSquareText,
  Clock
} from 'lucide-react';
import { CommunicationMessage, EventEntity } from '../types';
import { fetchMessages, sendMessage } from '../lib/api';

interface CommunicationsViewProps {
  currentEvent: EventEntity;
}

export const CommunicationsView: React.FC<CommunicationsViewProps> = ({ currentEvent }) => {
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Message Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState<'guest' | 'vendor' | 'all'>('all');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'Portal' | 'WhatsApp'>('Email');
  const [isSending, setIsSending] = useState(false);

  const loadMessages = () => {
    setLoading(true);
    fetchMessages(currentEvent.id)
      .then(res => setMessages(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, [currentEvent.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    try {
      await sendMessage(currentEvent.id, {
        recipient_type: recipientType,
        recipient_target: recipientType === 'guest' ? 'All Registered Guests' : recipientType === 'vendor' ? 'Selected Vendor Partners' : 'All Stakeholders',
        channel: channel,
        title: title,
        content: content,
        trigger_reason: 'Manual Dispatch via Communication Hub'
      });
      setTitle('');
      setContent('');
      loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header */}
      <div className="bg-[#0f1118] border border-red-900/40 rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
            AUTOMATED DISPATCH MESH
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Communication Agent Dispatch Hub
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            AI Communication Agent generates and dispatches calibrated broadcast notices to guests and vendors upon replanning triggers.
          </p>
        </div>

        <div className="bg-[#080a0e] px-4 py-2 rounded border border-red-900/30 text-xs text-right">
          <span className="text-zinc-500 block">Total Dispatches:</span>
          <span className="font-bold text-cyan-400">{messages.length} Messages</span>
        </div>
      </div>

      {/* New Message Composer */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <Send className="w-4 h-4 text-red-400" />
          Dispatch Broadcast Notice
        </h3>

        <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 uppercase block mb-1">Target Audience</label>
              <select
                value={recipientType}
                onChange={(e: any) => setRecipientType(e.target.value)}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Stakeholders (Guests & Vendors)</option>
                <option value="guest">Registered Guests Only</option>
                <option value="vendor">Vendor Partners Only</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 uppercase block mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e: any) => setChannel(e.target.value)}
                className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="Email">Email Broadcast</option>
                <option value="SMS">SMS / WhatsApp</option>
                <option value="Portal">Vendor Portal Dispatch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 uppercase block mb-1">Subject Line / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. [EventPilot Notice] Venue & Headcount Update"
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 uppercase block mb-1">Message Content</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter broadcast message body..."
              className="w-full bg-[#131620] text-white border border-red-800/60 rounded px-3 py-2 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded border border-red-400 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching...' : 'Transmit Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Message Feed */}
      <div className="bg-[#0e1017] border border-red-900/30 rounded-lg p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-red-900/20 pb-3">
          <Radio className="w-4 h-4 text-red-400" />
          Broadcast Transmission Logs
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading messages...</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-[#080a0e] p-4 rounded-md border border-red-900/30 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                      {msg.channel}
                    </span>
                    <span className="text-xs font-bold text-white">{msg.title}</span>
                  </div>

                  <span className="text-[10px] text-zinc-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans whitespace-pre-wrap">{msg.content}</p>

                <div className="pt-2 border-t border-red-900/20 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Target: <strong className="text-zinc-300">{msg.recipient_target}</strong></span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Status: {msg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
