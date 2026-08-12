import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllEvents, 
  fetchEventById, 
  fetchReplanningHistory, 
  fetchAgentActions,
  triggerDynamicReplan 
} from './lib/api';
import { 
  EventEntity, 
  EventPlan, 
  ReplanningHistory, 
  AgentActionLog, 
  NavTab 
} from './types';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PlanningView } from './components/PlanningView';
import { BudgetView } from './components/BudgetView';
import { VenuesView } from './components/VenuesView';
import { VendorsView } from './components/VendorsView';
import { GuestsView } from './components/GuestsView';
import { ScheduleView } from './components/ScheduleView';
import { CommunicationsView } from './components/CommunicationsView';
import { AiAgentsView } from './components/AiAgentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { NewEventModal } from './components/NewEventModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [currentEvent, setCurrentEvent] = useState<EventEntity | null>(null);
  const [replanningHistory, setReplanningHistory] = useState<ReplanningHistory[]>([]);
  const [agentActions, setAgentActions] = useState<AgentActionLog[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);

  // Load initial events list
  const loadEventsList = useCallback(async () => {
    try {
      const data = await fetchAllEvents();
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error('[EventPilot Frontend] Error loading events:', err);
    }
  }, [selectedEventId]);

  // Load selected event data
  const loadEventDetails = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setIsRefreshing(true);
    try {
      const [evt, history, actions] = await Promise.all([
        fetchEventById(eventId),
        fetchReplanningHistory(eventId),
        fetchAgentActions(eventId)
      ]);

      setCurrentEvent(evt);
      setReplanningHistory(history);
      setAgentActions(actions);
    } catch (err) {
      console.error('[EventPilot Frontend] Error loading event details:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventsList();
  }, [loadEventsList]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventDetails(selectedEventId);
    }
  }, [selectedEventId, loadEventDetails]);

  // Handle plan updated callback from real replanning execution
  const handlePlanUpdated = (updatedEvent: EventEntity, newPlan: EventPlan, historyItem: ReplanningHistory) => {
    setCurrentEvent(updatedEvent);
    setReplanningHistory(prev => [historyItem, ...prev]);
    // Refresh agent actions feed
    fetchAgentActions(updatedEvent.id).then(setAgentActions).catch(console.error);
    // Refresh events list
    loadEventsList();
  };

  const handleEventCreated = (newEvent: EventEntity) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 flex font-sans antialiased selection:bg-red-900 selection:text-white">
      {/* Background Subtle Technical Grid Matrix Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80000009_1px,transparent_1px),linear-gradient(to_bottom,#80000009_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header
          currentEvent={currentEvent || undefined}
          activeTab={activeTab}
          onRefresh={() => selectedEventId && loadEventDetails(selectedEventId)}
          onQuickReplanClick={() => setActiveTab('Planning')}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {loading || !currentEvent ? (
            <div className="flex items-center justify-center h-64 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-3 bg-[#0d0f15] p-4 rounded border border-red-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Connecting to EventPilot AI Autonomous Mesh...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'Dashboard' && (
                <DashboardView
                  currentEvent={currentEvent}
                  agentActions={agentActions}
                  replanningHistory={replanningHistory}
                  onPlanUpdated={handlePlanUpdated}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'Planning' && (
                <PlanningView
                  currentEvent={currentEvent}
                  replanningHistory={replanningHistory}
                  onPlanUpdated={handlePlanUpdated}
                />
              )}

              {activeTab === 'Budget' && (
                <BudgetView currentEvent={currentEvent} />
              )}

              {activeTab === 'Venues' && (
                <VenuesView currentEvent={currentEvent} />
              )}

              {activeTab === 'Vendors' && (
                <VendorsView currentEvent={currentEvent} />
              )}

              {activeTab === 'Guests & RSVP' && (
                <GuestsView currentEvent={currentEvent} />
              )}

              {activeTab === 'Schedule' && (
                <ScheduleView currentEvent={currentEvent} />
              )}

              {activeTab === 'Communications' && (
                <CommunicationsView currentEvent={currentEvent} />
              )}

              {activeTab === 'AI Agents' && (
                <AiAgentsView currentEvent={currentEvent} agentActions={agentActions} />
              )}

              {activeTab === 'Reports' && (
                <ReportsView
                  currentEvent={currentEvent}
                  replanningHistory={replanningHistory}
                  agentActions={agentActions}
                />
              )}

              {activeTab === 'Settings' && (
                <SettingsView />
              )}

              {activeTab === 'Events' && (
                <div className="space-y-4 font-mono">
                  <div className="flex items-center justify-between pb-3 border-b border-red-900/30">
                    <h2 className="text-lg font-bold text-white uppercase">All Events Registry</h2>
                    <button
                      onClick={() => setIsNewEventModalOpen(true)}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded"
                    >
                      + New Event
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`bg-[#0e1017] p-4 rounded border cursor-pointer transition-all ${
                          evt.id === selectedEventId ? 'border-red-500 bg-[#120a0d]' : 'border-red-900/30 hover:border-red-700'
                        }`}
                      >
                        <h3 className="font-bold text-white text-sm">{evt.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{evt.location} • {evt.date}</p>
                        <div className="mt-3 flex justify-between text-xs font-bold text-red-400">
                          <span>{evt.expected_attendees} Headcount</span>
                          <span>₹{evt.total_budget.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
