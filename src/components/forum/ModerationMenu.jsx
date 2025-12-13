import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MoreVertical, Flag, Trash2, Ban, CheckCircle } from "lucide-react";

export default function ModerationMenu({ post, currentUser }) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const queryClient = useQueryClient();

  const isModerator = currentUser?.role === 'admin' || currentUser?.forum_moderator;

  const flagPostMutation = useMutation({
    mutationFn: () => base44.entities.ForumPost.update(post.id, { flagged: !post.flagged }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });

  const removePostMutation = useMutation({
    mutationFn: () => base44.entities.ForumPost.update(post.id, { 
      removed: true,
      removal_reason: removalReason 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setShowRemoveDialog(false);
      setRemovalReason("");
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async () => {
      const users = await base44.entities.User.filter({ email: post.author_email });
      if (users[0]) {
        await base44.entities.User.update(users[0].id, { forum_banned: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setShowBanDialog(false);
    },
  });

  if (!isModerator) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            style={{ color: '#7A8BA6' }}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              flagPostMutation.mutate();
            }}
            style={{ color: '#E5EDFF' }}
          >
            {post.flagged ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Unflag Post
              </>
            ) : (
              <>
                <Flag className="w-4 h-4 mr-2" />
                Flag Post
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowRemoveDialog(true);
            }}
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Post
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowBanDialog(true);
            }}
            style={{ color: '#EF4444' }}
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban User from Forum
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove Post Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Remove Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Reason for Removal (Optional)</Label>
              <Textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                placeholder="Explain why this post is being removed..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowRemoveDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => removePostMutation.mutate()}
              style={{ background: '#EF4444', color: '#fff' }}
            >
              Remove Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Ban User from Forum</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p style={{ color: '#B6C4E0' }}>
              Are you sure you want to ban <strong>{post.author_name || post.author_email}</strong> from the forum? 
              They will no longer be able to create posts or comments.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowBanDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => banUserMutation.mutate()}
              style={{ background: '#EF4444', color: '#fff' }}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}