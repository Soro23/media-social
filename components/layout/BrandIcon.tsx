interface BrandIconProps {
  size?: number;
}

export function BrandIcon({ size = 22 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden>
      {/* Sol — mitad izquierda */}
      <circle cx="7" cy="11" r="3.2" fill="white" />
      <line x1="7" y1="3.5"  x2="7" y2="5.5"   stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="16.5" x2="7" y2="18.5"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="0.5" y1="11" x2="2.5" y2="11"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11.5" y1="11" x2="13" y2="11"  stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="2.5" y1="6"   x2="4"  y2="7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="2.5" y1="16"  x2="4"  y2="14.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      {/* Luna creciente — mitad derecha */}
      <path
        d="M17.2 6.5 A4.5 4.5 0 1 1 17.2 15.5 A3.2 3.2 0 1 0 17.2 6.5 Z"
        fill="white"
        opacity="0.82"
      />
    </svg>
  );
}
