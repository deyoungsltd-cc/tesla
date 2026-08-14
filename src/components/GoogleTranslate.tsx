'use client';

import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', label: 'Bahasa', flag: '🇮🇩' },
  { code: 'ms', label: 'Malay', flag: '🇲🇾' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
];

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('en');
  const ref = useRef<HTMLDivElement>(null);
  const translateInitialized = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = (code: string) => {
    setSelected(code);
    setOpen(false);

    // Use Google Translate
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else if (!translateInitialized.current) {
      // Initialize Google Translate if not yet loaded
      const existing = document.getElementById('google-translate-script');
      if (!existing) {
        translateInitialized.current = true;
        window.googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
          );
          // After initialization, change language
          setTimeout(() => {
            const sel = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (sel) {
              sel.value = code;
              sel.dispatchEvent(new Event('change'));
            }
          }, 500);
        };
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
      }
    }
  };

  const currentLang = languages.find(l => l.code === selected) || languages[0];

  return (
    <>
      {/* Hidden element required by Google Translate */}
      <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-300"
          aria-label="Change language"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="hidden sm:inline">{currentLang.flag}</span>
          <span className="hidden sm:inline text-xs">{currentLang.label}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-tesla-border rounded-xl shadow-2xl overflow-hidden z-[100]">
            <div className="p-2 border-b border-tesla-border/50">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider px-2">Select Language</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selected === lang.code
                      ? 'bg-[#CC0000]/10 text-[#CC0000]'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {selected === lang.code && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Extend window for Google Translate
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google: any;
  }
}
