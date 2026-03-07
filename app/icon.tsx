import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#d97aab',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {/* Sol — mitad izquierda, centrado en (7, 11) */}
          <circle cx="7" cy="11" r="3.2" fill="white" />
          {/* Rayos cardinales */}
          <line x1="7" y1="3.5" x2="7" y2="5.5"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="7" y1="16.5" x2="7" y2="18.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="0.5" y1="11"  x2="2.5" y2="11"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="11.5" y1="11" x2="13"  y2="11"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          {/* Rayos diagonales */}
          <line x1="2.5" y1="6"   x2="4"   y2="7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="2.5" y1="16"  x2="4"   y2="14.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />

          {/* Luna creciente — mitad derecha, centrada en (16, 11) */}
          {/* Path: arco exterior grande + arco interior que recorta */}
          <path
            d="M16 6.5 A4.5 4.5 0 1 1 16 15.5 A3.2 3.2 0 1 0 16 6.5 Z"
            fill="white"
            opacity="0.82"
            transform="translate(1.2, 0)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
