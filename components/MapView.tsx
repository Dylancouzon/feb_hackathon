"use client";

import { useCallback, useRef } from "react";
import Map, { Marker, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Event } from "@/lib/store";

const NYC_CENTER = { longitude: -73.9857, latitude: 40.7484 };
const MAPBOX_DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

type MapViewProps = {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  previewLocation?: { lng: number; lat: number } | null;
};

export default function MapView({
  events,
  selectedEventId,
  onSelectEvent,
  onMapClick,
  previewLocation,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  const handleMapClick = useCallback(
    (evt: { lngLat: { lng: number; lat: number }; originalEvent?: MouseEvent }) => {
      // Don't clear selection when clicking a marker (map and marker both receive the click)
      const target = evt.originalEvent?.target as HTMLElement | undefined;
      if (target?.closest?.("[data-marker]")) return;
      if (onMapClick) {
        onMapClick(evt.lngLat);
      } else {
        onSelectEvent(null);
      }
    },
    [onMapClick, onSelectEvent]
  );

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          ...NYC_CENTER,
          zoom: 11,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAPBOX_DARK_STYLE}
        onClick={handleMapClick}
        cursor={onMapClick ? "crosshair" : "default"}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            longitude={event.longitude}
            latitude={event.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent?.stopPropagation();
              onSelectEvent(event.id);
            }}
          >
            <button
              type="button"
              data-marker
              className={`
                w-10 h-10 rounded-full border-2 border-white shadow-lg
                flex items-center justify-center text-white font-bold text-sm
                transition transform
                ${selectedEventId === event.id ? "bg-accent-hover scale-110" : "bg-accent"}
              `}
              aria-label={`${event.title} — ${event.participants.length} participants`}
            >
              {event.participants.length}
            </button>
          </Marker>
        ))}
        {previewLocation && (
          <Marker
            longitude={previewLocation.lng}
            latitude={previewLocation.lat}
            anchor="bottom"
          >
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-lg animate-pulse" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
