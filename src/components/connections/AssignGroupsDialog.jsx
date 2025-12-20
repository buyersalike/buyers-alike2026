import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Check } from "lucide-react";

export default function AssignGroupsDialog({ open, onOpenChange, connection, userEmail }) {
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ['connectionGroups', userEmail],
    queryFn: () => base44.entities.ConnectionGroup.filter({ user_email: userEmail }),
    enabled: !!userEmail && open,
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Connection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      onOpenChange(false);
    },
  });

  const toggleGroup = (groupId) => {
    const currentGroups = connection.groups || [];
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter(id => id !== groupId)
      : [...currentGroups, groupId];
    
    updateConnectionMutation.mutate({
      id: connection.id,
      data: { groups: newGroups }
    });
  };

  if (!connection) return null;

  const otherUserEmail = connection.user1_email === userEmail 
    ? connection.user2_email 
    : connection.user1_email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl" style={{ color: '#E5EDFF' }}>
            <FolderOpen className="w-6 h-6" />
            Assign to Groups
          </DialogTitle>
          <p className="text-sm" style={{ color: '#7A8BA6' }}>
            {otherUserEmail.split('@')[0]}
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {groups.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#7A8BA6' }}>
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No groups created yet</p>
              <p className="text-xs mt-2">Create groups in Manage Groups</p>
            </div>
          ) : (
            groups.map((group) => {
              const isAssigned = connection.groups?.includes(group.id);
              return (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className="w-full p-4 rounded-xl flex items-center justify-between transition-all"
                  style={{
                    background: isAssigned 
                      ? 'rgba(59, 130, 246, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (isAssigned 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)')
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: group.color }}
                    />
                    <div className="text-left">
                      <p className="font-semibold" style={{ color: '#E5EDFF' }}>
                        {group.name}
                      </p>
                      {group.description && (
                        <p className="text-xs" style={{ color: '#7A8BA6' }}>
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isAssigned && (
                    <Check className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}