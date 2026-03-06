import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'MediaSocial — Anime, Manga, Libros, Películas y Series',
    template: '%s | MediaSocial',
  },
  description:
    'Explora y opina sobre anime, manga, libros, películas y series. Guarda tus favoritos y comparte tus opiniones.',
  keywords: ['anime', 'manga', 'libros', 'películas', 'series', 'red social'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'MediaSocial',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
