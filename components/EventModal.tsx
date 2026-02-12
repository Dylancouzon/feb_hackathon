"use client";

import { useState } from "react";
import type { Event } from "@/lib/store";
import { PARTICIPANT_SCORES } from "@/lib/communityScores";

const DEMO_USER = "Dylan C";

type EventModalProps = {
  event: Event;
  onClose: () => void;
  onJoin: (eventId: string, name: string) => void;
  isEnhancing?: boolean;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventModal({
  event,
  onClose,
  onJoin,
  isEnhancing = false,
}: EventModalProps) {
  const [joined, setJoined] = useState(event.participants.includes(DEMO_USER));

  const handleJoin = () => {
    onJoin(event.id, DEMO_USER);
    setJoined(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:flex sm:items-end sm:justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="min-w-0">
              {event.category && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700 mb-2">
                  {event.category}
                </span>
              )}
              <h2 className="text-xl font-semibold text-gray-900 truncate">{event.title}</h2>
              <p className="text-sm text-gray-500">{formatDateTime(event.datetime)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">{event.description}</p>
          )}

          {(event.aiEnhanced || isEnhancing) && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50/80 border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">AI suggestions</h3>
              {isEnhancing ? (
                <p className="text-sm text-gray-600">AI is planning your meetup…</p>
              ) : (
                <>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {event.aiEnhanced?.weather && (
                      <li>
                        <span className="font-medium text-gray-600">Weather:</span>{" "}
                        {event.aiEnhanced.weather}
                      </li>
                    )}
                    {event.aiEnhanced?.nearbySuggestion && (
                      <li>
                        <span className="font-medium text-gray-600">Nearby:</span>{" "}
                        {event.aiEnhanced.nearbySuggestion}
                      </li>
                    )}
                    {event.aiEnhanced?.backupPlan && (
                      <li>
                        <span className="font-medium text-gray-600">Backup:</span>{" "}
                        {event.aiEnhanced.backupPlan}
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-blue-100">
                    Powered by Tavily & OpenAI
                  </p>
                </>
              )}
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Participants ({event.participants.length})
            </h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              {event.participants.map((p) => {
                const scores = PARTICIPANT_SCORES[p];
                return (
                  <li
                    key={p}
                    className={`flex items-center justify-between gap-2 ${p === DEMO_USER ? "font-medium text-accent" : ""}`}
                  >
                    <span>{p === DEMO_USER ? `${p} (you)` : p}</span>
                    {scores && (
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-emerald-600">
                          {scores.showUp}%
                        </span>
                        <span className="text-xs font-medium text-amber-600">
                          {scores.vibe}/5
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {!joined && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleJoin}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
