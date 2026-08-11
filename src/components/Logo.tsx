'use client';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'white';
}

export default function Logo({ className = "h-10", variant = 'dark' }: LogoProps) {
  const isLight = variant === 'light' || variant === 'white';
  const logoSrc = isLight ? '/logo-white.png' : '/logo-green.png';

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="Loveridge Properties & Consult Logo"
        className="h-full w-auto max-h-full object-contain shrink-0"
        style={{ display: 'block', maxHeight: '100%' }}
      />
    </div>
  );
}

