import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { User, Users, UserPlus, UserMinus, Check, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectionTab({ userEmail, isOwnProfile }) {
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.Connection.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

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

  // Connection Requests (incoming - pending, where I'm user2)
  const incomingRequests = connections.filter(
    c => c.user2_email === userEmail && c.status === 'pending'
  );

  // Requested Connections (outgoing - pending, where I'm user1)
  const outgoingRequests = connections.filter(
    c => c.user1_email === userEmail && c.status === 'pending'
  );

  const connectedUsers = myConnections.map(c => {
    const connectedEmail = c.user1_email === userEmail ? c.user2_email : c.user1_email;
    return { ...users.find(u => u.email === connectedEmail), connectionId: c.id };
  }).filter(u => u.email);

  const requestingUsers = incomingRequests.map(c => ({
    ...users.find(u => u.email === c.user1_email),
    connectionId: c.id
  })).filter(u => u.email);

  const requestedUsers = outgoingRequests.map(c => ({
    ...users.find(u => u.email === c.user2_email),
    connectionId: c.id
  })).filter(u => u.email);

  // Find potential connections (excluding already connected or pending)
  const allConnectionEmails = connections
    .filter(c => c.user1_email === userEmail || c.user2_email === userEmail)
    .map(c => c.user1_email === userEmail ? c.user2_email : c.user1_email);
  
  const potentialConnections = users.filter(
    u => u.email !== userEmail && !allConnectionEmails.includes(u.email)
  );

  // Mutations
  const acceptRequestMutation = useMutation({
    mutationFn: (connectionId) => 
      base44.entities.Connection.update(connectionId, { status: 'connected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.Connection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (targetEmail) => 
      base44.entities.Connection.create({
        user1_email: currentUser.email,
        user2_email: targetEmail,
        status: 'pending'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const UserCard = ({ user, actionType }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 rounded-2xl group"
      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Link to={createPageUrl('Profile') + `?email=${user.email}`} className="flex-shrink-0">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shadow-md"
            style={{ background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7" style={{ color: '#E5EDFF' }} />
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl('Profile') + `?email=${user.email}`}>
            <p className="font-bold text-lg truncate hover:underline" style={{ color: '#E5EDFF' }}>{user.full_name}</p>
          </Link>
          {user.title && (
            <p className="text-sm truncate" style={{ color: '#B6C4E0' }}>{user.title}</p>
          )}
          {user.location && (
            <p className="text-xs truncate mt-1" style={{ color: '#7A8BA6' }}>{user.location}</p>
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
        <div className="flex gap-2">
          <Button
            onClick={() => acceptRequestMutation.mutate(user.connectionId)}
            className="flex-1 rounded-xl font-semibold"
            style={{ background: '#22C55E', color: '#fff' }}
            disabled={acceptRequestMutation.isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={() => rejectRequestMutation.mutate(user.connectionId)}
            variant="outline"
            className="flex-1 rounded-xl font-semibold"
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
            disabled={rejectRequestMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
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
          onClick={() => sendRequestMutation.mutate(user.email)}
          className="w-full rounded-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
          disabled={sendRequestMutation.isPending}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      )}
    </motion.div>
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
    <div className="glass-card p-8">
      <Tabs defaultValue="my-connections" className="w-full">
        <TabsList className="glass-card mb-8 p-2 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <TabsTrigger 
            value="my-connections" 
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white" 
            style={{ color: '#B6C4E0' }}
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
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white" 
            style={{ color: '#B6C4E0' }}
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
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white" 
            style={{ color: '#B6C4E0' }}
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
            className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:shadow-lg data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white" 
            style={{ color: '#B6C4E0' }}
          >
            Find Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-connections" className="mt-6">
          {connectedUsers.length === 0 ? (
            <EmptyState icon={Users} message="No connections yet" />
          ) : (
            <>
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {connectedUsers.length} {connectedUsers.length === 1 ? 'Connection' : 'Connections'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {connectedUsers.map((user, index) => (
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
          {requestingUsers.length === 0 ? (
            <EmptyState icon={UserPlus} message="No connection requests" />
          ) : (
            <>
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {requestingUsers.length} Pending {requestingUsers.length === 1 ? 'Request' : 'Requests'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {requestingUsers.map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard user={user} actionType="accept-reject" />
                    </motion.div>
                  ))}
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
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {requestedUsers.length} Pending {requestedUsers.length === 1 ? 'Request' : 'Requests'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {requestedUsers.map((user, index) => (
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
              <div className="mb-4 px-1">
                <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                  {potentialConnections.length} {potentialConnections.length === 1 ? 'Person' : 'People'} to Connect With
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {potentialConnections.slice(0, 12).map((user, index) => (
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
  );
}