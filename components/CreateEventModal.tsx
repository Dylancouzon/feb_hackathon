"use client";

import { useState } from "react";
import type { Event } from "@/lib/store";

type CreateEventModalProps = {
  onClose: () => void;
  onSave: (event: Omit<Event, "id" | "participants">) => void;
  pendingLocation: { lng: number; lat: number } | null;
  onClearPendingLocation: () => void;
};

export default function CreateEventModal({
  onClose,
  onSave,
  pendingLocation,
  onClearPendingLocation,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");

  if (!pendingLocation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !datetime) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      datetime,
      latitude: pendingLocation.lat,
      longitude: pendingLocation.lng,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 pointer-events-none">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Activity</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 mb-4">
              <span className="text-green-600 text-sm font-medium">Location set</span>
              <span className="text-gray-500 text-sm">
                {pendingLocation.lat.toFixed(4)}, {pendingLocation.lng.toFixed(4)}
              </span>
              <button
                type="button"
                onClick={onClearPendingLocation}
                className="ml-auto text-sm text-accent hover:underline"
              >
                Change
              </button>
            </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Coffee at Devoción"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's the plan?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & time
                </label>
                <input
                  id="datetime"
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !datetime}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
