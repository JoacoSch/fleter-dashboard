"use client";

import { getAuthToken } from "./firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

const MOCK_FIXTURES: Record<string, unknown> = {
  "/api/viajes/disponibles": [
    {
      id_viaje: 42,
      zona: "CABA",
      precio_estimado: 2500,
      fecha_programada: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      estado: "BUSCANDO_CONDUCTOR",
      paradas: [
        { orden: 1, direccion: "Plaza de Mayo, CABA", latitud: -34.6037, longitud: -58.3816 },
        { orden: 2, direccion: "Recoleta, CABA", latitud: -34.5895, longitud: -58.3974 },
      ],
      condiciones_req: [],
      cliente: { usuario: { nombre: "Juan", apellido: "Pérez", telefono: "+5491112345678" } },
    },
    {
      id_viaje: 43,
      zona: "PROVINCIA",
      precio_estimado: 8500,
      fecha_programada: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      estado: "BUSCANDO_CONDUCTOR",
      paradas: [
        { orden: 1, direccion: "Microcentro, CABA", latitud: -34.6, longitud: -58.37 },
        { orden: 2, direccion: "La Plata, Buenos Aires", latitud: -34.92, longitud: -57.95 },
      ],
      condiciones_req: [{ condicion: "FRAGIL" }],
      cliente: { usuario: { nombre: "María", apellido: "García", telefono: "+5491187654321" } },
    },
  ],
  "/api/viajes": {
    id_viaje: 99,
    id_cliente: 1,
    id_conductor: null,
    id_vehiculo: null,
    estado: "BUSCANDO_CONDUCTOR",
    precio_estimado: 8500,
    zona: "CABA",
    paradas: [],
    condiciones_req: [],
    creado_en: new Date().toISOString(),
  },
  "/api/auth/me": {
    id: "mock-1",
    nombre: "Joaquín",
    apellido: "Test",
    email: "joaco@fleter.com",
    empresa: "PyME Demo S.A.",
    cuit: "20-12345678-9",
    rol: "CLIENTE",
  },
};

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (MOCK && MOCK_FIXTURES[path] !== undefined) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_FIXTURES[path] as T;
  }

  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
