import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zitapp - Agenda Digital para tu Negocio", //  
  description: "La agenda digital que tu Negocio necesita. Automatiza tus reservas, gestiona tus clientes y haz crecer tu negocio.", // ✅ Cambia esto
  icons: {
    icon: '/logo_Zitapp.png',  
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es"> {/* ✅ Cambia "en" a "es" */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}