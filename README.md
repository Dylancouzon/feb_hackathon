# Actually Hang

**AI-powered IRL meetup coordination for NYC.**

Actually Hang is a hackathon MVP that helps people create and discover real-world hangouts on a map. Create an activity, pick a spot, and get instant AI suggestions—weather, nearby venues, and a backup plan—so you can actually hang instead of endless planning.

---

## What it does

- **Map** — Full-screen NYC map with activity pins (participant count). Tap a pin to see details, view AI suggestions, and join. Create new activities by tapping +, choosing a location on the map, then filling in title, description, and time. The creator is auto-added as a participant; every new event gets AI suggestions (weather, nearby spots, backup plan) automatically.
- **Friends** — A friends list (demo UI) to make the app feel complete. Names and statuses are hardcoded.
- **Activity Chats** — One group chat per activity. Tap an activity to open a fake thread with placeholder messages. UI only; no real messaging.

---

## Tech stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **Mapbox GL JS** + **react-map-gl** for the map (dark style, NYC-centered)
- **Tavily** for live web search (weather, nearby venues)
- **OpenAI** (gpt-4o-mini) to turn search results into structured suggestions
- **In-memory store** — no database; events live in `lib/store.ts`

---

## Run locally

1. **Env** — Copy `env.txt` to `.env.local` and set:
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — [Mapbox](https://mapbox.com) (needed for the map)
   - `TAVILY_API_KEY` — [Tavily](https://tavily.com)
   - `OPENAI_API_KEY` — [OpenAI](https://platform.openai.com)

2. **Install & dev**
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

**From another device on the same Wi‑Fi:** Run `npm run dev -- -H 0.0.0.0`, then open `http://<your-machine-ip>:3000` (e.g. `http://192.168.1.42:3000`).

---

## Project status

Hackathon MVP. No authentication, no persistence, no real chat or friends backend. Built for a clear demo: map, create, join, and AI-enhanced suggestions in one flow.

For full build instructions and implementation details, see **instructions.md**. For a presentation-style overview, see **PROJECT.md**.
