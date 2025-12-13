import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Reply, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommentThread({ comment, postId, currentUser, allComments, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumComments'] });
      setReplyContent("");
      setShowReply(false);
    },
  });

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser) return;
    
    if (currentUser.forum_banned) {
      alert("You have been banned from the forum and cannot comment.");
      return;
    }

    createReplyMutation.mutate({
      post_id: postId,
      content: replyContent,
      author_email: currentUser.email,
      parent_id: comment.id,
      flagged: false,
      removed: false,
    });
  };

  // Get replies to this comment
  const replies = allComments.filter(c => c.parent_id === comment.id);

  const maxDepth = 5;
  const shouldIndent = depth < maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={shouldIndent ? "ml-12" : "ml-4"}
      style={{ 
        borderLeft: shouldIndent ? '2px solid rgba(255, 255, 255, 0.1)' : 'none',
        paddingLeft: shouldIndent ? '1rem' : '0'
      }}
    >
      <div className="py-3">
        <div className="flex gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' }}
          >
            <User className="w-4 h-4" style={{ color: '#E5EDFF' }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm" style={{ color: '#E5EDFF' }}>
                {comment.author_email.split('@')[0]}
              </span>
              <span className="text-xs" style={{ color: '#7A8BA6' }}>
                {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
              </span>
            </div>

            {comment.removed ? (
              <div className="p-2 rounded-lg mb-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p className="text-sm" style={{ color: '#EF4444' }}>Comment removed by moderator</p>
              </div>
            ) : (
              <p className="text-sm mb-2 leading-relaxed" style={{ color: '#B6C4E0' }}>
                {comment.content}
              </p>
            )}

            {!comment.removed && currentUser && (
              <Button
                onClick={() => setShowReply(!showReply)}
                className="gap-1 px-3 py-1 h-auto text-xs rounded-lg"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  color: '#7A8BA6',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Reply className="w-3 h-3" />
                Reply
              </Button>
            )}

            {showReply && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReplySubmit}
                className="mt-3 space-y-2"
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="glass-input text-sm"
                  style={{ color: '#E5EDFF' }}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!replyContent.trim() || createReplyMutation.isPending}
                    className="gap-2 px-4 py-2 h-auto text-sm rounded-lg"
                    style={{ background: '#3B82F6', color: '#fff' }}
                  >
                    <Send className="w-3 h-3" />
                    Reply
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowReply(false)}
                    className="px-4 py-2 h-auto text-sm rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#B6C4E0' }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>

      {/* Render nested replies */}
      {replies.length > 0 && (
        <div className="space-y-1">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              allComments={allComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}