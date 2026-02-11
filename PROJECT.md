# Actually Hang — Project Overview

**AI-powered IRL meetup coordination for NYC.**

A hackathon MVP that helps people create and discover real-world hangouts on a map, with AI-generated suggestions (weather, nearby spots, backup plans) added automatically to every new plan.

---

## What It Does

- **Map tab** — Full-screen NYC map with activity pins showing participant count. Click a pin to see details, join, and view AI suggestions (weather, nearby venues, backup plan). Create flow: tap + → tooltip “Click on the map to choose the location” → pick a spot on the map → modal to enter title, description, date/time → Save. The creator is automatically added as a participant.
- **Friends tab** — Hardcoded list of friends (names + status) for demo polish. UI only; no real friend graph or auth.
- **Activity Chats tab** — One group chat per activity. List of activities; tap one to open a fake chat thread (placeholder messages, no real messaging). Demo UI only.
- **AI suggestions** — Every new event is enhanced via Tavily + OpenAI (weather, nearby venues, backup plan). All three seeded events also have pre-filled AI suggestions. No “improved description”; the app does not rewrite the user’s event text.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 15 (App Router) | Fast dev with Turbopack, API routes, React server/client split. |
| **Language** | TypeScript | Type safety and better DX. |
| **Styling** | Tailwind CSS | Utility-first, one accent color (blue), minimal layout. |
| **Map** | Mapbox GL JS + react-map-gl | Dark map style, NYC-centered, markers and map click handling. |
| **AI / Search** | Tavily + OpenAI | Tavily for live web search (weather, nearby venues); OpenAI (gpt-4o-mini) for structured suggestions (weather, nearby, backup only). |
| **State** | In-memory store | No DB for the MVP; events in `lib/store.ts` (array + helpers). |

### Key dependencies

- **next** — React framework, App Router, API routes.
- **react-map-gl** + **mapbox-gl** — Map and markers.
- **@tavily/core** — Tavily search API (weather, venue search).
- **openai** — OpenAI API for structured AI enhancement.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (React)                                              │
│  • TabBar: Map | Friends | Activity Chats                     │
│  • Map tab: MapView, Create FAB + tooltip, CreateEventModal,  │
│             EventModal (details, join, AI suggestions)        │
│  • Friends tab: FriendsView (hardcoded list)                 │
│  • Chats tab: ActivityChatsView (list + fake chat threads)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │  POST /api/enhance (on create)
                            │  GET /api/events (optional)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  API Route: /api/enhance                                     │
│  1. Tavily: weather for event date + nearby venues           │
│  2. OpenAI: JSON (weather, nearbySuggestion, backupPlan)     │
│  3. Return enhanced event (fallbacks if APIs fail)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  lib/store.ts — in-memory events, getEvents, addEvent,       │
│  joinEvent, updateEventAiEnhanced. Seed: 3 events with       │
│  AI suggestions; Dylan C as participant in all three.        │
└─────────────────────────────────────────────────────────────┘
```

- **Create flow:** Tap + → tooltip above button → click map to set location → modal opens with form → Save → event stored, creator added as participant, `/api/enhance` runs in background; modal shows “AI is planning…” then AI suggestions.
- **No database:** All state is in memory; suitable for a demo/MVP.

---

## Project Structure

```
feb_hackathon/
├── app/
│   ├── api/
│   │   ├── enhance/route.ts   # Tavily + OpenAI enhancement
│   │   └── events/route.ts   # GET events (optional)
│   ├── layout.tsx
│   ├── page.tsx              # Tabs, map/friends/chats, create & event modals
│   └── globals.css
├── components/
│   ├── MapView.tsx           # Mapbox map, pins (participant count), map/marker click
│   ├── CreateEventModal.tsx  # Event form (shown after location chosen on map)
│   ├── EventModal.tsx        # Event details, join, AI suggestions block
│   ├── TabBar.tsx            # Bottom nav: Map, Friends, Activity Chats
│   ├── FriendsView.tsx       # Hardcoded friends list (UI only)
│   └── ActivityChatsView.tsx # Per-activity chat list + fake chat thread UI
├── lib/
│   └── store.ts              # Event type, in-memory store, 3 seeded events
├── package.json
├── tailwind.config.ts
└── PROJECT.md                # This file
```

---

## Running the Project

1. Copy `env.txt` to `.env.local` and set:
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (Mapbox)
   - `TAVILY_API_KEY` (Tavily)
   - `OPENAI_API_KEY` (OpenAI)
2. `npm install` then `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

Demo user is **Dylan C** (creator/joiner; no authentication). Dylan C is pre-added as a participant in all three seeded activities.

---

## Summary for the Pitch

**Actually Hang** is a minimal, map-first app for creating and joining IRL hangouts in NYC. The app has three tabs: **Map** (activities on a dark NYC map with AI suggestions per event), **Friends** (a static friends list for demo), and **Activity Chats** (one group chat UI per activity, demo only). Every new plan is automatically enhanced with AI (weather, nearby spots, backup plan) using **Tavily** and **OpenAI**. The creator is auto-added as a participant; no “Enhance with AI” button. Built with **Next.js**, **TypeScript**, **Tailwind**, and **Mapbox** for a clear, demo-ready MVP.
