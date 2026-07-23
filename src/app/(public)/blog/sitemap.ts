import type { MetadataRoute } from 'next';

export default function blogSitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://teslapremiumfinance.com';
  // In production, fetch from DB. For now static examples:
  const posts = [
    { slug: 'how-to-start-investing-in-2024', date: '2024-01-15' },
    { slug: 'tesla-stock-analysis-q1', date: '2024-02-20' },
    { slug: 'crypto-vs-traditional-investments', date: '2024-03-10' },
    { slug: 'understanding-daily-returns', date: '2024-04-05' },
    { slug: 'diversification-strategies', date: '2024-05-12' },
  ];

  return posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
