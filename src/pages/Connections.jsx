import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, FolderOpen, StickyNote, X, Check, UserX, GitBranch } from "lucide-react";
import ManageGroupsDialog from "@/components/connections/ManageGroupsDialog";
import AssignGroupsDialog from "@/components/connections/AssignGroupsDialog";
import ConnectionNotesDialog from "@/components/connections/ConnectionNotesDialog";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Connections() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [showGroupsDialog, setShowGroupsDialog] = useState(false);
  const [assigningConnection, setAssigningConnection] = useState(null);
  const [notesConnection, setNotesConnection] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', currentUser?.email],
    queryFn: async () => {
      const conn1 = await base44.entities.Connection.filter({ user1_email: currentUser.email, status: 'connected' });
      const conn2 = await base44.entities.Connection.filter({ user2_email: currentUser.email, status: 'connected' });
      return [...conn1, ...conn2];
    },
    enabled: !!currentUser,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['connectionGroups', currentUser?.email],
    queryFn: () => base44.entities.ConnectionGroup.filter({ user_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!currentUser,
  });

  const removeConnectionMutation = useMutation({
    mutationFn: (id) => base44.entities.Connection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const filteredConnections = connections.filter(conn => {
    const otherUserEmail = conn.user1_email === currentUser?.email ? conn.user2_email : conn.user1_email;
    const otherUser = allUsers.find(u => u.email === otherUserEmail);
    
    const matchesSearch = !searchQuery || 
      otherUserEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === "all" || 
      (conn.groups && conn.groups.includes(selectedGroup));

    return matchesSearch && matchesGroup;
  });

  const handleRemoveConnection = (connection) => {
    if (confirm('Remove this connection?')) {
      removeConnectionMutation.mutate(connection.id);
    }
  };

  // Calculate mutual connections for a specific connection
  const getMutualConnections = (connection) => {
    const otherUserEmail = connection.user1_email === currentUser?.email 
      ? connection.user2_email 
      : connection.user1_email;

    // Get my connections
    const myConnections = connections
      .filter(c => c.status === 'connected')
      .map(c => c.user1_email === currentUser?.email ? c.user2_email : c.user1_email);

    // Get their connections
    const theirConnections = connections
      .filter(c => 
        (c.user1_email === otherUserEmail || c.user2_email === otherUserEmail) && 
        c.status === 'connected'
      )
      .map(c => c.user1_email === otherUserEmail ? c.user2_email : c.user1_email);

    // Find mutual connections
    const mutualEmails = myConnections.filter(email => 
      theirConnections.includes(email) && 
      email !== currentUser?.email && 
      email !== otherUserEmail
    );

    return allUsers.filter(u => mutualEmails.includes(u.email));
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#E5EDFF' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
                  My Connections
                </h1>
                <p style={{ color: '#B6C4E0' }}>
                  {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                onClick={() => setShowGroupsDialog(true)}
                className="rounded-xl gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
              >
                <FolderOpen className="w-5 h-5" />
                Manage Groups
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Search Connections
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="glass-input pl-10"
                    style={{ color: '#E5EDFF' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Filter by Group
                </label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                    <SelectValue placeholder="All Connections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Connections</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: group.color }} />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Connections Grid */}
          {filteredConnections.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#7A8BA6' }} />
              <p className="text-lg" style={{ color: '#7A8BA6' }}>
                {searchQuery || selectedGroup !== "all" ? 'No connections match your filters' : 'No connections yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((connection, index) => {
                const otherUserEmail = connection.user1_email === currentUser.email 
                  ? connection.user2_email 
                  : connection.user1_email;
                const otherUser = allUsers.find(u => u.email === otherUserEmail);
                const connectionGroups = groups.filter(g => connection.groups?.includes(g.id));
                const mutualConnections = getMutualConnections(connection);

                return (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6 rounded-2xl"
                  >
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
                      >
                        {(otherUser?.full_name || otherUserEmail).charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#E5EDFF' }}>
                        {otherUser?.full_name || otherUserEmail.split('@')[0]}
                      </h3>
                      <p className="text-sm" style={{ color: '#7A8BA6' }}>
                        {otherUserEmail}
                      </p>
                      {otherUser?.title && (
                        <p className="text-sm mt-1" style={{ color: '#B6C4E0' }}>
                          {otherUser.title}
                        </p>
                      )}
                    </div>

                    {/* Groups & Mutual Connections */}
                    <div className="flex flex-col gap-2 mb-4">
                      {connectionGroups.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {connectionGroups.map(group => (
                            <div
                              key={group.id}
                              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                              style={{ background: group.color + '20', color: group.color }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                              {group.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {mutualConnections.length > 0 && (
                        <div className="text-center">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs gap-1"
                                style={{ color: '#3B82F6' }}
                              >
                                <GitBranch className="w-3 h-3" />
                                {mutualConnections.length} mutual connection{mutualConnections.length !== 1 ? 's' : ''}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" style={{ background: '#fff', border: '1px solid #ddd' }}>
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm mb-3" style={{ color: '#000' }}>
                                  Mutual Connections
                                </h4>
                                {mutualConnections.slice(0, 5).map(mutual => {
                                  const mutualAvatar = mutual.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mutual.full_name)}&size=100&background=3B82F6&color=fff`;
                                  return (
                                    <Link 
                                      key={mutual.email}
                                      to={createPageUrl('Profile') + `?email=${mutual.email}`}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-200">
                                        <img src={mutualAvatar} alt={mutual.full_name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate" style={{ color: '#000' }}>
                                          {mutual.full_name}
                                        </p>
                                        {mutual.occupation && (
                                          <p className="text-xs truncate" style={{ color: '#666' }}>
                                            {mutual.occupation}
                                          </p>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                                {mutualConnections.length > 5 && (
                                  <p className="text-xs text-center pt-2" style={{ color: '#888', borderTop: '1px solid #E5E7EB' }}>
                                    +{mutualConnections.length - 5} more mutual connections
                                  </p>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setAssigningConnection(connection)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg gap-1"
                        style={{ color: '#3B82F6', borderColor: '#3B82F6' }}
                      >
                        <FolderOpen className="w-4 h-4" />
                        Groups
                      </Button>
                      <Button
                        onClick={() => setNotesConnection(connection)}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg gap-1"
                        style={{ color: '#FBB13C', borderColor: '#FBB13C' }}
                      >
                        <StickyNote className="w-4 h-4" />
                        Notes
                      </Button>
                      <Button
                        onClick={() => handleRemoveConnection(connection)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        style={{ color: '#EF4444', borderColor: '#EF4444' }}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <ManageGroupsDialog
        open={showGroupsDialog}
        onOpenChange={setShowGroupsDialog}
        userEmail={currentUser.email}
      />
      <AssignGroupsDialog
        open={!!assigningConnection}
        onOpenChange={(open) => !open && setAssigningConnection(null)}
        connection={assigningConnection}
        userEmail={currentUser.email}
      />
      <ConnectionNotesDialog
        open={!!notesConnection}
        onOpenChange={(open) => !open && setNotesConnection(null)}
        connection={notesConnection}
        userEmail={currentUser.email}
      />
    </div>
  );
}