import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Users, User, ChevronDown, ChevronUp, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddMemberDialog from "./AddMemberDialog";
import MessageActions from "./MessageActions";

export default function GroupChatArea({ group, messages, onSendMessage, currentUser }) {
  const [messageText, setMessageText] = React.useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const queryClient = useQueryClient();

  const isAdmin = currentUser.role === 'admin' || currentUser.email === group.creator_email;

  const editGroupMessageMutation = useMutation({
    mutationFn: async ({ id, content }) => {
      await base44.entities.GroupMessage.update(id, { content, edited: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-messages'] }),
  });

  const deleteGroupMessageMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.GroupMessage.update(id, { deleted: true, content: 'This message was deleted' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-messages'] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (emailToRemove) => {
      const updatedMembers = group.members.filter(m => m !== emailToRemove);
      await base44.entities.GroupChat.update(group.id, { members: updatedMembers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-chats'] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText, group.id);
      setMessageText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_date) - new Date(b.created_date)
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          background: '#fff',
          borderColor: '#000'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: '#D8A11F' }}
          >
            <Users className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg" style={{ color: '#000' }}>
              {group.name}
            </p>
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className="flex items-center gap-1 text-xs hover:underline"
              style={{ color: '#D8A11F' }}
            >
              {group.members.length} members
              {showMembers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
        {group.description && (
          <p className="text-sm mt-2" style={{ color: '#666' }}>{group.description}</p>
        )}

        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ border: '1px dashed #D8A11F' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D8A11F' }}>
                      <UserPlus className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#D8A11F' }}>Add Member</span>
                  </button>
                )}
                {group.members.map((email) => (
                  <div key={email} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: '#F9FAFB' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D8A11F' }}>
                      <User className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                    </div>
                    <span className="text-sm flex-1" style={{ color: '#000' }}>{email}</span>
                    {email === group.creator_email && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>Admin</span>
                    )}
                    {email === currentUser.email && (
                      <span className="text-xs" style={{ color: '#666' }}>(You)</span>
                    )}
                    {isAdmin && email !== currentUser.email && email !== group.creator_email && (
                      <button
                        onClick={() => removeMemberMutation.mutate(email)}
                        disabled={removeMemberMutation.isPending}
                        className="p-1 rounded-full hover:bg-red-100 transition-colors"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isAdmin && <AddMemberDialog open={showAddMember} onOpenChange={setShowAddMember} group={group} />}
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {sortedMessages.map((msg, index) => {
          const isOwn = msg.sender_email === currentUser.email;
          const showTimestamp = index === 0 || 
            (new Date(msg.created_date) - new Date(sortedMessages[index - 1].created_date)) > 300000;

          return (
            <div key={msg.id}>
              {showTimestamp && (
                <div className="text-center mb-4">
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#F3F4F6', color: '#666' }}>
                    {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                  </span>
                </div>
              )}
              
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  {!isOwn && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ background: '#D8A11F' }}
                    >
                      <User className="w-4 h-4" style={{ color: '#fff' }} />
                    </div>
                  )}
                  
                  <div className="max-w-[70%]">
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 px-2" style={{ color: '#D8A11F' }}>
                        {msg.sender_name}
                      </p>
                    )}
                    <div 
                      className={`px-4 py-2 rounded-2xl ${msg.deleted ? 'italic opacity-60' : ''}`}
                      style={isOwn ? {
                        background: msg.deleted ? '#B8860B' : '#D8A11F',
                        color: '#fff',
                        borderBottomRightRadius: '4px'
                      } : {
                        background: '#fff',
                        color: msg.deleted ? '#999' : '#000',
                        border: '1px solid #E5E7EB',
                        borderBottomLeftRadius: '4px'
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      {msg.edited && !msg.deleted && (
                        <p className="text-xs mt-0.5 opacity-60">edited</p>
                      )}
                    </div>
                  </div>
                </motion.div>
                {!msg.deleted && (
                  <MessageActions
                    msg={msg}
                    isOwn={isOwn}
                    onEdit={(id, content) => editGroupMessageMutation.mutate({ id, content })}
                    onDelete={(id) => deleteGroupMessageMutation.mutate(id)}
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div 
        className="p-4 border-t"
        style={{ 
          background: '#fff',
          borderColor: '#000'
        }}
      >
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="resize-none"
            style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="rounded-xl px-4"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}