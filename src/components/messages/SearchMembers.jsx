import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User, MessageSquare } from "lucide-react";

export default function SearchMembers({ connections, onSelectMember, onClose, currentUserEmail }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await base44.entities.User.list();
        setAllUsers(users.filter(u => u.email !== currentUserEmail));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserEmail]);

  const connectedEmails = new Set(
    connections.map(conn => 
      conn.user1_email === currentUserEmail ? conn.user2_email : conn.user1_email
    )
  );

  const connectedUsers = allUsers.filter(user => connectedEmails.has(user.email));

  const filteredUsers = connectedUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ 
          background: '#fff',
          borderColor: '#000'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#000' }}>Search Connected Members</h2>
          <Button
            onClick={onClose}
            className="rounded-lg p-2"
            style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 rounded-xl"
            style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
            autoFocus
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <p style={{ color: '#666' }}>Loading members...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ x: 4 }}
                onClick={() => onSelectMember(user.email)}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{ background: '#fff', border: '1px solid #000' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#D8A11F' }}
                  >
                    <User className="w-6 h-6" style={{ color: '#fff' }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ color: '#000' }}>
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-sm truncate" style={{ color: '#666' }}>
                      {user.email}
                    </p>
                  </div>

                  <MessageSquare className="w-5 h-5" style={{ color: '#D8A11F' }} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: '#666' }} />
            <p className="text-lg mb-2" style={{ color: '#000' }}>
              {searchQuery ? 'No members found' : 'No connected members'}
            </p>
            <p className="text-sm" style={{ color: '#666' }}>
              {searchQuery 
                ? 'Try searching with a different name or email'
                : 'Connect with members to start messaging'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}