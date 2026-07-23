import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog | Tesla Prime Capital',
  description: 'Investment insights, market analysis, and financial education from Tesla Prime Capital.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Investment <span className="text-[#CC0000]">Insights</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Market analysis, trading strategies, and financial education from our expert team.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {['All', 'Getting Started', 'Market Analysis', 'Strategy', 'Education'].map((cat) => (
            <span key={cat} className="px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors bg-tesla-card border border-tesla-border text-gray-400 hover:text-white hover:border-[#CC0000]/50">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <Link href={`/blog/${blogPosts[0].slug}`} className="block group">
          <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden hover:border-[#CC0000]/50 transition-all duration-300">
            <div className="grid md:grid-cols-2">
              <div className="h-48 md:h-auto bg-gradient-to-br from-[#CC0000]/20 to-tesla-card flex items-center justify-center">
                <span className="text-[#CC0000]/30 text-8xl font-black">TSLA</span>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#CC0000]/10 text-[#CC0000] text-xs font-bold px-3 py-1 rounded-full">FEATURED</span>
                  <span className="text-gray-500 text-xs">{blogPosts[0].readTime} min read</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#CC0000] transition-colors">{blogPosts[0].title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{blogPosts[0].author}</span>
                  <span>&middot;</span>
                  <span>{new Date(blogPosts[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* All Posts Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden hover:border-[#CC0000]/40 transition-all duration-300 hover:-translate-y-1">
                <div className="h-40 bg-gradient-to-br from-[#CC0000]/10 to-tesla-card flex items-center justify-center">
                  <span className="text-[#CC0000]/20 text-5xl font-black">{post.category.charAt(0)}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#CC0000] text-xs font-medium">{post.category}</span>
                    <span className="text-gray-600">&middot;</span>
                    <span className="text-gray-500 text-xs">{post.readTime} min</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-[#CC0000] transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{post.excerpt}</p>
                  <div className="mt-3 pt-3 border-t border-tesla-border flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-gray-600 text-xs">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
