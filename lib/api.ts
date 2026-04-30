"use client";

import { getAuthToken } from "./firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

const MOCK_FIXTURES: Record<string, unknown> = {
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
