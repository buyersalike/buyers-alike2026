import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function PartnershipIntentsTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: intents = [], isLoading } = useQuery({
    queryKey: ['partnershipIntents'],
    queryFn: () => base44.entities.PartnershipIntent.list('-created_date'),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted into group': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'withdrawn': return '#6B7280';
      default: return '#7A8BA6';
    }
  };

  const filteredIntents = intents.filter(intent =>
    intent.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intent.opportunity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intent.current_status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #ddd' }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
          <Input
            placeholder="Search intents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#fff', border: '1px solid #ddd', color: '#000' }}
          />
        </div>
      </motion.div>

      {/* Intents Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'transparent', border: '2px solid #000' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#F2F1F5' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Opportunity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Current Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Group (if any)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#ddd', background: '#fff' }}>
              {filteredIntents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center" style={{ color: '#666' }}>
                    No partnership intents found
                  </td>
                </tr>
              ) : (
                filteredIntents.map((intent, index) => (
                  <motion.tr
                    key={intent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono" style={{ color: '#000' }}>
                        {intent.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {intent.user_email || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#3B82F6' }}>
                        {intent.opportunity_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          color: getStatusColor(intent.current_status), 
                          background: `${getStatusColor(intent.current_status)}22` 
                        }}
                      >
                        {intent.current_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {intent.group_name ? (
                        <div>
                          <span className="text-sm font-medium" style={{ color: '#000' }}>
                            {intent.group_name}
                          </span>
                          {intent.group_status && (
                            <span className="text-xs ml-2" style={{ color: '#666' }}>
                              ({intent.group_status})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        style={{ background: '#3B82F6', color: '#fff', border: '1px solid #3B82F6' }}
                        className="gap-2 hover:opacity-80"
                      >
                        <Edit className="w-3 h-3" />
                        Manage
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}