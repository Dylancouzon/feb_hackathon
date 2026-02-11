"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getEvents, addEvent, joinEvent, updateEventAiEnhanced } from "@/lib/store";
import type { Event } from "@/lib/store";
import MapView from "@/components/MapView";
import CreateEventModal from "@/components/CreateEventModal";
import EventModal from "@/components/EventModal";
import TabBar, { type TabId } from "@/components/TabBar";
import FriendsView from "@/components/FriendsView";
import ActivityChatsView from "@/components/ActivityChatsView";

const MapViewDynamic = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
      Loading map…
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;

  const runEnhance = useCallback(async (eventId: string, event: Event) => {
    setEnhancingId(eventId);
    const fallback = {
      weather: "Check a weather app for the day.",
      nearbySuggestion: "Search for venues near the pin.",
      backupPlan: "Pick another spot or reschedule.",
    };
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      if (!res.ok) throw new Error("Enhance failed");
      const data = await res.json();
      const updated = data.event as Event;
      const aiEnhanced = updated?.aiEnhanced ?? fallback;
      updateEventAiEnhanced(eventId, aiEnhanced);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, aiEnhanced } : e))
      );
    } catch {
      updateEventAiEnhanced(eventId, fallback);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, aiEnhanced: fallback } : e))
      );
    } finally {
      setEnhancingId(null);
    }
  }, []);

  const CREATOR_NAME = "Dylan C";

  const handleCreateSave = useCallback((event: Omit<Event, "id" | "participants">) => {
    const created = addEvent(event);
    joinEvent(created.id, CREATOR_NAME);
    setEvents([...getEvents()]);
    setCreateOpen(false);
    setPendingLocation(null);
    setSelectedEventId(created.id);
    runEnhance(created.id, getEvents().find((e) => e.id === created.id) ?? created);
  }, [runEnhance]);

  const handleJoin = useCallback((eventId: string, name: string) => {
    const updated = joinEvent(eventId, name);
    if (updated) {
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    }
  }, []);

  const handleMapClickForCreate = createOpen
    ? (lngLat: { lng: number; lat: number }) => setPendingLocation(lngLat)
    : undefined;

  return (
    <main className="flex flex-col h-screen w-full bg-gray-900">
      <div className="shrink-0 flex items-center justify-center h-14 px-4 bg-white/95 backdrop-blur shadow-sm z-10">
        <h1 className="text-lg font-semibold text-gray-900">Actually Hang</h1>
      </div>

      <div className="flex-1 min-h-0 relative">
        {activeTab === "map" && (
          <>
            <div className="absolute inset-0">
              <MapViewDynamic
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                onMapClick={handleMapClickForCreate}
                previewLocation={pendingLocation}
              />
            </div>
            <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
              {createOpen && !pendingLocation && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 max-w-[200px] flex items-center gap-2">
                  <span>Click on the map to choose the location</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateOpen(false);
                      setPendingLocation(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5"
                    aria-label="Cancel"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setCreateOpen((open) => {
                    if (open) {
                      setPendingLocation(null);
                      return false;
                    }
                    setPendingLocation(null);
                    return true;
                  });
                }}
                className="w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover flex items-center justify-center text-2xl font-light"
                aria-label="Create activity"
              >
                +
              </button>
            </div>
          </>
        )}
        {activeTab === "friends" && <FriendsView />}
        {activeTab === "chats" && <ActivityChatsView events={events} />}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {createOpen && pendingLocation && (
        <CreateEventModal
          onClose={() => {
            setCreateOpen(false);
            setPendingLocation(null);
          }}
          onSave={handleCreateSave}
          pendingLocation={pendingLocation}
          onClearPendingLocation={() => setPendingLocation(null)}
        />
      )}

      {selectedEvent && !createOpen && activeTab === "map" && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onJoin={handleJoin}
          isEnhancing={enhancingId === selectedEvent.id}
        />
      )}
    </main>
  );
}
