"use client";

import { useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import type { Parada, UbicacionUpdate } from "@/hooks/useViajeActivo";

function RoutePolyline({ paradas }: { paradas: Parada[] }) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polyRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    const path = [...paradas]
      .sort((a, b) => a.orden - b.orden)
      .filter((p) => p.latitud != null && p.longitud != null)
      .map((p) => ({ lat: p.latitud!, lng: p.longitud! }));

    if (path.length < 2) return;

    polyRef.current = new mapsLib.Polyline({
      path,
      strokeColor: "#E85D2A",
      strokeWeight: 3,
      strokeOpacity: 0.85,
      map,
    });

    return () => {
      polyRef.current?.setMap(null);
      polyRef.current = null;
    };
  }, [map, mapsLib, paradas]);

  return null;
}

function ParadaPin({ parada }: { parada: Parada }) {
  if (parada.latitud == null || parada.longitud == null) return null;
  const isDone = parada.estado === "ENTREGADO";
  return (
    <AdvancedMarker position={{ lat: parada.latitud, lng: parada.longitud }}>
      <div className={`mapa-pin mapa-pin--${isDone ? "done" : "pending"}`}>
        {isDone ? "✓" : parada.orden}
      </div>
    </AdvancedMarker>
  );
}

function ConductorPin({ pos }: { pos: UbicacionUpdate }) {
  return (
    <AdvancedMarker position={{ lat: pos.lat, lng: pos.lng }}>
      <div className="mapa-pin mapa-pin--conductor" />
    </AdvancedMarker>
  );
}

function MapContent({
  paradas,
  ultimaPos,
}: {
  paradas: Parada[];
  ultimaPos: UbicacionUpdate | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (ultimaPos && map) {
      map.panTo({ lat: ultimaPos.lat, lng: ultimaPos.lng });
    }
  }, [ultimaPos, map]);

  const paradasConCoords = paradas.filter((p) => p.latitud != null);

  return (
    <>
      <RoutePolyline paradas={paradas} />
      {paradasConCoords.map((p) => (
        <ParadaPin key={p.orden} parada={p} />
      ))}
      {ultimaPos && <ConductorPin pos={ultimaPos} />}
    </>
  );
}

export function MapaViajeActivo({
  paradas,
  ultimaPos,
}: {
  paradas: Parada[];
  ultimaPos: UbicacionUpdate | null;
}) {
  const paradasConCoords = paradas.filter((p) => p.latitud != null);
  const initialCenter =
    ultimaPos
      ? { lat: ultimaPos.lat, lng: ultimaPos.lng }
      : paradasConCoords.length > 0
      ? { lat: paradasConCoords[0].latitud!, lng: paradasConCoords[0].longitud! }
      : { lat: -34.6037, lng: -58.3816 };

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}
      version="beta"
    >
      <Map
        defaultCenter={initialCenter}
        defaultZoom={13}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID"}
        disableDefaultUI
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        <MapContent paradas={paradas} ultimaPos={ultimaPos} />
      </Map>
    </APIProvider>
  );
}
