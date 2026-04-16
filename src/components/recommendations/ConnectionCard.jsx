import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Heart, UserPlus, Check } from "lucide-react";
import SendRequestDialog from "@/components/connections/SendRequestDialog";

export default function ConnectionCard({ connection, index }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const sendConnectionRequestMutation = useMutation({
    mutationFn: async (message) => {
      if (!currentUser) throw new Error('Not authenticated');
      
      const newConnection = await base44.entities.Connection.create({
        user1_email: currentUser.email,
        user2_email: connection.email,
        status: 'pending',
        message: message || '',
      });

      await base44.functions.invoke('sendNotification', {
        recipientEmail: connection.email,
        type: 'connection_request',
        title: '👋 New Connection Request',
        message: `${currentUser.full_name} wants to connect with you`,
        link: `/Profile?email=${currentUser.email}`,
        sendEmail: true
      });

      return newConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setDialogOpen(false);
      setRequestSent(true);
    },
  });

  // Build user object for dialog
  const dialogUser = {
    email: connection.email,
    full_name: connection.name,
    name: connection.name,
    avatar_url: connection.avatar,
    title: connection.role,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="rounded-2xl p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-1"
        style={{
          background: '#192234',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <img
            src={connection.avatar}
            alt={connection.name}
            className="w-24 h-24 rounded-full object-cover border-4"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold mb-2" style={{ color: '#fff' }}>
          {connection.name}
        </h3>

        {/* Role Badge */}
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          {connection.role}
        </div>

        {/* Bio */}
        <p className="text-sm mb-4 min-h-[40px]" style={{ color: '#fff' }}>
          {connection.bio}
        </p>

        {/* Match Percentage */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <Heart className="w-4 h-4" style={{ color: '#EF4444', fill: '#EF4444' }} />
          <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>
            {connection.matchPercentage != null ? `${connection.matchPercentage}% Match` : 'Match'}
          </span>
        </div>

        {/* Connect Button */}
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={requestSent || sendConnectionRequestMutation.isPending}
          className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          style={requestSent 
            ? { background: '#22C55E', color: '#fff', opacity: 1 } 
            : { background: '#D8A11F', color: '#fff' }
          }
        >
          {requestSent ? (
            <><Check className="w-4 h-4" /> Request Sent</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Connect</>
          )}
        </Button>
      </motion.div>

      <SendRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={dialogUser}
        onSend={(message) => sendConnectionRequestMutation.mutate(message)}
        isPending={sendConnectionRequestMutation.isPending}
      />
    </>
  );
}