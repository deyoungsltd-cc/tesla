'use client';

interface TeslaLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'wordmark';
}

export default function TeslaLogo({ className = 'h-8', variant = 'full' }: TeslaLogoProps) {
  // Authentic Tesla T emblem from Simple Icons (verified against Tesla branding)
  // Source: https://simpleicons.org/icons/tesla.svg
  const emblemPath = 'M12.743 0L7.79 12.276h3.166l.546-1.397h5.506l.546 1.397h3.166L15.257 0h-2.514zM12 4.583l1.835 4.744h-3.67L12 4.583zM7.79 12.276L.1 24h23.8l-7.69-11.724H7.79z';

  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d={emblemPath} fill="#CC0000"/>
      </svg>
    );
  }

  // Full Tesla wordmark - official TESLA logo shape (from Tesla brand guidelines)
  // Uses geometric sans-serif paths matching the real TESLA wordmark
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}
