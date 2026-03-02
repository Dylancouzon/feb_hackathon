import { NextRequest, NextResponse } from "next/server";
import { updateEventAiEnhanced, updateEventCategory } from "@/lib/store";
import type { Event } from "@/lib/store";

const FALLBACK_AI = {
  weather: "Check a weather app for the day — dress accordingly.",
  nearbySuggestion: "Search for venues near the pin location.",
  backupPlan: "If plans change, pick another spot nearby or reschedule.",
};

const FALLBACK_CATEGORY = "Hangout";

export async function POST(request: NextRequest) {
  let body: { event?: Event };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = body?.event;
  if (!event?.id) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  let weatherText = "";
  let venuesText = "";
  const tavilyKey = process.env.TAVILY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (tavilyKey) {
    try {
      const { tavily } = await import("@tavily/core");
      const client = tavily({ apiKey: tavilyKey });
      const eventDate = new Date(event.datetime).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const [weatherRes, venuesRes] = await Promise.all([
        client.search(`NYC New York weather forecast ${eventDate}`, {
          maxResults: 3,
          searchDepth: "basic",
        }),
        client.search(
          `things to do venues near ${event.latitude},${event.longitude} NYC`,
          { maxResults: 4, searchDepth: "basic" }
        ),
      ]);
      weatherText =
        weatherRes.results?.map((r: { content?: string }) => r.content).join("\n") ||
        weatherRes.answer ||
        "";
      venuesText =
        venuesRes.results?.map((r: { title?: string; content?: string }) => `${r.title}: ${r.content}`).join("\n") ||
        venuesRes.answer ||
        "";
    } catch {
      weatherText = "";
      venuesText = "";
    }
  }

  if (!weatherText) weatherText = "Weather for NYC on the event date.";
  if (!venuesText) venuesText = "Venues near the event location.";

  let aiEnhanced: Event["aiEnhanced"] = FALLBACK_AI;
  let category = FALLBACK_CATEGORY;

  if (openaiKey) {
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that enhances meetup plans for NYC.
Given raw search results (weather and nearby venues) and the event details, respond with a JSON object only (no markdown, no code block) with exactly these keys: weather, nearbySuggestion, backupPlan, category.
- weather: 1–2 sentence summary for the event date in NYC.
- nearbySuggestion: 1–2 sentences suggesting 2 nearby relevant venues.
- backupPlan: 1 sentence backup if the main plan falls through.
- category: a single word or very short phrase (e.g. Coffee, Outdoors, Rooftop, Nightlife, Brunch) that best describes the activity type.
Keep each value concise. Do not add or rewrite the event description.`,
          },
          {
            role: "user",
            content: `Event: ${event.title}. ${event.description || ""}. Date: ${event.datetime}. Location: ${event.latitude}, ${event.longitude}.\n\nWeather search:\n${weatherText}\n\nVenues search:\n${venuesText}`,
          },
        ],
        response_format: { type: "json_object" },
      });
      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw) as Event["aiEnhanced"] & { category?: string };
        if (parsed && typeof parsed === "object") {
          aiEnhanced = {
            weather: typeof parsed.weather === "string" ? parsed.weather : FALLBACK_AI.weather,
            nearbySuggestion: typeof parsed.nearbySuggestion === "string" ? parsed.nearbySuggestion : FALLBACK_AI.nearbySuggestion,
            backupPlan: typeof parsed.backupPlan === "string" ? parsed.backupPlan : FALLBACK_AI.backupPlan,
          };
          if (typeof parsed.category === "string" && parsed.category.trim()) {
            category = parsed.category.trim();
          }
        }
      }
    } catch {
      aiEnhanced = FALLBACK_AI;
    }
  }

  const updated = updateEventAiEnhanced(event.id, aiEnhanced);
  if (updated) updateEventCategory(event.id, category);
  const eventToReturn = updated ?? { ...event, aiEnhanced, category };
  return NextResponse.json({ event: eventToReturn });
}
