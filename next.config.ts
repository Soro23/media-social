import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Imágenes: dominios permitidos para next/image
  images: {
    remotePatterns: [
      // Jikan/MyAnimeList (varios subdominios posibles)
      { protocol: 'https', hostname: '*.myanimelist.net' },
      { protocol: 'https', hostname: 'myanimelist.net' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      // TMDB
      { protocol: 'https', hostname: 'image.tmdb.org' },
      // Open Library
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      // Google avatars (social login)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necesario para Next.js dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.myanimelist.net https://image.tmdb.org https://covers.openlibrary.org https://lh3.googleusercontent.com",
              "font-src 'self'",
              "connect-src 'self' https://cloud.appwrite.io https://api.jikan.moe https://api.themoviedb.org https://openlibrary.org https://accounts.google.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
