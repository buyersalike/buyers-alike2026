import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FolderKanban, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";

export default function Projects() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentUser?.email],
    queryFn: async () => {
      const owned = await base44.entities.ProjectSpace.filter({ owner_email: currentUser.email });
      const collaborated = await base44.entities.ProjectSpace.list();
      return [...owned, ...collaborated.filter(p => 
        p.collaborators?.includes(currentUser.email) && p.owner_email !== currentUser.email
      )];
    },
    enabled: !!currentUser,
  });

  const filteredProjects = projects.filter(project => 
    !searchQuery || 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    active: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    completed: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
    on_hold: { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBB13C', border: 'rgba(251, 191, 36, 0.3)' },
    archived: { bg: 'rgba(122, 139, 166, 0.15)', text: '#7A8BA6', border: 'rgba(122, 139, 166, 0.3)' }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#000' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#000' }}>
                Project Spaces
              </h1>
              <p style={{ color: '#000' }}>
                Collaborate on opportunities and partnerships
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-xl gap-2"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 mb-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10"
                style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
              />
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#666' }} />
              <p className="text-lg mb-2" style={{ color: '#000' }}>
                {searchQuery ? 'No projects match your search' : 'No projects yet'}
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-lg gap-2 mt-4"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => {
                const statusStyle = statusColors[project.status] || statusColors.active;
                const isOwner = project.owner_email === currentUser.email;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(createPageUrl('ProjectDetail'), { state: { projectId: project.id } })}
                    className="p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                    style={{ background: '#fff', border: '1px solid #000' }}
                  >
                    {/* Cover or Icon */}
                    <div className="mb-4">
                      {project.cover_image ? (
                        <img 
                          src={project.cover_image} 
                          alt={project.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div 
                          className="w-full h-32 rounded-lg flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
                        >
                          <FolderKanban className="w-12 h-12" style={{ color: '#E5EDFF' }} />
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold" style={{ color: '#000' }}>
                          {project.name}
                        </h3>
                        <div
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ 
                            background: statusStyle.bg, 
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`
                          }}
                        >
                          {project.status}
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: '#666' }}>
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #000' }}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: '#666' }} />
                        <span className="text-sm" style={{ color: '#000' }}>
                          {(project.collaborators?.length || 0) + 1} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: '#666' }} />
                        <span className="text-xs" style={{ color: '#000' }}>
                          {new Date(project.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        userEmail={currentUser.email}
      />
    </div>
  );
}