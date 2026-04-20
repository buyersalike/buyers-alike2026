import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, User, Users, X } from "lucide-react";
import { format } from "date-fns";

export default function ConversationList({ 
  conversations, 
  groups = [],
  selectedConversation,
  selectedGroup,
  onSelectConversation,
  onSelectGroup,
  onShowSearch,
  onShowCreateGroup,
  onRemoveConversation,
  currentUserEmail,
  groupMessages = [],
  isPaidUser
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("direct"); // 'direct' or 'groups'

  const filteredConversations = conversations.filter(conv => 
    conv.otherUserEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGroupUnreadCount = (groupId) => {
    return groupMessages.filter(m => 
      m.group_id === groupId && 
      m.sender_email !== currentUserEmail &&
      !m.read_by?.includes(currentUserEmail)
    ).length;
  };

  return (
    <div 
      className="w-80 border-r overflow-y-auto"
      style={{ 
        background: '#fff',
        borderColor: '#000'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#000' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#000' }}>Messages</h2>
          <div className="flex gap-2">
            <Button
              onClick={onShowSearch}
              className="rounded-lg p-2"
              style={{ background: '#D8A11F', color: '#fff' }}
              title="Search members"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {isPaidUser && (
              <Button
                onClick={onShowCreateGroup}
                className="rounded-lg p-2"
                style={{ background: '#D8A11F', color: '#fff' }}
                title="Create group chat"
              >
                <Users className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 rounded-xl"
            style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 p-1 rounded-xl" style={{ background: '#F3F4F6', border: '1px solid #000' }}>
            <TabsTrigger value="direct" className="rounded-lg data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              Direct
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              Groups
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations & Groups */}
      <div className="p-2">
        {activeTab === 'direct' ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const lastMessage = conv.messages[0];
              const isSelected = selectedConversation === conv.id;

              return (
                <motion.div
                  key={conv.id}
                  whileHover={{ x: 4 }}
                  onClick={() => onSelectConversation(conv.id)}
                  className="p-3 rounded-xl mb-2 cursor-pointer transition-all relative group"
                  style={isSelected ? {
                    background: '#FEF3C7',
                    border: '1px solid #D8A11F',
                  } : {
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  {onRemoveConversation && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveConversation(conv.id); }}
                      className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      title="Remove conversation"
                    >
                      <X className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                    </button>
                  )}
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#D8A11F' }}
                    >
                      <User className="w-5 h-5" style={{ color: '#fff' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate" style={{ color: '#000' }}>
                          {conv.otherUserEmail.split('@')[0]}
                        </p>
                        {lastMessage && (
                          <span className="text-xs" style={{ color: '#666' }}>
                            {format(new Date(lastMessage.created_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate" style={{ color: '#666' }}>
                          {lastMessage ? (
                            lastMessage.sender_email === currentUserEmail ? `You: ${lastMessage.content}` : lastMessage.content
                          ) : 'No messages yet'}
                        </p>
                        
                        {conv.unreadCount > 0 && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: '#D8A11F', color: '#fff' }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#666' }}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          )
        ) : (
          filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const groupMsgs = groupMessages.filter(m => m.group_id === group.id);
              const lastMessage = groupMsgs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
              const isSelected = selectedGroup === group.id;
              const unreadCount = getGroupUnreadCount(group.id);

              return (
                <motion.div
                  key={group.id}
                  whileHover={{ x: 4 }}
                  onClick={() => onSelectGroup(group.id)}
                  className="p-3 rounded-xl mb-2 cursor-pointer transition-all"
                  style={isSelected ? {
                    background: '#FEF3C7',
                    border: '1px solid #D8A11F',
                  } : {
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#D8A11F' }}
                    >
                      <Users className="w-5 h-5" style={{ color: '#fff' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate" style={{ color: '#000' }}>
                          {group.name}
                        </p>
                        {lastMessage && (
                          <span className="text-xs" style={{ color: '#666' }}>
                            {format(new Date(lastMessage.created_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate" style={{ color: '#666' }}>
                          {lastMessage ? `${lastMessage.sender_name}: ${lastMessage.content}` : 'No messages yet'}
                        </p>
                        
                        {unreadCount > 0 && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: '#D8A11F', color: '#fff' }}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#666' }}>
                {searchQuery ? 'No groups found' : 'No group chats yet'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}