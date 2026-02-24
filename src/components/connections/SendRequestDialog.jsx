import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserPlus, Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SendRequestDialog({ open, onOpenChange, user, onSend, isPending }) {
  const [message, setMessage] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Auto-generate AI message when dialog opens
  useEffect(() => {
    if (open && user?.email && !message) {
      generateAIMessage();
    }
  }, [open, user?.email]);

  const generateAIMessage = async () => {
    if (!user?.email) return;
    setGeneratingAI(true);
    setAiGenerated(false);
    try {
      const response = await base44.functions.invoke('generateConnectionMessage', {
        targetUserEmail: user.email,
      });
      if (response.data?.success && response.data?.message) {
        setMessage(response.data.message);
        setAiGenerated(true);
      }
    } catch (e) {
      // silently fail — user can type manually
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSend = () => {
    onSend(message);
    setMessage("");
    setAiGenerated(false);
  };

  const handleClose = (val) => {
    if (!val) {
      setMessage("");
      setAiGenerated(false);
    }
    onOpenChange(val);
  };

  if (!user) return null;

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name || 'User')}&size=200&background=D8A11F&color=fff`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" style={{ background: '#fff', border: '2px solid #000' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#000' }}>Send Connection Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-md ring-2 ring-[#D8A11F] flex-shrink-0">
              <img src={avatarUrl} alt={user.full_name || user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: '#000' }}>{user.full_name || user.name}</p>
              <p className="text-sm" style={{ color: '#666' }}>{user.email}</p>
              {(user.title || user.occupation || user.role) && (
                <p className="text-xs mt-0.5" style={{ color: '#888' }}>{user.title || user.occupation || user.role}</p>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label style={{ color: '#000' }}>Personalized Message</Label>
              <Button
                onClick={generateAIMessage}
                disabled={generatingAI}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                style={{ borderColor: '#D8A11F', color: '#D8A11F' }}
              >
                {generatingAI ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {generatingAI ? 'Generating...' : 'Regenerate AI Draft'}
              </Button>
            </div>

            {generatingAI && !message ? (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#D8A11F' }} />
                <p className="text-sm" style={{ color: '#92400E' }}>
                  AI is crafting a personalized message based on both profiles...
                </p>
              </div>
            ) : (
              <>
                {aiGenerated && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Sparkles className="w-3 h-3" style={{ color: '#D8A11F' }} />
                    <p className="text-xs" style={{ color: '#D8A11F' }}>AI-generated draft — feel free to edit</p>
                  </div>
                )}
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd like to connect with you..."
                  rows={4}
                  className="rounded-xl"
                  style={{ borderColor: aiGenerated ? '#D8A11F' : '#ddd', color: '#000', background: '#fff' }}
                />
                <p className="text-xs mt-1.5" style={{ color: '#888' }}>
                  {message.length}/300 characters
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={() => handleClose(false)}
            variant="outline"
            className="flex-1 rounded-xl"
            style={{ borderColor: '#ddd', color: '#000' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || generatingAI}
            className="flex-1 rounded-xl gap-2"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <UserPlus className="w-4 h-4" />
            {isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}