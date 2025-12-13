import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Newspaper, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchNews', {});
      return response.data;
    },
  });

  const articles = newsData?.articles || [];

  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title?.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query) ||
      article.source?.toLowerCase().includes(query)
    );
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Business': 'rgba(59, 130, 246, 0.15)',
      'Technology': 'rgba(124, 58, 237, 0.15)',
      'Finance': 'rgba(34, 197, 94, 0.15)',
      'Markets': 'rgba(245, 158, 11, 0.15)',
    };
    return colors[category] || 'rgba(255, 255, 255, 0.1)';
  };

  const getCategoryTextColor = (category) => {
    const colors = {
      'Business': '#3B82F6',
      'Technology': '#7C3AED',
      'Finance': '#22C55E',
      'Markets': '#F59E0B',
    };
    return colors[category] || '#B6C4E0';
  };

  const getReadingTime = (content) => {
    if (!content) return '3 min read';
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {/* Header with Gradient */}
        <div 
          className="px-8 py-12"
          style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #F97316 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Newspaper className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <h1 className="text-4xl font-bold text-white">Latest News</h1>
              <div 
                className="px-3 py-1 rounded-full flex items-center gap-2"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Live Updates</span>
              </div>
            </div>
            <p className="text-lg text-white/90">
              Stay updated with the latest business insights and market trends
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#7A8BA6' }} />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 py-6 text-lg glass-input rounded-xl"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            {/* Articles Count */}
            <p className="mb-6 text-lg" style={{ color: '#B6C4E0' }}>
              {filteredArticles.length} articles found
            </p>

            {/* Articles Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-lg" style={{ color: '#7A8BA6' }}>Loading news...</p>
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card glass-card-hover overflow-hidden"
                  >
                    {/* Article Image */}
                    {article.image ? (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              background: getCategoryColor(article.category),
                              color: getCategoryTextColor(article.category)
                            }}
                          >
                            {article.category}
                          </span>
                          {index < 3 && (
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ background: '#FACC15', color: '#000' }}
                            >
                              External
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="h-48 flex items-center justify-center"
                        style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                      >
                        <Newspaper className="w-12 h-12" style={{ color: '#7A8BA6' }} />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
                        >
                          {article.source}
                        </span>
                        <span className="text-xs" style={{ color: '#7A8BA6' }}>
                          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs" style={{ color: '#7A8BA6' }}>•</span>
                        <span className="text-xs" style={{ color: '#7A8BA6' }}>
                          {getReadingTime(article.content)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: '#E5EDFF' }}>
                        {article.title}
                      </h3>

                      <p className="text-sm mb-4 line-clamp-3" style={{ color: '#B6C4E0' }}>
                        {article.description}
                      </p>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ color: '#3B82F6' }}
                      >
                        Read More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card">
                <Newspaper className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A8BA6' }} />
                <p className="text-lg mb-2" style={{ color: '#B6C4E0' }}>
                  {searchQuery ? 'No articles found matching your search' : 'No news articles available'}
                </p>
                <p className="text-sm" style={{ color: '#7A8BA6' }}>
                  {!newsData?.articles && 'Configure NEWS_API_KEY in settings to fetch news'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}