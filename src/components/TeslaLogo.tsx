'use client';

interface TeslaLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'wordmark' | 'compact';
}

export default function TeslaLogo({ className = 'h-8', variant = 'full' }: TeslaLogoProps) {
  // Authentic Tesla T emblem - verified from Simple Icons & Wikimedia Commons
  const emblemPath = 'M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362h-.004.004zm0-3.899c3.415-.03 7.326.528 11.328 2.28.535-.968.672-1.395.672-1.395C19.625.612 15.528.015 12 0 8.472.015 4.375.61 0 2.349c0 0 .195.525.672 1.396C4.674 1.989 8.585 1.435 12 1.46V1.463z';

  // Icon-only variant (square, 24x24)
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d={emblemPath} fill="#CC0000"/>
      </svg>
    );
  }

  // Compact variant: icon + "TESLA" text (for small spaces like nav, headers)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d={emblemPath} fill="#CC0000"/>
        </svg>
        <span className="text-[#CC0000] font-bold tracking-widest leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>TESLA</span>
      </div>
    );
  }

  // Full variant: icon + "TESLA PRIME CAPITAL" text (for login, signup, hero)
  if (variant === 'wordmark') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-full w-auto max-h-full" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d={emblemPath} fill="#CC0000"/>
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-[#CC0000] font-black tracking-[0.2em]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>TESLA</span>
          <span className="text-gray-400 font-semibold tracking-[0.15em] text-[0.65em] mt-0.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>PRIME CAPITAL</span>
        </div>
      </div>
    );
  }

  // Default 'full': combined icon + wordmark (good for hero, login, signup)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-full w-auto max-h-full" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d={emblemPath} fill="#CC0000"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-[#CC0000] font-black tracking-[0.2em]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>TESLA</span>
        <span className="text-gray-400 font-semibold tracking-[0.15em] text-[0.65em] mt-0.5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>PRIME CAPITAL</span>
      </div>
    </div>
  );
}
