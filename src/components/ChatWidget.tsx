'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'support'; text: string }[]>([
    { from: 'support', text: 'Welcome to TeslaPrimeCapital support! How can we help you today?' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text: message }]);
    const userMsg = message;
    setMessage('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'support',
          text: `Thank you for your message: "${userMsg}". A support agent will be with you shortly.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 bg-tesla-card border border-tesla-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          <div className="bg-[#CC0000] px-5 py-3 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Support Chat</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'ml-auto bg-[#CC0000] text-white rounded-br-none'
                    : 'bg-[#2a2a2a] text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="border-t border-tesla-border p-3 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-[#2a2a2a] border border-tesla-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#CC0000] transition-colors"
            />
            <button
              onClick={handleSend}
              className="bg-[#CC0000] hover:bg-[#a30000] text-white rounded-lg px-3 py-2 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-[#CC0000] hover:bg-[#a30000] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 animate-pulse-red"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}