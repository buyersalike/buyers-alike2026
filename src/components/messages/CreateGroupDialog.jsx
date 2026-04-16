import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User } from "lucide-react";

export default function CreateGroupDialog({ open, onOpenChange, currentUser }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "general",
    members: []
  });
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupChat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
      onOpenChange(false);
      setFormData({ name: "", description: "", type: "general", members: [] });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.members.length === 0) return;
    
    createGroupMutation.mutate({
      ...formData,
      creator_email: currentUser.email,
      members: [...formData.members, currentUser.email] // Include creator
    });
  };

  const toggleMember = (email) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(email)
        ? prev.members.filter(m => m !== email)
        : [...prev.members, email]
    }));
  };

  const availableUsers = users.filter(u => u.email !== currentUser?.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: '#F2F1F5', border: '1px solid #000' }} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#000' }}>Create Group Chat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label style={{ color: '#000' }}>Group Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Project Alpha Team"
              className="mt-2"
              style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
            />
          </div>

          <div>
            <Label style={{ color: '#000' }}>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this group about?"
              className="mt-2"
              style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
              rows={2}
            />
          </div>

          <div>
            <Label style={{ color: '#000' }}>Group Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="mt-2" style={{ color: '#000', background: '#fff', border: '1px solid #000' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Discussion</SelectItem>
                <SelectItem value="project">Project Collaboration</SelectItem>
                <SelectItem value="event">Event Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label style={{ color: '#000' }}>Add Members *</Label>
            <div className="mt-2 max-h-60 overflow-y-auto p-3 rounded-xl" style={{ background: '#fff', border: '1px solid #000' }}>
              {availableUsers.length > 0 ? (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div 
                      key={user.email}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                      style={{ background: '#F9FAFB' }}
                      onClick={() => toggleMember(user.email)}
                    >
                      <Checkbox
                        checked={formData.members.includes(user.email)}
                        onCheckedChange={() => toggleMember(user.email)}
                      />
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#D8A11F' }}
                      >
                        <User className="w-4 h-4" style={{ color: '#fff' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#000' }}>{user.full_name}</p>
                        <p className="text-xs" style={{ color: '#666' }}>{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: '#666' }}>
                  No members available yet.
                </p>
              )}
            </div>
            {formData.members.length > 0 && (
              <p className="text-xs mt-2" style={{ color: '#666' }}>
                {formData.members.length} member{formData.members.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || formData.members.length === 0 || createGroupMutation.isPending}
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}