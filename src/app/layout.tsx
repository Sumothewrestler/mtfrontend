import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'  // 👈 Add this

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Metro Transports",
  description: "Metro Transports Management System",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo.png', sizes: '152x152', type: 'image/png' },
      { url: '/logo.png', sizes: '144x144', type: 'image/png' },
      { url: '/logo.png', sizes: '120x120', type: 'image/png' },
      { url: '/logo.png', sizes: '114x114', type: 'image/png' },
      { url: '/logo.png', sizes: '76x76', type: 'image/png' },
      { url: '/logo.png', sizes: '72x72', type: 'image/png' },
      { url: '/logo.png', sizes: '60x60', type: 'image/png' },
      { url: '/logo.png', sizes: '57x57', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo.png',
      },
      {
        rel: 'mask-icon',
        url: '/logo.png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Metro Transports',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkModeProvider>
          <ServiceWorkerRegister /> {/* ✅ Register SW */}
          {children}
          <BottomNav />
        </DarkModeProvider>
      </body>
    </html>
  );
}
