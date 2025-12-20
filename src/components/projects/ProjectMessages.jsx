import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectMessages({ project, currentUser }) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['projectMessages', project.id],
    queryFn: () => base44.entities.ProjectMessage.filter({ project_id: project.id }, '-created_date'),
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const msg = await base44.entities.ProjectMessage.create(data);
      
      // Notify all collaborators
      const recipients = [project.owner_email, ...(project.collaborators || [])]
        .filter(email => email !== currentUser.email);
      
      for (const recipient of recipients) {
        await base44.functions.invoke('sendNotification', {
          recipientEmail: recipient,
          type: 'new_message',
          title: 'New Project Message',
          message: `${currentUser.full_name} sent a message in ${project.name}`,
          link: `/ProjectDetail?projectId=${project.id}`
        });
      }
      
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMessages'] });
      setMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({
      project_id: project.id,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name,
      content: message,
      attachments: []
    });
  };

  return (
    <div className="rounded-2xl flex flex-col h-[600px]" style={{ background: '#fff', border: '1px solid #000' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#666' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.slice().reverse().map((msg) => {
            const isOwn = msg.sender_email === currentUser.email;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[70%] p-4 rounded-lg"
                  style={{
                    background: isOwn 
                      ? '#D8A11F'
                      : '#F2F1F5',
                    border: `1px solid ${isOwn ? '#D8A11F' : '#000'}`
                  }}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1" style={{ color: '#D8A11F' }}>
                      {msg.sender_name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap" style={{ color: isOwn ? '#fff' : '#000' }}>
                    {msg.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#666' }}>
                    {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: '#000' }}>
        <div className="flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 h-20 resize-none"
            style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="rounded-lg"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}