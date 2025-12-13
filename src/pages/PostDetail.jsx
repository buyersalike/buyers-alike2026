import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import CommentThread from "@/components/forum/CommentThread";
import ModerationMenu from "@/components/forum/ModerationMenu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, User, FileText, ExternalLink, ArrowLeft, Send, Flag, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PostDetail() {
  const [user, setUser] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const location = useLocation();
  const queryClient = useQueryClient();

  // Get post ID from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const postId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: () => base44.entities.ForumCategory.list(),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['forumLikes'],
    queryFn: () => base44.entities.ForumLike.list(),
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['forumComments'],
    queryFn: () => base44.entities.ForumComment.list(),
  });

  const post = posts.find(p => p.id === postId);
  const category = categories.find(c => c.id === post?.category_id);
  const postLikes = likes.filter(l => l.post_id === postId);
  const postComments = allComments.filter(c => c.post_id === postId);
  const topLevelComments = postComments.filter(c => !c.parent_id);
  const hasLiked = user ? postLikes.some(l => l.user_email === user.email) : false;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (hasLiked) {
        const userLike = await base44.entities.ForumLike.filter({ 
          post_id: postId, 
          user_email: user.email 
        });
        if (userLike[0]) {
          await base44.entities.ForumLike.delete(userLike[0].id);
        }
      } else {
        await base44.entities.ForumLike.create({
          post_id: postId,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumLikes'] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumComments'] });
      setCommentContent("");
    },
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !user) return;

    if (user.forum_banned) {
      alert("You have been banned from the forum and cannot comment.");
      return;
    }

    createCommentMutation.mutate({
      post_id: postId,
      content: commentContent,
      author_email: user.email,
      flagged: false,
      removed: false,
    });
  };

  if (!post) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-xl" style={{ color: '#B6C4E0' }}>Post not found</p>
            <Link to={createPageUrl('Forum')}>
              <Button className="mt-4 gap-2" style={{ background: '#3B82F6', color: '#fff' }}>
                <ArrowLeft className="w-4 h-4" />
                Back to Forum
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to={createPageUrl('Forum')}>
            <Button className="mb-6 gap-2" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#B6C4E0' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Forum
            </Button>
          </Link>

          {/* Post Content */}
          <div className="glass-card p-8 mb-6">
            <div className="flex items-start gap-5 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
              >
                <User className="w-8 h-8" style={{ color: '#E5EDFF' }} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold" style={{ color: '#E5EDFF' }}>
                        {post.title}
                      </h1>
                      {post.flagged && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                          <Flag className="w-3 h-3" />
                          <span className="text-xs font-medium">Flagged</span>
                        </div>
                      )}
                      {post.removed && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs font-medium">Removed</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                        {post.author_name || post.author_email.split('@')[0]}
                      </span>
                      <span className="text-sm" style={{ color: '#7A8BA6' }}>in</span>
                      <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
                        {category?.name || 'General'}
                      </span>
                      <span className="text-sm" style={{ color: '#7A8BA6' }}>•</span>
                      <span className="text-sm" style={{ color: '#7A8BA6' }}>
                        {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <ModerationMenu post={post} currentUser={user} />
                </div>

                {post.removed ? (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p className="font-medium mb-1" style={{ color: '#EF4444' }}>This post has been removed</p>
                    {post.removal_reason && (
                      <p className="text-sm" style={{ color: '#B6C4E0' }}>Reason: {post.removal_reason}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed mb-6" style={{ color: '#B6C4E0' }}>
                    {post.content}
                  </p>
                )}

                {post.link_url && (
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3B82F6' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.link_url}</span>
                  </a>
                )}

                {post.file_urls && post.file_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.file_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80"
                        style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#7C3AED' }}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Attachment {idx + 1}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <Button
                    onClick={() => user && likeMutation.mutate()}
                    disabled={!user}
                    className="gap-2 px-5 py-2 rounded-lg"
                    style={{ 
                      background: hasLiked ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                      color: hasLiked ? '#3B82F6' : '#B6C4E0',
                      border: hasLiked ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <ThumbsUp className="w-5 h-5" fill={hasLiked ? '#3B82F6' : 'none'} />
                    <span className="font-medium">{postLikes.length}</span>
                  </Button>

                  <div className="flex items-center gap-2 px-5 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: '#B6C4E0' }} />
                    <span className="font-medium" style={{ color: '#B6C4E0' }}>{postComments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#E5EDFF' }}>
              Discussion ({postComments.length})
            </h2>

            {/* Add Comment Form */}
            {user && !post.removed && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="glass-input mb-3"
                  style={{ color: '#E5EDFF' }}
                  rows={4}
                />
                <Button
                  type="submit"
                  disabled={!commentContent.trim() || createCommentMutation.isPending}
                  className="gap-2 px-6 py-2 rounded-lg"
                  style={{ background: '#3B82F6', color: '#fff' }}
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </form>
            )}

            {!user && (
              <div className="mb-8 p-4 rounded-xl text-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <p style={{ color: '#7A8BA6' }}>Sign in to join the discussion</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-1">
              {topLevelComments.length > 0 ? (
                topLevelComments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    currentUser={user}
                    allComments={postComments}
                    depth={0}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p style={{ color: '#7A8BA6' }}>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}