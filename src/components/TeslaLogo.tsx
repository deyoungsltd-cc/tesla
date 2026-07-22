'use client';

interface TeslaLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'wordmark';
}

export default function TeslaLogo({ className = 'h-8', variant = 'full' }: TeslaLogoProps) {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 C50 5 25 15 25 15 L25 45 C25 45 35 50 50 50 C65 50 75 45 75 45 L75 15 C75 15 50 5 50 5Z" fill="#CC0000"/>
        <path d="M30 55 L30 85 C30 85 40 90 50 90 C60 90 70 85 70 85 L70 55" fill="none" stroke="#CC0000" strokeWidth="4" strokeLinecap="round"/>
        <text x="50" y="72" textAnchor="middle" fill="#CC0000" fontSize="28" fontWeight="bold" fontFamily="Arial, sans-serif">T</text>
      </svg>
    );
  }

  // Full Tesla wordmark - the official TESLA logo shape
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}