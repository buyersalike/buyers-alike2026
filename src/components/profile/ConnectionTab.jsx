import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User, Users, UserPlus, UserMinus, Check, X, Sparkles, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import SendRequestDialog from "@/components/connections/SendRequestDialog";
import SuggestedConnections from "@/components/connections/SuggestedConnections";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ConnectionTab({ userEmail, isOwnProfile }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [searchQueries, setSearchQueries] = useState({ connections: '', requests: '', requested: '', find: '' });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ['connections-data'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getConnectionsData', {});
      return res.data;
    },
  });

  const connections = connectionsData?.connections || [];
  const users = connectionsData?.users || [];

  const { data: aiRecommendations } = useQuery({
    queryKey: ['ai-recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('getPersonalizedRecommendations');
      return response.data;
    },
    enabled: isOwnProfile,
  });

  // My Connections (connected status)
  const myConnections = connections.filter(
    c => (c.user1_email === userEmail || c.user2_email === userEmail) && c.status === 'connected'
  );

  // Connection Requests (incoming - pending, where I'm user2) — deduplicate by sender
  const incomingRequestsRaw = connections.filter(
    c => c.user2_email === userEmail && c.status === 'pending'
  );
  const seenIncoming = new Set();
  const incomingRequests = incomingRequestsRaw.filter(c => {
    if (seenIncoming.has(c.user1_email)) return false;
    seenIncoming.add(c.user1_email);
    return true;
  });

  // Requested Connections (outgoing - pending, where I'm user1) — deduplicate by recipient
  const outgoingRequestsRaw = connections.filter(
    c => c.user1_email === userEmail && c.status === 'pending'
  );
  const seenOutgoing = new Set();
  const outgoingRequests = outgoingRequestsRaw.filter(c => {
    if (seenOutgoing.has(c.user2_email)) return false;
    seenOutgoing.add(c.user2_email);
    return true;
  });

  const connectedUsers = myConnections.map(c => {
    const connectedEmail = c.user1_email === userEmail ? c.user2_email : c.user1_email;
    const user = users.find(u => u.email === connectedEmail);
    if (!user) {
      // Fallback: show connection with minimal data if user not found
      return {
        email: connectedEmail,
        full_name: connectedEmail.split('@')[0],
        connectionId: c.id
      };
    }
    return { ...user, connectionId: c.id };
  });

  const requestingUsers = incomingRequests.map(c => {
    const user = users.find(u => u.email === c.user1_email);
    if (!user) {
      // Fallback: show connection with minimal data if user not found
      return {
        email: c.user1_email,
        full_name: c.user1_email.split('@')[0],
        connectionId: c.id
      };
    }
    return { ...user, connectionId: c.id };
  });

  const requestedUsers = outgoingRequests.map(c => {
    const user = users.find(u => u.email === c.user2_email);
    if (!user) {
      // Fallback: show connection with minimal data if user not found
      return {
        email: c.user2_email,
        full_name: c.user2_email.split('@')[0],
        connectionId: c.id
      };
    }
    return { ...user, connectionId: c.id };
  });

  // Find potential connections (excluding already connected or pending)
  const allConnectionEmails = connections
    .filter(c => c.user1_email === userEmail || c.user2_email === userEmail)
    .map(c => c.user1_email === userEmail ? c.user2_email : c.user1_email);
  
  const potentialConnections = users.filter(
    u => u.email !== userEmail && !allConnectionEmails.includes(u.email)
  );

  // Mutations
  const acceptRequestMutation = useMutation({
    mutationFn: async ({ connectionId, senderEmail, senderName }) => {
      await base44.entities.Connection.update(connectionId, { status: 'connected' });
      // Create notification for the sender
      await base44.entities.Notification.create({
        recipient_email: senderEmail,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${currentUser?.full_name || 'Someone'} accepted your connection request`,
        sender_email: currentUser?.email,
        sender_name: currentUser?.full_name,
        link: createPageUrl('Profile') + `?email=${currentUser?.email}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: async ({ targetEmail, targetName, message }) => {
      // Check for existing connection/request to prevent duplicates
      const existing = connections.find(c =>
        (c.user1_email === currentUser.email && c.user2_email === targetEmail) ||
        (c.user1_email === targetEmail && c.user2_email === currentUser.email)
      );
      if (existing) throw new Error('A connection or request already exists with this user.');

      await base44.entities.Connection.create({
        user1_email: currentUser.email,
        user2_email: targetEmail,
        status: 'pending',
        message: message || undefined
      });
      await base44.entities.Notification.create({
        recipient_email: targetEmail,
        type: 'connection_request',
        title: 'New Connection Request',
        message: message 
          ? `${currentUser.full_name} sent you a connection request: "${message}"`
          : `${currentUser.full_name} sent you a connection request`,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        link: createPageUrl('Profile') + `?email=${currentUser.email}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
      setSelectedUser(null);
    },
  });

  const UserCard = ({ user, actionType, connectionMessage }) => {
    const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&size=200&background=D8A11F&color=fff`;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        className="p-6 rounded-2xl group"
        style={{ border: '1px solid #ddd', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-start gap-4 mb-4">
          <Link to={createPageUrl('Profile') + `?email=${user.email}`} className="flex-shrink-0">
            <div 
              className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-2 ring-[#D8A11F]"
            >
              <img src={avatarUrl} alt={user.full_name} className="w-full h-full object-cover" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={createPageUrl('Profile') + `?email=${user.email}`}>
              <p className="font-bold text-xl truncate hover:underline mb-1" style={{ color: '#000' }}>{user.full_name}</p>
            </Link>
            {user.occupation && (
              <p className="text-sm truncate mb-1" style={{ color: '#666' }}>
                <span className="font-semibold">Occupation:</span> {user.occupation}
              </p>
            )}
            {user.business_name && (
              <p className="text-sm truncate mb-1" style={{ color: '#666' }}>
                <span className="font-semibold">Business:</span> {user.business_name}
              </p>
            )}
            {connectionMessage && actionType === 'accept-reject' && (
              <div className="mt-2 p-3 rounded-lg" style={{ background: '#F0F9FF', border: '1px solid #BFDBFE' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#1E40AF' }}>
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Message:
                </p>
                <p className="text-sm" style={{ color: '#1E3A8A' }}>{connectionMessage}</p>
              </div>
            )}
            {user.overview && !connectionMessage && (
              <p className="text-xs mt-2 line-clamp-2" style={{ color: '#888' }}>
                {user.overview}
              </p>
            )}
          </div>
        </div>

      {actionType === 'disconnect' && isOwnProfile && (
        <Button
          onClick={() => disconnectMutation.mutate(user.connectionId)}
          variant="outline"
          className="w-full rounded-xl font-semibold transition-all"
          style={{ borderColor: '#EF4444', color: '#EF4444' }}
          disabled={disconnectMutation.isPending}
        >
          <UserMinus className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      )}

      {actionType === 'accept-reject' && isOwnProfile && (
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => acceptRequestMutation.mutate({ 
              connectionId: user.connectionId, 
              senderEmail: user.email, 
              senderName: user.full_name 
            })}
            className="flex-1 rounded-xl font-bold py-3 transition-all hover:scale-105"
            style={{ background: '#22C55E', color: '#fff' }}
            disabled={acceptRequestMutation.isPending}
          >
            <Check className="w-5 h-5 mr-2" />
            {acceptRequestMutation.isPending ? 'Accepting...' : 'Accept'}
          </Button>
          <Button
            onClick={() => rejectRequestMutation.mutate(user.connectionId)}
            variant="outline"
            className="flex-1 rounded-xl font-bold py-3 transition-all hover:scale-105"
            style={{ borderColor: '#EF4444', color: '#EF4444', borderWidth: '2px' }}
            disabled={rejectRequestMutation.isPending}
          >
            <X className="w-5 h-5 mr-2" />
            {rejectRequestMutation.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )}

      {actionType === 'cancel' && isOwnProfile && (
        <Button
          onClick={() => cancelRequestMutation.mutate(user.connectionId)}
          variant="outline"
          className="w-full rounded-xl font-semibold"
          style={{ borderColor: '#7A8BA6', color: '#7A8BA6' }}
          disabled={cancelRequestMutation.isPending}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel Request
        </Button>
      )}

      {actionType === 'connect' && isOwnProfile && currentUser && (
        <Button
          onClick={() => setSelectedUser(user)}
          disabled={sendRequestMutation.isPending}
          className="w-full rounded-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      )}
      </motion.div>
      );
      };

  const filterUsers = (userList, query) => {
    if (!query.trim()) return userList;
    const q = query.toLowerCase();
    return userList.filter(u =>
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.occupation || '').toLowerCase().includes(q) ||
      (u.business_name || '').toLowerCase().includes(q)
    );
  };

  const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search by name, email, occupation..."}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#D8A11F]/50"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#000' }}
      />
    </div>
  );

  const EmptyState = ({ icon: Icon, message }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg" 
        style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <Icon className="w-10 h-10" style={{ color: '#3B82F6' }} />
      </div>
      <p className="text-lg font-medium" style={{ color: '#B6C4E0' }}>{message}</p>
    </motion.div>
  );

  return (
    <>
      {isOwnProfile && <SuggestedConnections userEmail={userEmail} />}
      
      <div className="p-8 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
        <Tabs defaultValue="my-connections" className="w-full">
        <TabsList className="mb-8 p-2 rounded-2xl" style={{ background: '#F2F1F5', border: '1px solid #000' }}>
          <TabsTrigger 
            value="my-connections" 
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" 
            style={{ color: '#000' }}
          >
            My Connections
            {connectedUsers.length > 0 && (
              <Badge className="ml-2 px-2 py-0.5" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                {connectedUsers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="requests" 
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" 
            style={{ color: '#000' }}
          >
            Connection Requests
            {incomingRequests.length > 0 && (
              <Badge className="ml-2 px-2 py-0.5" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="requested" 
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" 
            style={{ color: '#000' }}
          >
            Requested Connections
            {outgoingRequests.length > 0 && (
              <Badge className="ml-2 px-2 py-0.5" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#7C3AED' }}>
                {outgoingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="find" 
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" 
            style={{ color: '#000' }}
          >
            Find Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-connections" className="mt-6">
          {connectedUsers.length === 0 ? (
            <EmptyState icon={Users} message="No connections yet" />
          ) : (
            <>
              <SearchInput
                value={searchQueries.connections}
                onChange={(v) => setSearchQueries(prev => ({ ...prev, connections: v }))}
                placeholder="Search connections..."
              />
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {filterUsers(connectedUsers, searchQueries.connections).length} of {connectedUsers.length} {connectedUsers.length === 1 ? 'Connection' : 'Connections'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filterUsers(connectedUsers, searchQueries.connections).map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard user={user} actionType="disconnect" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3B82F6' }}></div>
            </div>
          ) : requestingUsers.length === 0 ? (
            <EmptyState icon={UserPlus} message="No connection requests" />
          ) : (
            <>
              <SearchInput
                value={searchQueries.requests}
                onChange={(v) => setSearchQueries(prev => ({ ...prev, requests: v }))}
                placeholder="Search requests..."
              />
              <div className="mb-6 px-1">
                <p className="text-lg font-bold" style={{ color: '#000' }}>
                  {filterUsers(requestingUsers, searchQueries.requests).length} of {requestingUsers.length} Pending {requestingUsers.length === 1 ? 'Request' : 'Requests'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filterUsers(requestingUsers, searchQueries.requests).map((user, index) => {
                    const connection = incomingRequests.find(c => c.user1_email === user.email);
                    return (
                      <motion.div
                        key={user.email}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <UserCard 
                          user={user} 
                          actionType="accept-reject" 
                          connectionMessage={connection?.message}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="requested" className="mt-6">
          {requestedUsers.length === 0 ? (
            <EmptyState icon={UserMinus} message="No pending requests sent" />
          ) : (
            <>
              <SearchInput
                value={searchQueries.requested}
                onChange={(v) => setSearchQueries(prev => ({ ...prev, requested: v }))}
                placeholder="Search requested connections..."
              />
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {filterUsers(requestedUsers, searchQueries.requested).length} of {requestedUsers.length} Pending {requestedUsers.length === 1 ? 'Request' : 'Requests'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filterUsers(requestedUsers, searchQueries.requested).map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard user={user} actionType="cancel" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="find" className="mt-6">
          {aiRecommendations?.recommendations?.connections && aiRecommendations.recommendations.connections.length > 0 && (
            <div className="glass-card p-6 rounded-2xl mb-6" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" style={{ color: '#7C3AED' }} />
                <h3 className="text-lg font-bold" style={{ color: '#E5EDFF' }}>AI Recommended Connection Types</h3>
              </div>
              <div className="space-y-3">
                {aiRecommendations.recommendations.connections.slice(0, 3).map((conn, idx) => (
                  <div key={idx} className="p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                    <p className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>{conn.profileType}</p>
                    <p className="text-sm" style={{ color: '#B6C4E0' }}>{conn.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {potentialConnections.length === 0 ? (
            <EmptyState icon={Users} message="No new connections to discover" />
          ) : (
            <>
              <SearchInput
                value={searchQueries.find}
                onChange={(v) => setSearchQueries(prev => ({ ...prev, find: v }))}
                placeholder="Search people to connect with..."
              />
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {filterUsers(potentialConnections, searchQueries.find).length} of {potentialConnections.length} {potentialConnections.length === 1 ? 'Person' : 'People'} to Connect With
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filterUsers(potentialConnections, searchQueries.find).slice(0, 12).map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard user={user} actionType="connect" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>

      <SendRequestDialog
      open={!!selectedUser}
      onOpenChange={(open) => !open && setSelectedUser(null)}
      user={selectedUser}
      onSend={(message) => sendRequestMutation.mutate({ 
        targetEmail: selectedUser.email, 
        targetName: selectedUser.full_name,
        message 
      })}
      isPending={sendRequestMutation.isPending}
      />
      </>
      );
      }