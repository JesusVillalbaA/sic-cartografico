import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOGNE - Sistema de Orientacion de Geointeligencia de Nueva Esparta",
  description: "Sistema de georreferenciación y análisis táctico de incidentes e infraestructura de seguridad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head /> 
      <body className="antialiased">{children}</body>
    </html>
  );
}