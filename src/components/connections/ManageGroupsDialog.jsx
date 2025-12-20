import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, FolderOpen, Pencil, Trash2, X } from "lucide-react";

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', 
  '#7C3AED', '#EC4899', '#06B6D4', '#84CC16'
];

export default function ManageGroupsDialog({ open, onOpenChange, userEmail }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0]
  });
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ['connectionGroups', userEmail],
    queryFn: () => base44.entities.ConnectionGroup.filter({ user_email: userEmail }),
    enabled: !!userEmail && open,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.ConnectionGroup.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionGroups'] });
      resetForm();
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConnectionGroup.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionGroups'] });
      resetForm();
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => base44.entities.ConnectionGroup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionGroups'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGroup) {
      updateGroupMutation.mutate({ 
        id: editingGroup.id, 
        data: formData 
      });
    } else {
      createGroupMutation.mutate({
        ...formData,
        user_email: userEmail
      });
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      color: group.color || PRESET_COLORS[0]
    });
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: PRESET_COLORS[0] });
    setIsCreating(false);
    setEditingGroup(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <FolderOpen className="w-6 h-6" />
            Manage Connection Groups
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {!isCreating ? (
            <>
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
              >
                <Plus className="w-5 h-5" />
                Create New Group
              </Button>

              <div className="space-y-3">
                {groups.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#7A8BA6' }}>
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No groups created yet</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 rounded-xl flex items-start justify-between"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                          style={{ background: group.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>
                            {group.name}
                          </h3>
                          {group.description && (
                            <p className="text-sm" style={{ color: '#B6C4E0' }}>
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          onClick={() => handleEdit(group)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          style={{ color: '#3B82F6' }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Delete this group? Connections will not be deleted.')) {
                              deleteGroupMutation.mutate(group.id);
                            }
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Group Name *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                  placeholder="e.g., Mentors, Investors, Potential Partners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input h-20"
                  style={{ color: '#E5EDFF' }}
                  placeholder="Optional description for this group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Color Tag
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-10 h-10 rounded-lg transition-all"
                      style={{
                        background: color,
                        border: formData.color === color ? '3px solid #E5EDFF' : '2px solid transparent',
                        transform: formData.color === color ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                  className="flex-1 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
                >
                  {editingGroup ? 'Update' : 'Create'} Group
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}