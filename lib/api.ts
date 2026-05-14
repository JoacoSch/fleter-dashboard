"use client";

import { getAuthToken } from "./firebase";
import { BASE_URL, MOCK } from "./config";

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
  "/api/viajes/mis-viajes": [
    {
      id_viaje: 101,
      zona: "CABA",
      precio_estimado: 3200,
      precio_real: 2900,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-10T09:00:00.000Z",
      creado_en: "2026-05-09T20:00:00.000Z",
      duracion_real: 95,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Av. Corrientes 1234, CABA" },
        { orden: 2, direccion: "Palermo Soho, CABA" },
      ],
      conductor: { usuario: { nombre: "Carlos", apellido: "López" } },
    },
    {
      id_viaje: 102,
      zona: "PROVINCIA",
      precio_estimado: 9500,
      precio_real: 11200,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-08T08:00:00.000Z",
      creado_en: "2026-05-07T18:00:00.000Z",
      duracion_real: 210,
      alertas_count: 2,
      paradas: [
        { orden: 1, direccion: "Microcentro, CABA" },
        { orden: 2, direccion: "La Plata, Buenos Aires" },
      ],
      conductor: { usuario: { nombre: "Roberto", apellido: "Sanz" } },
    },
    {
      id_viaje: 103,
      zona: "MIXTO",
      precio_estimado: 6800,
      precio_real: null,
      estado: "EN_CURSO",
      fecha_programada: "2026-05-14T11:00:00.000Z",
      creado_en: "2026-05-14T10:30:00.000Z",
      duracion_real: null,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Once, CABA" },
        { orden: 2, direccion: "Quilmes, Buenos Aires" },
      ],
      conductor: null,
    },
    {
      id_viaje: 104,
      zona: "CABA",
      precio_estimado: 2100,
      precio_real: null,
      estado: "CANCELADO",
      fecha_programada: "2026-05-05T14:00:00.000Z",
      creado_en: "2026-05-05T12:00:00.000Z",
      duracion_real: null,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Retiro, CABA" },
        { orden: 2, direccion: "Belgrano, CABA" },
      ],
      conductor: null,
    },
    {
      id_viaje: 105,
      zona: "CABA",
      precio_estimado: 4400,
      precio_real: 4400,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-02T07:00:00.000Z",
      creado_en: "2026-05-01T22:00:00.000Z",
      duracion_real: 60,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Puerto Madero, CABA" },
        { orden: 2, direccion: "San Telmo, CABA" },
      ],
      conductor: { usuario: { nombre: "Miguel", apellido: "Torres" } },
    },
    {
      id_viaje: 106,
      zona: "PROVINCIA",
      precio_estimado: 7200,
      precio_real: 6800,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-03T10:00:00.000Z",
      creado_en: "2026-05-02T22:00:00.000Z",
      duracion_real: 180,
      alertas_count: 1,
      paradas: [
        { orden: 1, direccion: "Villa Urquiza, CABA" },
        { orden: 2, direccion: "Tigre, Buenos Aires" },
      ],
      conductor: { usuario: { nombre: "Diego", apellido: "Méndez" } },
    },
    {
      id_viaje: 107,
      zona: "CABA",
      precio_estimado: 1800,
      precio_real: null,
      estado: "BUSCANDO_CONDUCTOR",
      fecha_programada: "2026-05-15T15:00:00.000Z",
      creado_en: "2026-05-14T12:00:00.000Z",
      duracion_real: null,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Flores, CABA" },
        { orden: 2, direccion: "Caballito, CABA" },
      ],
      conductor: null,
    },
    {
      id_viaje: 108,
      zona: "MIXTO",
      precio_estimado: 12000,
      precio_real: 13500,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-06T06:00:00.000Z",
      creado_en: "2026-05-05T20:00:00.000Z",
      duracion_real: 300,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Constitución, CABA" },
        { orden: 2, direccion: "Mar del Plata, Buenos Aires" },
      ],
      conductor: { usuario: { nombre: "Hernán", apellido: "Castro" } },
    },
    {
      id_viaje: 109,
      zona: "CABA",
      precio_estimado: 2700,
      precio_real: 2700,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-07T13:00:00.000Z",
      creado_en: "2026-05-07T11:00:00.000Z",
      duracion_real: 45,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Núñez, CABA" },
        { orden: 2, direccion: "Saavedra, CABA" },
      ],
      conductor: { usuario: { nombre: "Lucas", apellido: "Ferrari" } },
    },
    {
      id_viaje: 110,
      zona: "PROVINCIA",
      precio_estimado: 5500,
      precio_real: 5100,
      estado: "ENTREGADO",
      fecha_programada: "2026-05-09T08:00:00.000Z",
      creado_en: "2026-05-08T18:00:00.000Z",
      duracion_real: 120,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Almagro, CABA" },
        { orden: 2, direccion: "Morón, Buenos Aires" },
      ],
      conductor: { usuario: { nombre: "Pablo", apellido: "Ríos" } },
    },
    {
      id_viaje: 90,
      zona: "CABA",
      precio_estimado: 3100,
      precio_real: 3400,
      estado: "ENTREGADO",
      fecha_programada: "2026-04-15T10:00:00.000Z",
      creado_en: "2026-04-14T20:00:00.000Z",
      duracion_real: 75,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Recoleta, CABA" },
        { orden: 2, direccion: "Villa Crespo, CABA" },
      ],
      conductor: { usuario: { nombre: "Sebastián", apellido: "Ortiz" } },
    },
  ],
  "/api/auth/me": {
    id: "mock-1",
    nombre: "Joaquín",
    apellido: "Test",
    email: "joaco@fleter.com",
    empresa: "PyME Demo S.A.",
    cuit: "20-12345678-9",
    rol: (process.env.NEXT_PUBLIC_MOCK_ROLE ?? "CLIENTE") as "CLIENTE" | "CONDUCTOR" | "GERENTE" | "ADMIN",
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
