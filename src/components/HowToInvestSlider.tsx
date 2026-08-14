'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ──────────────────────────────────────────────
// Investment steps data
// ──────────────────────────────────────────────

interface Step {
  num: string;
  title: string;
  short: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Register',
    short: 'Create your account',
    desc: 'Sign up in under 2 minutes. Verify your email and unlock the dashboard instantly.',
    color: '#CC0000',
    glowColor: 'rgba(204, 0, 0, 0.4)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Verify KYC',
    short: 'Complete verification',
    desc: 'Upload your ID and proof of address. Three simple levels unlock higher limits and withdrawals.',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Deposit',
    short: 'Fund your account',
    desc: 'Add funds via crypto (BTC, ETH, USDT) or gift cards. Crypto deposits confirm in minutes.',
    color: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Invest',
    short: 'Choose a plan',
    desc: 'Pick from Basic, Silver, Gold, or Platinum. Daily returns up to 1.8% credited automatically.',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Withdraw',
    short: 'Cash out profits',
    desc: 'Withdraw anytime to your crypto wallet. Verified accounts enjoy instant processing.',
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    ),
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function HowToInvestSlider() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveStep((prev) => (prev + 1) % STEPS.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const prev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveStep((p) => (p - 1 + STEPS.length) % STEPS.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const goTo = useCallback((i: number) => {
    if (isAnimating || i === activeStep) return;
    setIsAnimating(true);
    setActiveStep(i);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, activeStep]);

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isAutoPlaying, next]);

  const current = STEPS[activeStep];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* 3D Perspective Container */}
      <div
        className="relative h-[420px] sm:h-[380px] w-full"
        style={{ perspective: '1400px' }}
      >
        {/* Floor glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-8 w-[70%] h-12 rounded-full blur-2xl opacity-50 transition-all duration-700"
          style={{ backgroundColor: current.glowColor }}
        />

        {/* Main Card with 3D transform */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            key={activeStep}
            className="relative w-full max-w-md"
            style={{
              transform: 'rotateY(0deg) rotateX(0deg)',
              animation: 'cardFlipIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              className="relative bg-gradient-to-br from-[#0d0d0d] via-[#1a0505] to-[#0d0d0d] border border-tesla-border rounded-3xl p-8 sm:p-10 overflow-hidden"
              style={{
                boxShadow: `0 25px 60px -15px ${current.glowColor}, 0 0 0 1px ${current.color}20 inset`,
                transform: 'translateZ(20px)',
              }}
            >
              {/* Background watermark number */}
              <div
                className="absolute -right-6 -bottom-6 text-[180px] sm:text-[220px] font-black opacity-[0.06] leading-none select-none pointer-events-none"
                style={{ color: current.color, fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                {current.num}
              </div>

              {/* Glow accent */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: current.color }}
              />

              {/* Step number badge */}
              <div className="relative flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wider"
                  style={{
                    backgroundColor: `${current.color}20`,
                    border: `1px solid ${current.color}50`,
                    color: current.color,
                  }}
                >
                  {current.num}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-tesla-border to-transparent" />
                <span className="text-gray-500 text-xs font-medium tracking-wider uppercase">
                  Step {activeStep + 1} of {STEPS.length}
                </span>
              </div>

              {/* Icon with 3D float */}
              <div className="relative mb-6 flex justify-center">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${current.color}15`,
                    border: `1.5px solid ${current.color}40`,
                    color: current.color,
                    boxShadow: `0 10px 40px -10px ${current.glowColor}`,
                    animation: 'floatIcon 3s ease-in-out infinite',
                  }}
                >
                  {current.icon}
                </div>
              </div>

              {/* Title + Description */}
              <div className="relative text-center">
                <h3 className="text-white font-bold text-2xl sm:text-3xl mb-2 tracking-tight">
                  {current.title}
                </h3>
                <p className="text-sm font-medium mb-3" style={{ color: current.color }}>
                  {current.short}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                  {current.desc}
                </p>
              </div>

              {/* CTA Button - only on last step */}
              {activeStep === STEPS.length - 1 && (
                <div className="relative mt-6 flex justify-center">
                  <Link
                    href="/investments"
                    className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#a30000] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Start Investing Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3D Side cards (decorative depth) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-4 sm:left-8 w-20 h-32 sm:w-28 sm:h-44 bg-tesla-card border border-tesla-border rounded-2xl opacity-30 hidden sm:block"
          style={{
            transform: 'rotateY(35deg) translateZ(-50px)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
          }}
        >
          <div className="p-3 h-full flex flex-col justify-between">
            <div className="w-6 h-6 rounded-md bg-tesla-border" />
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-tesla-border rounded" />
              <div className="h-1.5 w-2/3 bg-tesla-border rounded" />
            </div>
          </div>
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -right-4 sm:right-8 w-20 h-32 sm:w-28 sm:h-44 bg-tesla-card border border-tesla-border rounded-2xl opacity-30 hidden sm:block"
          style={{
            transform: 'rotateY(-35deg) translateZ(-50px)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
          }}
        >
          <div className="p-3 h-full flex flex-col justify-between">
            <div className="w-6 h-6 rounded-md bg-tesla-border" />
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-tesla-border rounded" />
              <div className="h-1.5 w-2/3 bg-tesla-border rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={prev}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-tesla-card border border-tesla-border hover:border-[#CC0000]/50 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
          aria-label="Previous step"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              onClick={() => goTo(i)}
              disabled={isAnimating}
              className="transition-all duration-300 disabled:cursor-not-allowed"
              aria-label={`Go to step ${i + 1}: ${s.title}`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === activeStep ? 'w-8 h-2' : 'w-2 h-2 hover:opacity-100 opacity-40'
                }`}
                style={{
                  backgroundColor: i === activeStep ? current.color : '#444',
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={next}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full bg-tesla-card border border-tesla-border hover:border-[#CC0000]/50 text-gray-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
          aria-label="Next step"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Inline keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cardFlipIn {
          0%   { opacity: 0; transform: rotateY(-90deg) translateZ(-100px) scale(0.85); }
          60%  { opacity: 1; transform: rotateY(8deg) translateZ(20px) scale(1.02); }
          100% { opacity: 1; transform: rotateY(0deg) translateZ(20px) scale(1); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) translateZ(0); }
          50%      { transform: translateY(-8px) translateZ(10px); }
        }
      ` }} />
    </div>
  );
}
