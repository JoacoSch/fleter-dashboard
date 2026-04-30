import { AuthProvider } from "@/hooks/useAuth";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="auth-layout">{children}</div>
    </AuthProvider>
  );
}
