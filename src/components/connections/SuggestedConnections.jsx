import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import SendRequestDialog from "./SendRequestDialog";

export default function SuggestedConnections({ userEmail }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.Connection.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: userInterests = [] } = useQuery({
    queryKey: ['userInterests', userEmail],
    queryFn: () => base44.entities.Interest.filter({ user_email: userEmail, status: 'approved' }),
  });

  const { data: allInterests = [] } = useQuery({
    queryKey: ['allInterests'],
    queryFn: () => base44.entities.Interest.filter({ status: 'approved' }),
  });

  // Get all connection emails
  const allConnectionEmails = connections
    .filter(c => c.user1_email === userEmail || c.user2_email === userEmail)
    .map(c => c.user1_email === userEmail ? c.user2_email : c.user1_email);

  // Get potential connections (not connected, not self)
  const potentialConnections = users.filter(
    u => u.email !== userEmail && !allConnectionEmails.includes(u.email)
  );

  // Calculate match scores based on shared interests
  const userInterestNames = userInterests.map(i => i.interest_name.toLowerCase());
  const suggestedUsers = potentialConnections.map(user => {
    const theirInterests = allInterests
      .filter(i => i.user_email === user.email)
      .map(i => i.interest_name.toLowerCase());
    
    const sharedInterests = userInterestNames.filter(interest => 
      theirInterests.includes(interest)
    );

    return {
      ...user,
      sharedInterests,
      matchScore: sharedInterests.length
    };
  })
  .filter(u => u.matchScore > 0)
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 6);

  const sendRequestMutation = useMutation({
    mutationFn: async ({ targetEmail, targetName, message }) => {
      await base44.entities.Connection.create({
        user1_email: userEmail,
        user2_email: targetEmail,
        status: 'pending',
        message: message || undefined
      });
      await base44.entities.Notification.create({
        recipient_email: targetEmail,
        type: 'connection_request',
        title: 'New Connection Request',
        message: message 
          ? `${selectedUser?.full_name} sent you a connection request: "${message}"`
          : `${selectedUser?.full_name} sent you a connection request`,
        sender_email: userEmail,
        link: createPageUrl('Profile') + `?email=${userEmail}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setSelectedUser(null);
    },
  });

  if (suggestedUsers.length === 0) return null;

  return (
    <>
      <div className="mb-8 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #3B82F6' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: '#000' }}>Suggested Connections</h3>
            <p className="text-sm" style={{ color: '#666' }}>People you might know based on shared interests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedUsers.map((user, index) => {
            const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&size=200&background=3B82F6&color=fff`;
            
            return (
              <motion.div
                key={user.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl hover:shadow-lg transition-all"
                style={{ background: '#fff', border: '1px solid #ddd' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Link to={createPageUrl('Profile') + `?email=${user.email}`} className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-md ring-2 ring-[#3B82F6]">
                      <img src={avatarUrl} alt={user.full_name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={createPageUrl('Profile') + `?email=${user.email}`}>
                      <p className="font-bold truncate hover:underline" style={{ color: '#000' }}>
                        {user.full_name}
                      </p>
                    </Link>
                    {user.occupation && (
                      <p className="text-xs truncate" style={{ color: '#666' }}>{user.occupation}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3" style={{ color: '#3B82F6' }} />
                      <p className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                        {user.matchScore} shared interest{user.matchScore !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {user.sharedInterests.slice(0, 2).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#DBEAFE', color: '#1E40AF' }}
                    >
                      {interest}
                    </span>
                  ))}
                  {user.sharedInterests.length > 2 && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#F3F4F6', color: '#6B7280' }}
                    >
                      +{user.sharedInterests.length - 2} more
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedUser(user)}
                  className="w-full rounded-xl gap-2"
                  size="sm"
                  style={{ background: '#3B82F6', color: '#fff' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Connect
                </Button>
              </motion.div>
            );
          })}
        </div>
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