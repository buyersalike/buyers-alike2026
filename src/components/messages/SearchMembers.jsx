import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User, MessageSquare, Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchMembers({ onSelectMember, onClose, currentUserEmail, isPaidUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await base44.functions.invoke('searchMembers', {});
        setAllUsers(response.data?.members || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserEmail]);

  const filteredUsers = allUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (email) => {
    if (!isPaidUser) return;
    onSelectMember(email);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ background: '#fff', borderColor: '#000' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#000' }}>Search Members</h2>
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

        {!isPaidUser && (
          <div className="mt-3 p-3 rounded-xl flex items-start gap-3" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D8A11F' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#92400E' }}>
                Messaging is a paid feature
              </p>
              <p className="text-xs mt-1" style={{ color: '#A16207' }}>
                Upgrade to Professional or Enterprise to message members.
              </p>
              <Link to="/#pricing">
                <Button size="sm" className="mt-2 gap-1 rounded-lg text-xs" style={{ background: '#D8A11F', color: '#fff' }}>
                  <Crown className="w-3 h-3" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <p style={{ color: '#666' }}>Loading members...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-2">
            {filteredUsers.map((member) => {
              return (
                <motion.div
                  key={member.id}
                  whileHover={{ x: isPaidUser ? 4 : 0 }}
                  onClick={() => handleSelectMember(member.email)}
                  className={`p-4 rounded-xl transition-all ${isPaidUser ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{ background: '#fff', border: '1px solid #000' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#D8A11F' }}>
                          <User className="w-6 h-6" style={{ color: '#fff' }} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: '#000' }}>
                        {member.full_name || 'User'}
                      </p>
                      <p className="text-sm truncate" style={{ color: '#666' }}>
                        {member.title || member.occupation || member.email}
                      </p>
                    </div>

                    {isPaidUser ? (
                      <MessageSquare className="w-5 h-5" style={{ color: '#D8A11F' }} />
                    ) : (
                      <Lock className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: '#666' }} />
            <p className="text-lg mb-2" style={{ color: '#000' }}>
              {searchQuery ? 'No members found' : 'No members available'}
            </p>
            <p className="text-sm" style={{ color: '#666' }}>
              {searchQuery 
                ? 'Try searching with a different name or email'
                : 'Check back later for new members'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}