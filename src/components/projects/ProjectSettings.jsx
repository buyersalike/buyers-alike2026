import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { UserPlus, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProjectSettings({ project, currentUser }) {
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectSpace.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectSpace.delete(id),
    onSuccess: () => {
      navigate(createPageUrl('Projects'));
    },
  });

  const addCollaborator = () => {
    if (!newCollaboratorEmail || !allUsers.find(u => u.email === newCollaboratorEmail)) {
      alert('Invalid email address');
      return;
    }
    if (project.collaborators?.includes(newCollaboratorEmail)) {
      alert('User is already a collaborator');
      return;
    }
    updateProjectMutation.mutate({
      id: project.id,
      data: {
        collaborators: [...(project.collaborators || []), newCollaboratorEmail]
      }
    });
    setNewCollaboratorEmail("");
  };

  const removeCollaborator = (email) => {
    updateProjectMutation.mutate({
      id: project.id,
      data: {
        collaborators: (project.collaborators || []).filter(e => e !== email)
      }
    });
  };

  const updateStatus = (status) => {
    updateProjectMutation.mutate({
      id: project.id,
      data: { status }
    });
  };

  return (
    <div className="space-y-6">
      {/* Collaborators */}
      <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>
          Collaborators
        </h3>
        <div className="flex gap-3 mb-4">
          <Input
            value={newCollaboratorEmail}
            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1"
            style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
          />
          <Button
            onClick={addCollaborator}
            className="rounded-lg gap-2"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <UserPlus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {/* Owner */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F2F1F5' }}>
            <div>
              <p className="font-medium" style={{ color: '#000' }}>
                {allUsers.find(u => u.email === project.owner_email)?.full_name || project.owner_email}
              </p>
              <p className="text-xs" style={{ color: '#666' }}>Owner</p>
            </div>
          </div>
          {/* Collaborators */}
          {(project.collaborators || []).map((email) => (
            <div key={email} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F2F1F5' }}>
              <div>
                <p className="font-medium" style={{ color: '#000' }}>
                  {allUsers.find(u => u.email === email)?.full_name || email}
                </p>
                <p className="text-xs" style={{ color: '#666' }}>Collaborator</p>
              </div>
              <Button
                onClick={() => removeCollaborator(email)}
                variant="ghost"
                size="icon"
                className="rounded-lg"
                style={{ color: '#EF4444' }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status */}
      <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>
          Project Status
        </h3>
        <Select value={project.status} onValueChange={updateStatus}>
          <SelectTrigger style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '2px solid #EF4444' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#EF4444' }}>
          Danger Zone
        </h3>
        <p className="text-sm mb-4" style={{ color: '#666' }}>
          Once you delete this project, there is no going back. All messages, tasks, and files will be permanently deleted.
        </p>
        <Button
          onClick={() => {
            if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
              deleteProjectMutation.mutate(project.id);
            }
          }}
          className="rounded-lg gap-2"
          style={{ background: '#EF4444', color: '#fff' }}
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </Button>
      </div>
    </div>
  );
}