import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import ConversationList from "@/components/messages/ConversationList";
import ChatArea from "@/components/messages/ChatArea";
import GroupChatArea from "@/components/messages/GroupChatArea";
import SearchMembers from "@/components/messages/SearchMembers";
import CreateGroupDialog from "@/components/messages/CreateGroupDialog";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [chatType, setChatType] = useState('direct'); // 'direct' or 'group'
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const conn1 = await base44.entities.Connection.filter({ user1_email: user.email, status: "connected" });
      const conn2 = await base44.entities.Connection.filter({ user2_email: user.email, status: "connected" });
      return [...conn1, ...conn2];
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const sent = await base44.entities.Message.filter({ sender_email: user.email });
      const received = await base44.entities.Message.filter({ recipient_email: user.email });
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['group-chats', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allGroups = await base44.entities.GroupChat.list();
      return allGroups.filter(g => g.members.includes(user.email));
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  const { data: groupMessages = [] } = useQuery({
    queryKey: ['group-messages'],
    queryFn: () => base44.entities.GroupMessage.list(),
    enabled: !!user,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await base44.entities.Message.create(messageData);
      // Create notification for recipient
      await base44.entities.Notification.create({
        recipient_email: messageData.recipient_email,
        type: 'new_message',
        title: 'New Message',
        message: `${user.full_name} sent you a message`,
        sender_email: user.email,
        sender_name: user.full_name,
        link: '/Messages',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const sendGroupMessageMutation = useMutation({
    mutationFn: async ({ groupId, content }) => {
      const group = groups.find(g => g.id === groupId);
      await base44.entities.GroupMessage.create({
        group_id: groupId,
        sender_email: user.email,
        sender_name: user.full_name,
        content,
      });
      // Create notifications for all group members except sender
      const otherMembers = group.members.filter(m => m !== user.email);
      for (const memberEmail of otherMembers) {
        await base44.entities.Notification.create({
          recipient_email: memberEmail,
          type: 'new_message',
          title: `New message in ${group.name}`,
          message: `${user.full_name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          sender_email: user.email,
          sender_name: user.full_name,
          link: '/Messages',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Message.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const getConversations = () => {
    const conversationMap = new Map();
    
    connections.forEach(conn => {
      const otherUserEmail = conn.user1_email === user?.email ? conn.user2_email : conn.user1_email;
      const conversationId = [user?.email, otherUserEmail].sort().join('_');
      
      conversationMap.set(conversationId, {
        id: conversationId,
        otherUserEmail,
        messages: [],
        unreadCount: 0,
      });
    });

    messages.forEach(msg => {
      const conversationId = msg.conversation_id;
      if (conversationMap.has(conversationId)) {
        const conv = conversationMap.get(conversationId);
        conv.messages.push(msg);
        if (!msg.read && msg.recipient_email === user?.email) {
          conv.unreadCount++;
        }
      }
    });

    return Array.from(conversationMap.values());
  };

  const handleSendMessage = (content, recipientEmail) => {
    const conversationId = [user.email, recipientEmail].sort().join('_');
    sendMessageMutation.mutate({
      conversation_id: conversationId,
      sender_email: user.email,
      recipient_email: recipientEmail,
      content,
    });
  };

  const handleSendGroupMessage = (content, groupId) => {
    sendGroupMessageMutation.mutate({ groupId, content });
  };

  const handleSelectConversation = (conversationId) => {
    setChatType('direct');
    setSelectedConversation(conversationId);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (groupId) => {
    setChatType('group');
    setSelectedGroup(groupId);
    setSelectedConversation(null);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p style={{ color: '#000' }}>Loading...</p>
        </main>
      </div>
    );
  }

  const conversations = getConversations();

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <main className="flex-1 flex">
        <ConversationList
          conversations={conversations}
          groups={groups}
          selectedConversation={selectedConversation}
          selectedGroup={selectedGroup}
          onSelectConversation={handleSelectConversation}
          onSelectGroup={handleSelectGroup}
          onShowSearch={() => setShowSearch(true)}
          onShowCreateGroup={() => setShowCreateGroup(true)}
          currentUserEmail={user.email}
          groupMessages={groupMessages}
        />
        
        {showSearch ? (
          <SearchMembers
            connections={connections}
            onSelectMember={(email) => {
              const conversationId = [user.email, email].sort().join('_');
              handleSelectConversation(conversationId);
              setShowSearch(false);
            }}
            onClose={() => setShowSearch(false)}
            currentUserEmail={user.email}
          />
        ) : chatType === 'group' && selectedGroup ? (
          <GroupChatArea
            group={groups.find(g => g.id === selectedGroup)}
            messages={groupMessages.filter(m => m.group_id === selectedGroup)}
            onSendMessage={handleSendGroupMessage}
            currentUser={user}
          />
        ) : selectedConversation ? (
          <ChatArea
            conversation={conversations.find(c => c.id === selectedConversation)}
            onSendMessage={handleSendMessage}
            onMarkAsRead={markAsReadMutation.mutate}
            currentUserEmail={user.email}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg mb-2" style={{ color: '#000' }}>
                Select a conversation to start messaging
              </p>
              <p className="text-sm" style={{ color: '#666' }}>
                Or create a group chat for collaborative discussions
              </p>
            </div>
          </div>
        )}
      </main>

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        currentUser={user}
        connections={connections}
      />
    </div>
  );
}