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
      estado: "EN_RUTA",
      fecha_programada: "2026-05-14T11:00:00.000Z",
      creado_en: "2026-05-14T10:30:00.000Z",
      duracion_real: null,
      alertas_count: 0,
      paradas: [
        { orden: 1, direccion: "Once, CABA" },
        { orden: 2, direccion: "Quilmes, Buenos Aires" },
      ],
      conductor: { usuario: { nombre: "Carlos", apellido: "López" } },
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
  "/api/conductores/mis-vehiculos": [
    {
      id_vehiculo: 1,
      id_empresa: null,
      id_conductor: 1,
      patente: "ABC123",
      marca: "Ford",
      modelo: "Transit",
      anio: 2021,
      color: "Blanco",
      tipo_vehiculo: "furgon",
      condiciones: [
        { id_condicion: 1, id_vehiculo: 1, condicion: "FRAGIL" },
      ],
    },
    {
      id_vehiculo: 2,
      id_empresa: null,
      id_conductor: 1,
      patente: "XY567AB",
      marca: "Mercedes-Benz",
      modelo: "Sprinter",
      anio: 2019,
      color: "Gris",
      tipo_vehiculo: "camion",
      condiciones: [],
    },
  ],
  "/api/viajes/mis-viajes-conductor": [
    {
      id_viaje: 201,
      estado: "ENTREGADO",
      paradas: [
        { orden: 1, direccion: "Av. Corrientes 1234, CABA" },
        { orden: 2, direccion: "Palermo Soho, CABA" },
      ],
      cliente: { usuario: { nombre: "Juan", apellido: "Pérez" } },
    },
    {
      id_viaje: 202,
      estado: "ENTREGADO",
      paradas: [
        { orden: 1, direccion: "Microcentro, CABA" },
        { orden: 2, direccion: "La Plata, Buenos Aires" },
      ],
      cliente: { usuario: { nombre: "María", apellido: "García" } },
    },
    {
      id_viaje: 203,
      estado: "EN_RUTA",
      paradas: [
        { orden: 1, direccion: "Retiro, CABA" },
        { orden: 2, direccion: "Tigre, Buenos Aires" },
      ],
      cliente: { usuario: { nombre: "Roberto", apellido: "Sanz" } },
    },
    {
      id_viaje: 204,
      estado: "ENTREGADO",
      paradas: [
        { orden: 1, direccion: "Once, CABA" },
        { orden: 2, direccion: "Morón, Buenos Aires" },
      ],
      cliente: { usuario: { nombre: "Laura", apellido: "Méndez" } },
    },
  ],
  "/api/viajes/103/detalle": {
    id_viaje: 103,
    zona: "MIXTO",
    precio_estimado: 6800,
    precio_real: null,
    descripcion: null,
    estado: "EN_RUTA",
    fecha_programada: "2026-05-14T11:00:00.000Z",
    creado_en: "2026-05-14T10:30:00.000Z",
    paradas: [
      {
        orden: 1,
        direccion: "Once, CABA",
        latitud: -34.6087,
        longitud: -58.4088,
        estado: "ENTREGADO",
        fecha_entrega: "2026-05-14T11:28:00.000Z",
      },
      {
        orden: 2,
        direccion: "Quilmes, Buenos Aires",
        latitud: -34.7206,
        longitud: -58.2535,
        estado: "PENDIENTE",
        fecha_entrega: null,
      },
    ],
    condiciones_req: [],
    ruta_planeada: [
      [-58.4088, -34.6087],
      [-58.4012, -34.6155],
      [-58.3705, -34.6298],
      [-58.3402, -34.6512],
      [-58.3001, -34.6789],
      [-58.2755, -34.7012],
      [-58.2535, -34.7206],
    ],
    cliente: {
      id_cliente: 1,
      usuario: { nombre: "Joaquín", apellido: "Test", email: "joaco@fleter.com" },
    },
    conductor: {
      id_conductor: 7,
      calificacion_promedio: 4.8,
      usuario: { nombre: "Carlos", apellido: "López", telefono: "+5491187654321" },
    },
    vehiculo: {
      patente: "ABC123",
      marca: "Ford",
      modelo: "Transit",
      tipo_vehiculo: "furgon",
      color: "Blanco",
    },
  },
  "/api/viajes/103/costo-acumulado": {
    precio_acumulado: 2100,
    desglose: {
      precio_por_tiempo: null,
      precio_por_distancia: 2100,
      tiempo_horas: 0.7,
      distancia_km: 21,
      tarifa_hora: null,
      tarifa_km: 100,
      es_hora_pico: false,
    },
  },
  "/api/auth/me": {
    id_usuario: 1,
    nombre: "Joaquín",
    apellido: "Test",
    email: "joaco@fleter.com",
    dni: "30123456",
    telefono: "+5491112345678",
    fecha_registro: "2026-01-15T00:00:00.000Z",
    rol: (process.env.NEXT_PUBLIC_MOCK_ROLE ?? "CLIENTE") as "CLIENTE" | "CONDUCTOR" | "GERENTE" | "ADMIN",
  },
};

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (MOCK) {
    const deleteVehiculo = path.match(/^\/api\/conductores\/mis-vehiculos\/(\d+)$/);
    if (deleteVehiculo && options.method === "DELETE") {
      await new Promise((r) => setTimeout(r, 300));
      return { mensaje: "Vehiculo eliminado" } as T;
    }

    const costoAcumulado = path.match(/^\/api\/viajes\/(\d+)\/costo-acumulado$/);
    if (costoAcumulado) {
      const id = parseInt(costoAcumulado[1], 10);
      const fixture = MOCK_FIXTURES[`/api/viajes/${id}/costo-acumulado`];
      await new Promise((r) => setTimeout(r, 300));
      if (fixture) return fixture as T;
      return { precio_acumulado: 0, desglose: null } as T;
    }

    const dynamicViaje = path.match(/^\/api\/viajes\/(\d+)$/);
    if (dynamicViaje) {
      const id = parseInt(dynamicViaje[1], 10);
      const detailed = MOCK_FIXTURES[`/api/viajes/${id}/detalle`];
      if (detailed) {
        await new Promise((r) => setTimeout(r, 300));
        return detailed as T;
      }
      const list = MOCK_FIXTURES["/api/viajes/mis-viajes"] as { id_viaje: number }[];
      const found = list?.find((v) => v.id_viaje === id);
      await new Promise((r) => setTimeout(r, 300));
      if (found) return found as T;
      throw new Error("Viaje no encontrado");
    }
    if (MOCK_FIXTURES[path] !== undefined) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_FIXTURES[path] as T;
    }
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
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};
