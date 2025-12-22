import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

export default function SendRequestDialog({ open, onOpenChange, user, onSend, isPending }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onSend(message);
    setMessage("");
  };

  if (!user) return null;

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&size=200&background=D8A11F&color=fff`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" style={{ background: '#fff', border: '2px solid #000' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#000' }}>Send Connection Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ring-[#D8A11F]">
              <img src={avatarUrl} alt={user.full_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: '#000' }}>{user.full_name}</p>
              <p className="text-sm" style={{ color: '#666' }}>{user.email}</p>
              {user.occupation && (
                <p className="text-sm" style={{ color: '#888' }}>{user.occupation}</p>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <Label className="mb-2" style={{ color: '#000' }}>
              Add a personal message (optional)
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to connect with you..."
              rows={4}
              className="mt-2 rounded-xl"
              style={{ 
                borderColor: '#ddd',
                color: '#000',
                background: '#fff'
              }}
            />
            <p className="text-xs mt-2" style={{ color: '#888' }}>
              {message.length}/300 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 rounded-xl"
            style={{ borderColor: '#ddd', color: '#000' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending}
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