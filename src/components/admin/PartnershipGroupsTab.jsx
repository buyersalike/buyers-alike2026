import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function PartnershipGroupsTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['partnershipGroups'],
    queryFn: () => base44.entities.PartnershipGroup.list('-created_date'),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'forming': return '#F59E0B';
      case 'active': return '#22C55E';
      case 'closed': return '#6B7280';
      default: return '#7A8BA6';
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.opportunity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.creator_email?.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#fff', border: '1px solid #ddd', color: '#000' }}
          />
        </div>
      </motion.div>

      {/* Groups Table */}
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
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Opportunity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Creator
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Members
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#ddd', background: '#fff' }}>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center" style={{ color: '#666' }}>
                    No partnership groups found
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, index) => (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono" style={{ color: '#000' }}>
                        {group.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium" style={{ color: '#000' }}>
                        {group.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#3B82F6' }}>
                        {group.opportunity_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {group.creator_email || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {group.members?.length || 0}/{group.max_members || 20}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          color: getStatusColor(group.status), 
                          background: `${getStatusColor(group.status)}22` 
                        }}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        style={{ background: '#3B82F6', color: '#fff', border: '1px solid #3B82F6' }}
                        className="gap-2 hover:opacity-80"
                      >
                        <Edit className="w-3 h-3" />
                        Manage Group
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