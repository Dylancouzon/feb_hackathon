export type Event = {
  id: string;
  title: string;
  description: string;
  datetime: string;
  latitude: number;
  longitude: number;
  participants: string[];
  aiEnhanced?: {
    weather?: string;
    nearbySuggestion?: string;
    backupPlan?: string;
    improvedDescription?: string;
  };
};

const events: Event[] = [
  {
    id: "evt-1",
    title: "Coffee at Devoción",
    description: "Casual coffee and chat. Great for remote workers.",
    datetime: "2025-02-15T10:00:00",
    latitude: 40.7089,
    longitude: -73.9572,
    participants: ["Dylan C", "Alex K"],
    aiEnhanced: {
      weather: "Partly cloudy, high 48°F. Good for a jacket.",
      nearbySuggestion: "Devoción (Williamsburg) — specialty coffee, plenty of seating.",
      backupPlan: "If packed: Sweatshop Coffee or Partners Coffee nearby.",
    },
  },
  {
    id: "evt-2",
    title: "Rooftop Sunset",
    description: "Watch the sunset from a Brooklyn rooftop. BYOB.",
    datetime: "2025-02-16T17:30:00",
    latitude: 40.6782,
    longitude: -73.9442,
    participants: ["Dylan C", "Morgan L"],
    aiEnhanced: {
      weather: "Clear evening, low 40s°F. Bring a layer for the roof.",
      nearbySuggestion: "Westlight or Elsewhere — rooftop bars with skyline views in Williamsburg.",
      backupPlan: "If weather turns: indoor bar with big windows (e.g. The Ides).",
    },
  },
  {
    id: "evt-3",
    title: "Central Park Walk",
    description: "Easy loop around the reservoir. All paces welcome.",
    datetime: "2025-02-17T09:00:00",
    latitude: 40.7829,
    longitude: -73.9654,
    participants: ["Dylan C", "Sam R", "Jordan L"],
    aiEnhanced: {
      weather: "Sunny, high 50°F. Good for a light jacket.",
      nearbySuggestion: "Reservoir loop (~1.5 mi). Coffee at Bluestone Lane or Le Pain Quotidien after.",
      backupPlan: "If rain: American Museum of Natural History or run the Mall instead.",
    },
  },
];

export function getEvents(): Event[] {
  return events;
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function addEvent(event: Omit<Event, "id" | "participants">): Event {
  const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newEvent: Event = {
    ...event,
    id,
    participants: [],
  };
  events.push(newEvent);
  return newEvent;
}

export function joinEvent(eventId: string, name: string): Event | null {
  const event = events.find((e) => e.id === eventId);
  if (!event || event.participants.includes(name)) return null;
  event.participants.push(name);
  return event;
}

export function updateEventAiEnhanced(
  eventId: string,
  aiEnhanced: Event["aiEnhanced"]
): Event | null {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  event.aiEnhanced = aiEnhanced;
  return event;
}
