# Project: Actually Hang
AI-powered IRL meetup coordination app for NYC.

## Goal
Build a minimal, clean MVP in Next.js where:
- Users create activity pins on a map and join activities.
- A **custom agent (Phinite)** enhances every new event (weather, nearby venues, backup plan, category).
- A bottom tab bar has Map, Friends (hardcoded list), and Activity Chats (fake group chat UI per activity).
- The UI is map-first, minimal, and demo-ready.

This is a hackathon MVP. Focus on clarity and a strong AI demo.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Mapbox GL JS + react-map-gl
- **Phinite** — custom agent for AI enhancement (weather, nearby venues, backup plan, category)
- In-memory store (no DB)

---

## Environment

Copy `.env.example` to `.env.local` and fill in your values. Placeholders:

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — Mapbox (mapbox.com). **Must be NEXT_PUBLIC_** so the client can load the map.
- `PHINITE_API_KEY` — API key for your Phinite custom agent.
- `PHINITE_AGENT_URL` — Base URL or endpoint for the Phinite agent (e.g. `https://api.phinite.ai/v1/agents/...` or your deployed agent URL).

If the Phinite agent call fails, use hardcoded fallback values; no retries or complex error UI.

---

## Layout & Navigation

- **Top bar:** Centered “Actually Hang”, white/translucent, full width.
- **Content area:** Switches by tab (Map | Community | Activity Chats). Use state e.g. `activeTab: "map" | "friends" | "chats"` (tab id can stay `"friends"`; display label “Community”).
- **Bottom tab bar:** Always visible. Three tabs:
  - **Map** — icon + label “Map”
  - **Community** — icon + label “Community” (id: `friends`)
  - **Activity Chats** — icon + label “Activity Chats”
- Active tab uses accent color (blue); inactive tabs are gray. One accent color for the whole app (e.g. blue).

---

## Event Data Model & Store

**File:** `lib/store.ts`

**Type:**

```ts
type Event = {
  id: string;
  title: string;
  description: string;
  datetime: string;
  latitude: number;
  longitude: number;
  participants: string[];
  category?: string;   // e.g. "Coffee", "Outdoors", "Rooftop" — AI-generated on create, hardcoded for seed
  aiEnhanced?: {
    weather?: string;
    nearbySuggestion?: string;
    backupPlan?: string;
  };
};
```

**Store:** In-memory array. Export: `getEvents()`, `getEventById(id)`, `addEvent(event)`, `joinEvent(eventId, name)`, `updateEventAiEnhanced(eventId, aiEnhanced)`, `updateEventCategory(eventId, category)`.

**addEvent:**
- Accepts `Omit<Event, "id" | "participants">`.
- Generate unique ID: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` (avoids duplicate React keys if called twice in same tick).
- Push new event with `participants: []` and return it.

**Seed data:** Exactly 3 events. **All three** must have:
- `aiEnhanced` with `weather`, `nearbySuggestion`, `backupPlan` (pre-filled for demo).

Example seed: Coffee at Devoción (Williamsburg), Rooftop Sunset (Brooklyn), Central Park Walk. Use real-looking NYC coordinates and dates.

---

## Map Tab

- **Map:** Full-screen, Mapbox dark style (`mapbox://styles/mapbox/dark-v11`), centered on NYC (e.g. longitude -73.9857, latitude 40.7484, zoom 11). Load with `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- **Pins:** One marker per event. Each pin shows **participant count** (`event.participants.length`). Use a circular button with accent color; selected pin can be slightly larger/darker.
- **Clicking a pin:** Opens event detail (bottom sheet or modal). **Important:** In react-map-gl, map `onClick` also fires when clicking a marker. To avoid closing the detail immediately, in the map’s click handler check if the click target is inside an element with `data-marker`; if so, return without clearing selection. Put `data-marker` on the marker button.
- **Clicking the map (no marker):** If in “create” mode, set the chosen location. If not, clear selected event.

**Create flow (order matters):**
1. User taps the **floating “+”** button (bottom right).
2. **Do not open a modal yet.** Show a **small tooltip above the +** with: “Click on the map to choose the location” and a small ✕ to cancel. Tapping + again (or ✕) cancels and closes the tooltip.
3. User **clicks on the map** → set `pendingLocation` to that lng/lat and show a **preview marker** (e.g. small pulsing dot) at that spot.
4. **Now** open the **Create Activity modal** with: title (input), description (textarea), date/time (datetime-local), and a line showing “Location set” + coords + “Change” (Change clears location and closes modal so user can pick again). Save and Cancel buttons.
5. On Save: call `addEvent`, then **immediately** call `joinEvent(created.id, "Dylan C")` so the creator is a participant. Update UI state from the store with `setEvents([...getEvents()])` (not `[...prev, created]`) to avoid duplicate keys. Close modal, open the new event’s detail, and call the enhance API in the background (see AI section).
6. **No authentication.** Demo user is always **“Dylan C”**.

---

## Event Detail (Map Tab)

When a pin is selected, show a bottom sheet / modal with:
- **Category pill** at the top (if `event.category`): small rounded pill with the category label (e.g. Coffee, Outdoors). Use a neutral style (e.g. gray background). Do **not** show an “AI suggestions” pill.
- Title, date/time (formatted), description.
- **AI suggestions** block (only if `event.aiEnhanced` exists or `isEnhancing` is true): heading “AI suggestions”, then weather, nearby suggestion, backup plan. If `isEnhancing` is true, show “AI is planning your meetup…” instead of the list. Use a subtle blue-tinted background. At the **bottom** of this block, add small text: **“Powered by Phinite”** (with a light divider above it).
- **Participants:** List names; if the participant is “Dylan C”, show “Dylan C (you)” and style it (e.g. accent color). **Do not** add a separate “Dylan C (you)” line. For each participant, when they exist in the shared scores map, show **two scores** on the same row (ShowUp % and Vibe /5) using the **same two color styles** as in the Community tab (e.g. emerald and amber); no labels needed in the list—the colors convey meaning. Use the same `PARTICIPANT_SCORES` (or equivalent) map as the Community tab.
- **Join** button: only if current user (“Dylan C”) is not already in `participants`. On click, call `joinEvent(eventId, "Dylan C")` and update state.
- No “Enhance with AI” button. AI runs automatically on create (see below).

---

## AI Enhancement (Phinite custom agent)

- **When:** Automatically when a **new event is created**. After saving the event and adding the creator as participant, call the enhance API in the background. Show “AI is planning your meetup…” in the event detail until the response is back.
- **No manual “Enhance with AI” button.** Enhancement is done by a **custom agent built with Phinite**, which returns weather, nearby suggestion, backup plan, and category.

**Endpoint:** `POST /api/enhance`
- Body: `{ "event": { ...full event object } }`.
- If event id missing, return 400.

**Logic:**
1. **Call your Phinite custom agent** using `PHINITE_API_KEY` and `PHINITE_AGENT_URL`. Send the event (title, description, datetime, latitude, longitude) in the format your agent expects (e.g. JSON body or agent-specific schema).
2. The agent should return (or you parse from its response) a JSON object with: `weather`, `nearbySuggestion`, `backupPlan`, **`category`**. Each value a string; **category** is a single word or short phrase (e.g. Coffee, Outdoors, Rooftop).
3. Parse and validate; if any value is missing or not a string, use fallbacks. Category fallback e.g. `"Hangout"`.
4. **Fallbacks** (if the agent call fails or keys are missing): e.g. “Check a weather app for the day.”, “Search for venues near the pin.”, “Pick another spot or reschedule.”; category fallback `"Hangout"`.
5. Update the event in the store with `updateEventAiEnhanced(eventId, aiEnhanced)` and `updateEventCategory(eventId, category)` when the event exists. Return `{ event: updatedEvent }` (or `{ event: { ...event, aiEnhanced, category } }` if event was client-only). Frontend merges the returned `aiEnhanced` and `category` into state so the detail view re-renders with the AI block and category pill.

---

## Community Tab

- **UI only.** No real friend graph or auth. Tab label: **“Community”**; view heading: “Community”.
- Single view: a **hardcoded list** of people. Each card: avatar (e.g. initials in a circle), name, status line (e.g. “Joined Coffee at Devoción”, “Free this weekend”). Below that: **interest pills** (e.g. Coffee, Outdoors, Bars, Rooftops) — small rounded gray tags. At the bottom of each card, two scores with **two distinct color styles** (e.g. emerald for one, amber for the other):
  - **ShowUp** — reliability as a percentage (e.g. 98%, 92%).
  - **Vibe** — community rating from others, e.g. 4.8/5.
- Use 5–6 names; a few can match the seeded event participants (Alex K, Morgan L, Sam R, Jordan L) plus 1–2 others. Styling: cards on light gray background, accent for avatar. Keep scores in a **shared map** (e.g. `lib/communityScores.ts`: name → `{ showUp, vibe }`) so the event detail can show the same scores in the participants list.

---

## Activity Chats Tab

- **UI only.** No real messaging or persistence.
- **Filter:** Only show events where the **current user (“Dylan C”) is in `participants`**. Use `events.filter(e => e.participants.includes("Dylan C"))`. So the user only sees chats for activities they’ve joined.
- **List view:** One row per **filtered** event. Subtitle/copy: “Chats for activities you’ve joined. Tap to open.” Show event title, formatted date, participant count. Tapping a row opens that activity’s “chat.” When there are **no** events (user hasn’t joined any), show: “Join an activity from the Map to see its chat here.”
- **Chat view:** Fake group chat for that activity. Header with “← Back”, event title, participant count. Body: a few **hardcoded placeholder messages** per activity (e.g. for evt-1: “Alex K: I’ll be there around 10:15”, “Dylan C: Sounds good…”). Messages from “Dylan C” aligned right with accent bubble; others left with white/gray bubble. Bottom: a disabled or non-functional input (e.g. “Message (demo only)”). For events not in the fake list, show one line: “No messages yet. Say hi when you’re there!”
- Back returns to the list.

---

## UI Design Rules

- Minimalist. White/light overlays on dark map. One accent color (blue). Rounded corners, soft shadows, clean typography.
- Do **not** add: real authentication, real chat backend, real friends API, filters, or persistence (DB).

---

## Implementation Gotchas

1. **Duplicate key when creating event:** After `addEvent()`, the client’s `events` state may still reference the same array as the store. Use `setEvents([...getEvents()])` after create so the list has one copy of each event and no duplicate keys.
2. **Pin click closing immediately:** Map and marker both receive the click. In the map’s `onClick`, if `evt.originalEvent?.target` is inside a `[data-marker]` element, return without calling `onSelectEvent(null)`.
3. **Unique event IDs:** Use the random suffix in `addEvent` so double-invocation (e.g. Strict Mode) doesn’t create two events with the same id.

---

## Folder Structure

```
/app
  layout.tsx
  page.tsx              # Tabs, map/friends/chats content, create + event modals
  globals.css
  /api
    enhance/route.ts    # POST: call Phinite custom agent → aiEnhanced + category
    events/route.ts     # GET events (optional)
/components
  MapView.tsx           # Map, pins (participant count), preview marker, data-marker
  CreateEventModal.tsx  # Form only; shown after location set (guard: if !pendingLocation return null)
  EventModal.tsx        # Detail, category pill, AI suggestions + "Powered by Phinite", participants with (you) + ShowUp/Vibe scores (two colors), join
  TabBar.tsx            # Bottom nav: Map | Community | Activity Chats
  FriendsView.tsx       # Community list: avatar, name, status, interest pills, ShowUp % + Vibe /5 (two color styles)
  ActivityChatsView.tsx # Events filtered by current user in participants; list + fake chat thread; empty state when none joined
/lib
  store.ts              # Event type (with category), in-memory array, updateEventCategory; seed 3 events (aiEnhanced + category, no Dylan C in participants)
  communityScores.ts    # PARTICIPANT_SCORES: name → { showUp, vibe } for Community + event participants list
.env.example            # NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN, PHINITE_API_KEY, PHINITE_AGENT_URL (copy to .env.local)
```

---

## Priority Order

1. Next.js + Tailwind + Mapbox setup; `lib/store.ts` with Event type (including `category`) and 3 seeded events (all with `aiEnhanced` and hardcoded `category`; **do not** put Dylan C in participants — user joins during demo).
2. Map tab: map renders, pins from store, pin shows `participants.length`.
3. Tab bar; Community and Activity Chats as static/fake UI (Community: interest pills, ShowUp % + Vibe /5 with two colors; `lib/communityScores.ts` for scores; Activity Chats filtered by `participants.includes("Dylan C")`, empty state when none).
4. Create flow: + → tooltip → map click → modal (title, description, datetime) → Save; creator added as participant; `setEvents([...getEvents()])`.
5. Event detail: open on pin click (with data-marker fix), **category pill** at top, Join, AI suggestions block with “Powered by Phinite” at bottom; **participants list** with ShowUp/Vibe scores (two colors) from `PARTICIPANT_SCORES` when available.
6. `/api/enhance`: Call **Phinite custom agent** with event; parse response for `weather`, `nearbySuggestion`, `backupPlan`, **`category`**; fallbacks; call on create; merge `aiEnhanced` and `category` into state; `updateEventCategory` in store.
7. Polish: loading “AI is planning…”, Activity Chats filter and empty state, fake messages.

Following this document should allow rebuilding the full app from scratch during the hackathon.
