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
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // default: always latest first
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      // Load saved preferences
      if (user?.news_preferences) {
        setSelectedRegion(user.news_preferences.region || "all");
        setSelectedCategory(user.news_preferences.category || "all");
        setSortBy(user.news_preferences.sortBy || "date");
      }
    }).catch(() => setCurrentUser(null));
  }, []);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['personalizedNews'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchNews', {});
      return response.data;
    },
    // Cache for 30 minutes on the client — backend handles the real 6-hour freshness
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const articles = newsData?.articles || [];
  const recommendations = newsData?.recommendations || [];

  const savePreferences = async () => {
    if (!currentUser) return;
    try {
      await base44.auth.updateMe({
        news_preferences: {
          region: selectedRegion,
          category: selectedCategory,
          sortBy: sortBy
        }
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        article.title?.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.source?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Region filter
    if (selectedRegion !== "all" && article.region !== selectedRegion) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && article.category !== selectedCategory) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Always default to latest first
    const dateSort = new Date(b.publishedAt) - new Date(a.publishedAt);
    if (sortBy === "relevance") return dateSort; // no special relevance logic, still newest first
    return dateSort; // "date" — newest first
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto" style={{ background: '#F2F1F5' }}>
        {/* Header with Gradient */}
        <div 
          className="px-8 py-12"
          style={{ 
            background: '#D8A11F',
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
            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="glass-card p-6 mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" style={{ color: '#D8A11F' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#000' }}>Personalized for You</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <p key={idx} className="text-sm" style={{ color: '#000' }}>
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 py-6 text-lg rounded-xl"
                style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
              />
            </div>

            {/* Filters */}
            <div className="glass-card p-6 mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: '#000' }}>Filters & Sorting</h3>
                {currentUser && (
                  <Button
                    onClick={savePreferences}
                    size="sm"
                    style={{ background: '#D8A11F', color: '#fff' }}
                  >
                    Save Preferences
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  >
                    <option value="all">All Regions</option>
                    <option value="Canada">Canada</option>
                    <option value="United States">United States</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Africa">Africa</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="Business">Business</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Markets">Markets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  >
                    <option value="date">Latest First</option>
                    <option value="relevance">Most Relevant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Articles Count */}
            <p className="mb-6 text-lg" style={{ color: '#000' }}>
              {filteredArticles.length} articles found
            </p>

            {/* Articles Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#fff', border: '1px solid #000' }}>
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="space-y-2 mt-4">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    style={{ background: '#fff', border: '1px solid #000' }}
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

                      <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: '#000' }}>
                        {article.title}
                      </h3>

                      <p className="text-sm mb-4 line-clamp-3" style={{ color: '#666' }}>
                        {article.description}
                      </p>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ color: '#D8A11F' }}
                      >
                        Read More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card" style={{ background: '#fff', border: '1px solid #000' }}>
                <Newspaper className="w-16 h-16 mx-auto mb-4" style={{ color: '#000' }} />
                <p className="text-lg mb-2" style={{ color: '#000' }}>
                  {searchQuery ? 'No articles found matching your search' : 'No news articles available'}
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
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