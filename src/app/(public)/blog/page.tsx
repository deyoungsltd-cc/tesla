'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';

function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function BlogPage() {
  const [activeCat, setActiveCat] = useState('All');
  const categories = ['All', 'Getting Started', 'Market Analysis', 'Strategy', 'Education'];

  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '5%', right: '-5%' }} />
        <div className="float-orb float-orb-sm" style={{ bottom: '10%', left: '-3%' }} />
        <FadeIn>
          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-sm font-medium">Knowledge Hub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 heading-gradient">Investment Insights</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">Market analysis, trading strategies, and financial education from our expert research team.</p>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${activeCat === cat ? 'bg-[#CC0000] text-white shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'bg-tesla-card border border-tesla-border text-gray-400 hover:text-white hover:border-[#CC0000]/50'}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-16">
        <FadeIn>
          <Link href={`/blog/${blogPosts[0].slug}`} className="block group">
            <div className="glass-card overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="h-56 md:h-auto bg-gradient-to-br from-[#CC0000]/20 via-[#CC0000]/10 to-tesla-card flex items-center justify-center relative overflow-hidden">
                  <span className="text-[#CC0000]/20 text-9xl font-black select-none">TSLA</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-tesla-card/50 hidden md:block" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#CC0000]/10 text-[#CC0000] text-xs font-bold px-3 py-1 rounded-full border border-[#CC0000]/20">FEATURED</span>
                    <span className="text-gray-500 text-xs">{blogPosts[0].readTime} min read</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#CC0000] transition-colors">{blogPosts[0].title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{blogPosts[0].author}</span>
                    <span>&middot;</span>
                    <span>{new Date(blogPosts[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </FadeIn>
      </section>

      {/* Posts Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post, i) => (
            <FadeIn key={post.slug} delay={i * 100}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <div className="dash-card card-shine noise-overlay h-full flex flex-col overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-[#CC0000]/10 to-tesla-card flex items-center justify-center relative overflow-hidden">
                    <span className="text-[#CC0000]/15 text-6xl font-black select-none">{post.category.charAt(0)}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#CC0000] text-xs font-semibold">{post.category}</span>
                      <span className="text-gray-600">&middot;</span>
                      <span className="text-gray-500 text-xs">{post.readTime} min</span>
                    </div>
                    <h3 className="text-white font-bold text-base mb-3 group-hover:text-[#CC0000] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                    <div className="pt-4 border-t border-tesla-border flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex gap-1.5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-gray-600 text-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
