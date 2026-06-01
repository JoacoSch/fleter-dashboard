import type { Metadata } from "next";
import {
  Archivo_Black,
  Manrope,
  Josefin_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { APIProvider } from "@vis.gl/react-google-maps";

const archivoblack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Fleter Dashboard",
  description: "Panel de gestión de fletes",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${archivoblack.variable} ${manrope.variable} ${josefinSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
          <AuthProvider>{children}</AuthProvider>
        </APIProvider>
      </body>
    </html>
  );
}
