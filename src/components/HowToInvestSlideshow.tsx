'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ──────────────────────────────────────────────
// Slide data
// ──────────────────────────────────────────────

interface Slide {
  step: number;
  title: string;
  description: string;
  shapeType: 'circle-ring' | 'diamond' | 'bars' | 'coin-stack';
}

const SLIDES: Slide[] = [
  {
    step: 1,
    title: 'Create Account',
    description: 'Sign up and verify your email in minutes',
    shapeType: 'circle-ring',
  },
  {
    step: 2,
    title: 'Complete KYC',
    description: 'Verify your identity to unlock full features',
    shapeType: 'diamond',
  },
  {
    step: 3,
    title: 'Choose a Plan',
    description: 'Select from Basic to Elite investment tiers',
    shapeType: 'bars',
  },
  {
    step: 4,
    title: 'Fund & Earn',
    description: 'Deposit funds and watch daily returns accumulate',
    shapeType: 'coin-stack',
  },
];

// ──────────────────────────────────────────────
// CSS-only animated icon per step
// ──────────────────────────────────────────────

function AnimatedIcon({ type }: { type: Slide['shapeType'] }) {
  switch (type) {
    case 'circle-ring':
      return (
        <div className="relative w-28 h-28 mx-auto">
          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2.5px solid transparent',
              borderTopColor: '#CC0000',
              borderRightColor: 'rgba(204,0,0,0.4)',
              animation: 'hti-spin 3s linear infinite',
            }}
          />
          {/* Inner rotating ring (opposite) */}
          <div
            className="absolute inset-3 rounded-full"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(204,0,0,0.6)',
              borderLeftColor: 'rgba(204,0,0,0.2)',
              animation: 'hti-spin-reverse 2.5s linear infinite',
            }}
          />
          {/* Center dot */}
          <div
            className="absolute inset-0 m-auto w-5 h-5 rounded-full"
            style={{
              background: 'radial-gradient(circle, #CC0000 0%, rgba(204,0,0,0.3) 70%, transparent 100%)',
              animation: 'hti-pulse-scale 2s ease-in-out infinite',
            }}
          />
          {/* Cross lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-8 h-px bg-gradient-to-r from-transparent via-tesla-gray-600 to-transparent" />
            <div className="absolute h-8 w-px bg-gradient-to-b from-transparent via-tesla-gray-600 to-transparent" />
          </div>
        </div>
      );

    case 'diamond':
      return (
        <div className="relative w-28 h-28 mx-auto">
          {/* Shield / diamond shape */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'hti-float-icon 3s ease-in-out infinite' }}
          >
            <div
              className="w-16 h-20 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(204,0,0,0.15) 0%, rgba(204,0,0,0.05) 100%)',
                border: '1.5px solid rgba(204,0,0,0.4)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              {/* Inner diamond */}
              <div
                className="absolute inset-3"
                style={{
                  background: 'linear-gradient(180deg, rgba(204,0,0,0.2) 0%, rgba(204,0,0,0.05) 100%)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            </div>
          </div>
          {/* Rotating corner accents */}
          <div
            className="absolute top-1 left-1 w-4 h-4"
            style={{
              borderTop: '2px solid rgba(204,0,0,0.5)',
              borderLeft: '2px solid rgba(204,0,0,0.5)',
              animation: 'hti-pulse-opacity 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1 right-1 w-4 h-4"
            style={{
              borderBottom: '2px solid rgba(204,0,0,0.5)',
              borderRight: '2px solid rgba(204,0,0,0.5)',
              animation: 'hti-pulse-opacity 2s ease-in-out infinite 0.5s',
            }}
          />
          {/* Checkmark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-3 relative">
              <div
                className="absolute left-0 top-[6px] w-[6px] h-[10px] border-r-2 border-b-2 border-[#CC0000] rotate-45"
                style={{ animation: 'hti-draw-check 2s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      );

    case 'bars':
      return (
        <div className="relative w-28 h-28 mx-auto flex items-end justify-center gap-2 pb-2">
          {[40, 60, 85, 55, 70].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-t"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, rgba(204,0,0,${0.2 + i * 0.15}), rgba(204,0,0,${0.6 + i * 0.1}))`,
                border: '1px solid rgba(204,0,0,0.3)',
                animation: `hti-bar-grow 2s ease-in-out infinite ${i * 0.15}s both`,
              }}
            />
          ))}
          {/* Trend line overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 112 112"
            preserveAspectRatio="none"
          >
            <polyline
              points="20,90 40,70 60,30 80,50 100,20"
              fill="none"
              stroke="rgba(204,0,0,0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              style={{
                strokeDashoffset: '0',
                animation: 'hti-dash-move 3s linear infinite',
              }}
            />
          </svg>
        </div>
      );

    case 'coin-stack':
      return (
        <div className="relative w-28 h-28 mx-auto">
          {/* Stacked coins */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute left-1/2 w-16 h-6 rounded-full"
              style={{
                top: `${20 + i * 14}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                background: `linear-gradient(180deg, rgba(204,0,0,${0.1 + i * 0.08}) 0%, rgba(204,0,0,${0.25 + i * 0.08}) 100%)`,
                border: '1.5px solid rgba(204,0,0,0.35)',
                animation: `hti-coin-drop ${0.6 + i * 0.15}s ease-out ${i * 0.2}s both`,
              }}
            />
          ))}
          {/* Dollar sign on top coin */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-[#CC0000] font-bold text-sm"
            style={{
              top: '22px',
              animation: 'hti-coin-drop 0.6s ease-out 0.6s both',
              textShadow: '0 0 8px rgba(204,0,0,0.4)',
            }}
          >
            $
          </div>
          {/* Upward arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center">
            <div
              className="w-px h-5"
              style={{
                background: 'linear-gradient(to top, transparent, #CC0000)',
                animation: 'hti-arrow-grow 2s ease-in-out infinite',
              }}
            />
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '5px solid #CC0000',
                animation: 'hti-arrow-grow 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      );
  }
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

interface HowToInvestSlideshowProps {
  className?: string;
}

export default function HowToInvestSlideshow({ className = '' }: HowToInvestSlideshowProps) {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const isPaused = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = SLIDES.length;

  const goTo = useCallback(
    (index: number, dir: 'next' | 'prev' = 'next') => {
      if (isTransitioning || index === active) return;
      setIsTransitioning(true);
      setDirection(dir);
      setActive(index);
      setTimeout(() => setIsTransitioning(false), 650);
    },
    [active, isTransitioning],
  );

  const goNext = useCallback(() => {
    goTo((active + 1) % total, 'next');
  }, [active, goTo, total]);

  const goPrev = useCallback(() => {
    goTo((active - 1 + total) % total, 'prev');
  }, [active, goTo, total]);

  // Auto-advance every 5 seconds, pauses on hover / touch
  useEffect(() => {
    const tick = setInterval(() => {
      if (!isPaused.current && !isTransitioning) {
        goNext();
      }
    }, 5000);
    return () => clearInterval(tick);
  }, [goNext, isTransitioning]);

  // Touch / swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isPaused.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    isPaused.current = false;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const current = SLIDES[active];

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── 3D perspective container ── */}
      <div className="perspective-container relative w-full overflow-hidden" style={{ height: '440px' }}>

        {/* ── Animated geometric background shapes ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Rotating square border – top-left */}
          <div
            className="absolute -top-8 -left-8 w-24 h-24"
            style={{
              border: '1.5px solid rgba(204,0,0,0.12)',
              borderRadius: '6px',
              animation: 'hti-spin 18s linear infinite',
            }}
          />
          {/* Rotating circle border – bottom-right */}
          <div
            className="absolute -bottom-10 -right-10 w-32 h-32"
            style={{
              border: '1.5px solid rgba(204,0,0,0.08)',
              borderRadius: '50%',
              animation: 'hti-spin-reverse 22s linear infinite',
            }}
          />
          {/* Gradient circle – top-right */}
          <div
            className="absolute top-4 right-8 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(204,0,0,0.06) 0%, transparent 70%)',
              animation: 'hti-float-bg 8s ease-in-out infinite',
            }}
          />
          {/* Gradient circle – bottom-left */}
          <div
            className="absolute bottom-4 left-4 w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(204,0,0,0.05) 0%, transparent 70%)',
              animation: 'hti-float-bg 10s ease-in-out infinite 2s',
            }}
          />
          {/* Small floating diamond */}
          <div
            className="absolute top-1/3 left-6 w-3 h-3"
            style={{
              background: 'rgba(204,0,0,0.2)',
              transform: 'rotate(45deg)',
              animation: 'hti-float-bg 6s ease-in-out infinite 1s',
            }}
          />
          <div
            className="absolute top-1/2 right-12 w-2 h-2 rounded-full"
            style={{
              background: 'rgba(204,0,0,0.15)',
              animation: 'hti-pulse-opacity 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Slides ── */}
        {SLIDES.map((slide, i) => {
          let transform = '';
          let opacity = 0;
          let zIndex = 0;
          let pointerEvents: 'none' | 'auto' = 'none';

          if (i === active) {
            transform = 'translateX(0) rotateY(0deg)';
            opacity = 1;
            zIndex = 10;
            pointerEvents = 'auto';
          } else if (i === (active + 1) % total) {
            transform = 'translateX(100%) rotateY(-15deg)';
            opacity = 0;
            zIndex = 5;
          } else if (i === (active - 1 + total) % total) {
            transform = 'translateX(-100%) rotateY(15deg)';
            opacity = 0;
            zIndex = 5;
          } else {
            transform =
              direction === 'next'
                ? 'translateX(100%) rotateY(-15deg)'
                : 'translateX(-100%) rotateY(15deg)';
            opacity = 0;
            zIndex = 1;
          }

          return (
            <div
              key={i}
              className="slide-card absolute inset-0 flex items-center justify-center"
              style={{
                transform,
                opacity,
                zIndex,
                pointerEvents,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                className="relative w-full max-w-md mx-4 bg-tesla-card border border-tesla-border rounded-3xl p-8 sm:p-10 overflow-hidden"
                style={{
                  boxShadow:
                    '0 25px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(204,0,0,0.08) inset',
                  transform: 'translateZ(30px)',
                }}
              >
                {/* Floor glow under card */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-16 rounded-full blur-2xl opacity-40"
                  style={{ background: 'rgba(204,0,0,0.25)' }}
                />

                {/* Corner glow */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20"
                  style={{ background: 'radial-gradient(circle, #CC0000 0%, transparent 70%)' }}
                />

                {/* Watermark step number */}
                <div
                  className="absolute -right-4 -bottom-4 text-[160px] sm:text-[200px] font-black opacity-[0.04] leading-none select-none pointer-events-none"
                  style={{ color: '#CC0000', fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  {String(slide.step).padStart(2, '0')}
                </div>

                {/* Step number with glow */}
                <div className="relative flex items-center justify-center mb-5">
                  <span
                    className="glow-step-number text-7xl sm:text-8xl font-black tracking-tighter leading-none"
                    style={{ color: '#CC0000' }}
                  >
                    {String(slide.step).padStart(2, '0')}
                  </span>
                </div>

                {/* Animated icon */}
                <div className="relative mb-6">
                  <AnimatedIcon type={slide.shapeType} />
                </div>

                {/* Title */}
                <h3 className="relative text-center text-white font-bold text-2xl sm:text-3xl mb-3 tracking-tight">
                  {slide.title}
                </h3>

                {/* Divider */}
                <div className="relative mx-auto w-12 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, #CC0000, transparent)' }} />

                {/* Description */}
                <p className="relative text-center text-tesla-gray-300 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                  {slide.description}
                </p>

                {/* Step counter */}
                <div className="relative mt-6 flex items-center justify-center gap-2">
                  <span className="text-tesla-gray-500 text-xs font-medium tracking-widest uppercase">
                    Step {slide.step} of {total}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Navigation dots ── */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > active ? 'next' : 'prev')}
            disabled={isTransitioning}
            className="transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] rounded-full"
            aria-label={`Go to step ${i + 1}: ${s.title}`}
          >
            <div
              className="transition-all duration-300"
              style={{
                width: i === active ? '28px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: i === active ? '#CC0000' : '#444',
                boxShadow: i === active ? '0 0 10px rgba(204,0,0,0.5)' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* ── Prev / Next buttons ── */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          onClick={goPrev}
          disabled={isTransitioning}
          className="w-10 h-10 rounded-full bg-tesla-card border border-tesla-border hover:border-[#CC0000]/50 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
          aria-label="Previous step"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={goNext}
          disabled={isTransitioning}
          className="w-10 h-10 rounded-full bg-tesla-card border border-tesla-border hover:border-[#CC0000]/50 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
          aria-label="Next step"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ── Inline keyframes ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 3D perspective wrapper */
        .perspective-container {
          perspective: 1000px;
        }

        /* Slide card 3D settings */
        .slide-card {
          transform-style: preserve-3d;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        /* Glow animation for step numbers */
        @keyframes hti-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(204,0,0,0.3), 0 0 40px rgba(204,0,0,0.1); }
          50%      { text-shadow: 0 0 40px rgba(204,0,0,0.6), 0 0 80px rgba(204,0,0,0.25), 0 0 120px rgba(204,0,0,0.1); }
        }
        .glow-step-number {
          animation: hti-glow 3s ease-in-out infinite;
        }

        /* Spin (clockwise) */
        @keyframes hti-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Spin (counter-clockwise) */
        @keyframes hti-spin-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }

        /* Pulse scale */
        @keyframes hti-pulse-scale {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.3); opacity: 1; }
        }

        /* Pulse opacity */
        @keyframes hti-pulse-opacity {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }

        /* Float icon */
        @keyframes hti-float-icon {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        /* Float background shapes */
        @keyframes hti-float-bg {
          0%, 100% { transform: translate(0, 0); }
          25%      { transform: translate(8px, -12px); }
          50%      { transform: translate(-5px, -20px); }
          75%      { transform: translate(-12px, -8px); }
        }

        /* Draw checkmark */
        @keyframes hti-draw-check {
          0%   { transform: rotate(45deg) scaleY(0); opacity: 0; }
          40%  { transform: rotate(45deg) scaleY(1); opacity: 1; }
          80%  { transform: rotate(45deg) scaleY(1); opacity: 1; }
          100% { transform: rotate(45deg) scaleY(1); opacity: 0.6; }
        }

        /* Bar grow */
        @keyframes hti-bar-grow {
          0%   { transform: scaleY(0); transform-origin: bottom; }
          50%  { transform: scaleY(1); transform-origin: bottom; }
          80%  { transform: scaleY(0.95); transform-origin: bottom; }
          100% { transform: scaleY(1); transform-origin: bottom; }
        }

        /* Coin drop */
        @keyframes hti-coin-drop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          60%  { opacity: 1; transform: translateX(-50%) translateY(2px); }
          80%  { transform: translateX(-50%) translateY(-2px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Arrow grow */
        @keyframes hti-arrow-grow {
          0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
          50%      { opacity: 1; transform: scaleY(1); }
        }

        /* Dash move for trend line */
        @keyframes hti-dash-move {
          to { stroke-dashoffset: -24; }
        }
      ` }} />
    </div>
  );
}
