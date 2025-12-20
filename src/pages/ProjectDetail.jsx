import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, CheckSquare, Upload, Users, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProjectMessages from "@/components/projects/ProjectMessages";
import ProjectTasks from "@/components/projects/ProjectTasks";
import ProjectFiles from "@/components/projects/ProjectFiles";
import ProjectSettings from "@/components/projects/ProjectSettings";

export default function ProjectDetail() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.ProjectSpace.filter({ id: projectId }).then(p => p[0]),
    enabled: !!projectId,
  });

  if (!currentUser || !project) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#E5EDFF' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const isOwner = project.owner_email === currentUser.email;
  const isCollaborator = project.collaborators?.includes(currentUser.email);
  const hasAccess = isOwner || isCollaborator;

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4" style={{ color: '#E5EDFF' }}>Access Denied</p>
            <Button onClick={() => navigate(createPageUrl('Projects'))}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => navigate(createPageUrl('Projects'))}
              variant="ghost"
              className="mb-4 gap-2"
              style={{ color: '#B6C4E0' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
            <div className="glass-card p-6 rounded-2xl">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ color: '#B6C4E0' }}>{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: '#7A8BA6' }} />
                  <span className="text-sm" style={{ color: '#7A8BA6' }}>
                    {(project.collaborators?.length || 0) + 1} members
                  </span>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}
                >
                  {project.status}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="messages" className="space-y-6">
            <TabsList className="glass-card p-1">
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-2">
                <Upload className="w-4 h-4" />
                Files
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="messages">
              <ProjectMessages project={project} currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="tasks">
              <ProjectTasks project={project} currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="files">
              <ProjectFiles project={project} currentUser={currentUser} />
            </TabsContent>

            {isOwner && (
              <TabsContent value="settings">
                <ProjectSettings project={project} currentUser={currentUser} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}