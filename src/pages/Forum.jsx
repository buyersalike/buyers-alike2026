import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import ForumStats from "@/components/forum/ForumStats";
import CategoryCard from "@/components/forum/CategoryCard";
import PostCard from "@/components/forum/PostCard";
import CreatePostDialog from "@/components/forum/CreatePostDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function Forum() {
  const [user, setUser] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: () => base44.entities.ForumCategory.list(),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['forumLikes'],
    queryFn: () => base44.entities.ForumLike.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['forumComments'],
    queryFn: () => base44.entities.ForumComment.list(),
  });

  const getCategoryPostCount = (categoryId) => {
    return posts.filter(p => p.category_id === categoryId).length;
  };

  const getPostLikes = (postId) => {
    return likes.filter(l => l.post_id === postId).length;
  };

  const getPostComments = (postId) => {
    return comments.filter(c => c.post_id === postId).length;
  };

  const hasUserLiked = (postId) => {
    return likes.some(l => l.post_id === postId && l.user_email === user?.email);
  };

  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

  const isModerator = user?.role === 'admin' || user?.forum_moderator;

  const filteredPosts = posts.filter(post => {
    // Hide removed posts from non-moderators
    if (post.removed && !isModerator) return false;
    
    // Category filter
    if (selectedCategoryId && post.category_id !== selectedCategoryId) return false;
    
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto" style={{ background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#000' }}>
                Forum
              </h1>
              <p style={{ color: '#000' }}>
                Connect, discuss, and share insights
              </p>
            </div>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="rounded-xl px-6"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', color: '#E5EDFF' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
            </Button>
          </div>

          {/* Stats */}
          <ForumStats 
            totalPosts={posts.length}
            totalViews={totalViews}
            activeMembers={new Set(posts.map(p => p.author_email)).size}
          />

          {/* Categories */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Categories</h2>
              <p className="text-sm" style={{ color: '#000' }}>
                {categories.length} categories available
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  postCount={getCategoryPostCount(category.id)}
                  isSelected={selectedCategoryId === category.id}
                  onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                />
              ))}
            </div>
          </div>

          {/* Recent Discussions */}
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Recent Discussions</h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                />
              </div>
            </div>
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    category={categories.find(c => c.id === post.category_id)}
                    likes={getPostLikes(post.id)}
                    comments={getPostComments(post.id)}
                    hasLiked={hasUserLiked(post.id)}
                    currentUser={user}
                  />
                ))
              ) : (
                <div className="text-center py-12 glass-card">
                  <p className="text-lg" style={{ color: '#000' }}>
                    {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Be the first to start a discussion!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CreatePostDialog
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          categories={categories}
          currentUser={user}
        />
      </main>
    </div>
  );
}