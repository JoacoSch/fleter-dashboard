"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  empresa?: string;
  cuit?: string;
  rol: "CLIENTE" | "GERENTE";
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  cuit: string;
  password: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: "CLIENTE" | "GERENTE" | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  sendRecovery: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_PROFILE: UserProfile = {
  id: "mock-1",
  nombre: "Joaquín",
  apellido: "Test",
  email: "joaco@fleter.com",
  empresa: "PyME Demo S.A.",
  cuit: "20-12345678-9",
  rol: "CLIENTE",
};

async function setCookieToken(token: string) {
  await fetch("/api/auth/cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

async function clearCookieToken() {
  await fetch("/api/auth/cookie", { method: "DELETE" });
}

async function fetchProfile(): Promise<UserProfile> {
  return api.get<UserProfile>("/api/auth/me");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    if (MOCK) {
      const hasCookie = document.cookie.includes("token=mock");
      setState({
        user: null,
        profile: hasCookie ? MOCK_PROFILE : null,
        role: hasCookie ? "CLIENTE" : null,
        loading: false,
      });
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, profile: null, role: null, loading: false });
        return;
      }
      try {
        const profile = await fetchProfile();
        setState({ user, profile, role: profile.rol, loading: false });
      } catch {
        setState({ user, profile: null, role: null, loading: false });
      }
    });

    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (MOCK) {
      document.cookie = "token=mock; path=/; max-age=3600";
      setState({ user: null, profile: MOCK_PROFILE, role: "CLIENTE", loading: false });
      return;
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    await api.post("/api/auth/login", { idToken: token });
    await setCookieToken(token);
    const profile = await fetchProfile();
    setState({ user: cred.user, profile, role: profile.rol, loading: false });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (MOCK) {
      document.cookie = "token=mock; path=/; max-age=3600";
      setState({ user: null, profile: MOCK_PROFILE, role: "CLIENTE", loading: false });
      return;
    }
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const token = await cred.user.getIdToken();
    await api.post("/api/auth/login", { idToken: token });
    await setCookieToken(token);
    const profile = await fetchProfile();
    setState({ user: cred.user, profile, role: profile.rol, loading: false });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (MOCK) {
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const token = await cred.user.getIdToken();
    await api.post("/api/auth/registro-cliente", {
      idToken: token,
      nombre: data.nombre,
      apellido: data.apellido,
      empresa: data.empresa,
      cuit: data.cuit,
    });
  }, []);

  const logout = useCallback(async () => {
    if (MOCK) {
      document.cookie = "token=; path=/; max-age=0";
      setState({ user: null, profile: null, role: null, loading: false });
      return;
    }
    await signOut(auth);
    await clearCookieToken();
    setState({ user: null, profile: null, role: null, loading: false });
  }, []);

  const sendRecovery = useCallback(async (email: string) => {
    if (MOCK) return;
    await sendPasswordResetEmail(auth, email);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, sendRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
