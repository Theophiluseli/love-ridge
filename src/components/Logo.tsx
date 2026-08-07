'use client';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export default function Logo({ className = "h-10", variant = 'dark' }: LogoProps) {
  const isLight = variant === 'light';
  const greenColor = isLight ? '#FFFFFF' : '#0A5C28';
  const subTextColor = isLight ? '#A7F3D0' : '#0A5C28';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon matching Loveridge House Logo */}
      <svg
        viewBox="0 0 380 180"
        className="h-full w-auto max-h-12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Roof Outline */}
        <path
          d="M 15,95 L 85,15 L 240,75 L 230,85 L 85,30 L 25,100 Z"
          fill={greenColor}
        />
        {/* Main House Body */}
        <path
          d="M 28,95 L 85,42 L 142,95 L 142,160 L 28,160 Z"
          fill={greenColor}
        />
        {/* 4-Pane Window */}
        <rect x="42" y="96" width="13" height="13" fill={isLight ? '#064E24' : '#FFFFFF'} />
        <rect x="58" y="96" width="13" height="13" fill={isLight ? '#064E24' : '#FFFFFF'} />
        <rect x="42" y="112" width="13" height="13" fill={isLight ? '#064E24' : '#FFFFFF'} />
        <rect x="58" y="112" width="13" height="13" fill={isLight ? '#064E24' : '#FFFFFF'} />
        
        {/* Door Box */}
        <rect x="100" y="120" width="30" height="40" fill={isLight ? '#064E24' : '#F0F4F1'} />
        {/* L in Door */}
        <text
          x="108"
          y="152"
          fill={isLight ? '#FFFFFF' : '#0A5C28'}
          fontSize="24"
          fontWeight="bold"
          fontFamily="Georgia, serif"
        >
          L
        </text>

        {/* Base Bar */}
        <rect x="15" y="166" width="350" height="10" rx="5" fill={greenColor} />

        {/* Brand Text */}
        <text
          x="148"
          y="122"
          fill={greenColor}
          fontSize="38"
          fontWeight="900"
          fontFamily="Georgia, serif"
          letterSpacing="1"
        >
          LOVERIDGE
        </text>
        <text
          x="172"
          y="150"
          fill={subTextColor}
          fontSize="20"
          fontStyle="italic"
          fontWeight="700"
          fontFamily="Georgia, serif"
        >
          Properties & Consult
        </text>
      </svg>
    </div>
  );
}
