"use client";

import { useState } from "react";
import type { Event } from "@/lib/store";

const CURRENT_USER = "Dylan C";

type ActivityChatsViewProps = {
  events: Event[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Fake messages for demo chat UI
const FAKE_MESSAGES: Record<string, { who: string; text: string }[]> = {
  "evt-1": [
    { who: "Alex K", text: "I’ll be there around 10:15" },
  ],
  "evt-2": [
    { who: "Morgan L", text: "Bringing a bottle of red 👋" },
  ],
  "evt-3": [
    { who: "Sam R", text: "Starting from the north side of the reservoir" },
    { who: "Jordan L", text: "See you there!" },
  ],
};

function getFakeMessages(eventId: string) {
  return FAKE_MESSAGES[eventId] ?? [{ who: "Actually Hang", text: "No messages yet. Say hi when you’re there!" }];
}

export default function ActivityChatsView({ events }: ActivityChatsViewProps) {
  const myEvents = events.filter((e) => e.participants.includes(CURRENT_USER));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = selectedEventId ? myEvents.find((e) => e.id === selectedEventId) : null;
  const messages = selectedEventId ? getFakeMessages(selectedEventId) : [];

  if (selectedEvent) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <header className="flex items-center gap-3 p-3 bg-white border-b border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedEventId(null)}
            className="text-accent font-medium text-sm"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{selectedEvent.title}</h2>
            <p className="text-xs text-gray-500">
              {selectedEvent.participants.length} participant{selectedEvent.participants.length !== 1 ? "s" : ""}
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.who === "Dylan C" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2 text-sm
                  ${msg.who === "Dylan C"
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"}
                `}
              >
                <p className="font-medium text-xs opacity-80 mb-0.5">{msg.who}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-gray-400 text-sm">
            Message
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-1">
        <h2 className="text-sm font-medium text-gray-500 px-2 mb-3">Activity Chats</h2>
        <p className="text-sm text-gray-500 px-2 mb-3">
          Chats for activities you’ve joined. Tap to open.
        </p>
        {myEvents.length === 0 ? (
          <p className="text-sm text-gray-500 px-2 py-4">
            Join an activity from the Map to see its chat here.
          </p>
        ) : (
          myEvents.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setSelectedEventId(event.id)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{event.title}</p>
              <p className="text-sm text-gray-500">
                {formatDate(event.datetime)} · {event.participants.length} participant
                {event.participants.length !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        )))}
      </div>
    </div>
  );
}
