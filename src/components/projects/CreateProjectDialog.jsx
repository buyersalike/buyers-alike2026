import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FolderKanban } from "lucide-react";

export default function CreateProjectDialog({ open, onOpenChange, userEmail }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    related_type: "general",
    status: "active"
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectSpace.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setFormData({ name: "", description: "", related_type: "general", status: "active" });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      owner_email: userEmail,
      collaborators: []
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <FolderKanban className="w-6 h-6" />
            Create Project Space
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Project Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input h-24"
              style={{ color: '#E5EDFF' }}
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Project Type
            </label>
            <Select 
              value={formData.related_type} 
              onValueChange={(value) => setFormData({ ...formData, related_type: value })}
            >
              <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Project</SelectItem>
                <SelectItem value="opportunity">Opportunity Related</SelectItem>
                <SelectItem value="partnership">Partnership Related</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
            >
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}