import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, Lock, Crown, ImagePlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MessageActions from "./MessageActions";
import { MediaPreview, FilePreviewBar } from "./MediaAttachment";
import MessageStatus from "./MessageStatus";

export default function ChatArea({ conversation, onSendMessage, onMarkAsRead, currentUserEmail, isPaidUser = true }) {
  const queryClient = useQueryClient();

  const editMessageMutation = useMutation({
    mutationFn: async ({ id, content }) => {
      await base44.entities.Message.update(id, { content, edited: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Message.update(id, { deleted: true, content: 'This message was deleted' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });
  const [messageText, setMessageText] = React.useState("");
  const [pendingFiles, setPendingFiles] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Mark unread messages as read
    conversation?.messages.forEach(msg => {
      if (!msg.read && msg.recipient_email === currentUserEmail) {
        onMarkAsRead({ id: msg.id });
      }
    });
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    if ((!messageText.trim() && pendingFiles.length === 0) || !conversation?.otherUserEmail) return;
    
    let fileUrls = [];
    if (pendingFiles.length > 0) {
      setUploading(true);
      for (const file of pendingFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls.push(file_url);
      }
      setUploading(false);
    }
    
    onSendMessage(messageText || '', conversation.otherUserEmail, fileUrls);
    setMessageText("");
    setPendingFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...(conversation?.messages || [])].sort(
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
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#D8A11F' }}
          >
            <User className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: '#000' }}>
              {conversation?.otherUserEmail.split('@')[0]}
            </p>
            <p className="text-xs" style={{ color: '#666' }}>
              {conversation?.otherUserEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {sortedMessages.map((msg, index) => {
          const isOwn = msg.sender_email === currentUserEmail;
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
              
              <div className={`flex flex-col w-full group ${isOwn ? 'items-end' : 'items-start'}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] px-4 py-2 rounded-2xl inline-block ${msg.deleted ? 'italic opacity-60' : ''}`}
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
                    {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                    <MediaPreview urls={msg.file_urls} />
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {msg.edited && !msg.deleted && (
                        <span className="text-xs opacity-60">edited</span>
                      )}
                      {isOwn && !msg.deleted && <MessageStatus msg={msg} />}
                    </div>
                  </div>
                </motion.div>
                {!msg.deleted && (
                  <MessageActions
                    msg={msg}
                    isOwn={isOwn}
                    onEdit={(id, content) => editMessageMutation.mutate({ id, content })}
                    onDelete={(id) => deleteMessageMutation.mutate(id)}
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
        {isPaidUser ? (
          <div>
            <FilePreviewBar files={pendingFiles} onRemove={(i) => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} />
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl px-3 flex-shrink-0"
                style={{ background: '#F3F4F6', color: '#666', border: '1px solid #000' }}
                title="Attach image or video"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
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
                disabled={(!messageText.trim() && pendingFiles.length === 0) || !conversation?.otherUserEmail || uploading}
                className="rounded-xl px-4 flex-shrink-0"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
            <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#D8A11F' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#92400E' }}>Upgrade to send messages</p>
              <p className="text-xs" style={{ color: '#A16207' }}>You can read messages but need a paid plan to reply.</p>
            </div>
            <Link to="/#pricing">
              <Button size="sm" className="gap-1 rounded-lg text-xs flex-shrink-0" style={{ background: '#D8A11F', color: '#fff' }}>
                <Crown className="w-3 h-3" />
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}