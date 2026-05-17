"use client";

import { useEffect, useId, useRef, useState } from "react";

export type LatLng = { lat: number; lng: number };
export type MapMarker = {
  id: string;
  position: LatLng;
  title?: string;
  href?: string;
};

// Cayman Islands fallback view.
const CAYMAN_CENTER: LatLng = { lat: 19.3133, lng: -81.2546 };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: { maps: GoogleMaps };
    __cireme_gmaps?: Promise<GoogleMaps>;
  }
}
type GoogleMaps = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
  Marker: new (opts: Record<string, unknown>) => GMarker;
  LatLng: new (lat: number, lng: number) => unknown;
  event: { addListener: (t: unknown, e: string, h: (a?: unknown) => void) => void };
};
type GMap = {
  setCenter: (p: LatLng) => void;
  setZoom: (z: number) => void;
  fitBounds: (b: unknown) => void;
};
type GMarker = {
  getPosition: () => { lat: () => number; lng: () => number };
  setPosition: (p: LatLng) => void;
  addListener: (e: string, h: (a?: unknown) => void) => void;
};

function loadGoogleMaps(): Promise<GoogleMaps> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__cireme_gmaps) return window.__cireme_gmaps;
  window.__cireme_gmaps = new Promise<GoogleMaps>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      API_KEY ?? "",
    )}&loading=async`;
    s.async = true;
    s.onload = () =>
      window.google?.maps
        ? resolve(window.google.maps)
        : reject(new Error("Google Maps failed to initialize"));
    s.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(s);
  });
  return window.__cireme_gmaps;
}

export default function PropertyMap({
  markers = [],
  editable = false,
  initial = null,
  defaultCenter = CAYMAN_CENTER,
  height = 360,
  showMyLocation = true,
}: {
  markers?: MapMarker[];
  editable?: boolean;
  initial?: LatLng | null;
  defaultCenter?: LatLng;
  height?: number;
  showMyLocation?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const pinRef = useRef<GMarker | null>(null);
  const [pin, setPin] = useState<LatLng | null>(initial);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const latId = useId();
  const lngId = useId();

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const here = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (editable) setPin(here);
        const m = mapRef.current;
        if (m) {
          m.setCenter(here);
          m.setZoom(14);
        }
        if (editable && pinRef.current) pinRef.current.setPosition(here);
      },
      undefined,
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  useEffect(() => {
    if (!API_KEY) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const center = pin ?? markers[0]?.position ?? defaultCenter;
        const map = new maps.Map(containerRef.current, {
          center,
          zoom: pin || markers.length ? 13 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;

        if (editable) {
          const marker = new maps.Marker({
            map,
            position: pin ?? center,
            draggable: true,
          });
          pinRef.current = marker;
          marker.addListener("dragend", () => {
            const p = marker.getPosition();
            setPin({ lat: p.lat(), lng: p.lng() });
          });
          maps.event.addListener(map, "click", (e?: unknown) => {
            const ev = e as { latLng?: { lat(): number; lng(): number } };
            if (!ev?.latLng) return;
            const np = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
            marker.setPosition(np);
            setPin(np);
          });
        } else {
          for (const mk of markers) {
            const marker = new maps.Marker({
              map,
              position: mk.position,
              title: mk.title,
            });
            if (mk.href) {
              marker.addListener("click", () => {
                window.location.href = mk.href as string;
              });
            }
          }
        }
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
    // Map is built once; pin is synced via refs, markers are static per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyless / load-failure fallback. The feature still works for the picker
  // via manual coordinate entry; display mode degrades to a notice.
  if (status === "error") {
    return (
      <div className="card" style={{ padding: "1rem" }}>
        <p className="muted" style={{ marginTop: 0 }}>
          {API_KEY
            ? "The map could not be loaded right now."
            : "Interactive map unavailable — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."}
        </p>
        {editable ? (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <label>
              <span style={{ display: "block", fontSize: "0.85rem" }}>
                Latitude
              </span>
              <input
                name="latitude"
                inputMode="decimal"
                defaultValue={pin?.lat ?? ""}
                placeholder="19.2866"
              />
            </label>
            <label>
              <span style={{ display: "block", fontSize: "0.85rem" }}>
                Longitude
              </span>
              <input
                name="longitude"
                inputMode="decimal"
                defaultValue={pin?.lng ?? ""}
                placeholder="-81.3744"
              />
            </label>
            {showMyLocation ? (
              <button
                type="button"
                className="btn-outline"
                onClick={useMyLocation}
                style={{ alignSelf: "flex-end" }}
              >
                Use my location
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        role="application"
        aria-label="Property location map"
        style={{
          width: "100%",
          height,
          borderRadius: "var(--r-md)",
          background: "var(--n-100)",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          marginTop: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {showMyLocation ? (
          <button
            type="button"
            className="btn-outline"
            onClick={useMyLocation}
            disabled={status !== "ready"}
          >
            Use my location
          </button>
        ) : null}
        {editable ? (
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {pin
              ? `Pinned: ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)} — drag the marker or click the map to adjust.`
              : "Click the map or drag the marker to set the exact location."}
          </span>
        ) : null}
      </div>
      {editable ? (
        <>
          <input
            type="hidden"
            id={latId}
            name="latitude"
            value={pin?.lat ?? ""}
            readOnly
          />
          <input
            type="hidden"
            id={lngId}
            name="longitude"
            value={pin?.lng ?? ""}
            readOnly
          />
        </>
      ) : null}
    </div>
  );
}
