import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function SystemActivityFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['systemLogs'],
    queryFn: () => base44.asServiceRole.entities.SystemLog.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.SystemLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemLogs'] });
    },
  });

  // Get unique entity types and action types for filters
  const entityTypes = ['all', ...new Set(logs.map(log => log.entity_type).filter(Boolean))];
  const actionTypes = ['all', ...new Set(logs.map(log => log.type).filter(Boolean))];

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEntityType = entityTypeFilter === 'all' || log.entity_type === entityTypeFilter;
    const matchesActionType = actionTypeFilter === 'all' || log.type === actionTypeFilter;

    return matchesSearch && matchesEntityType && matchesActionType;
  });

  // Type badge colors
  const getTypeColor = (type) => {
    const colors = {
      'user_login': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'user_logout': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'interest_created': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'interest_approved': 'bg-green-500/20 text-green-300 border-green-500/30',
      'interest_rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
      'category_created': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'category_updated': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'category_deleted': 'bg-red-500/20 text-red-300 border-red-500/30',
      'opportunity_created': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'opportunity_updated': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'partnership_established': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'vendor_approved': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'admin_action': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading activity feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #3B82F6 0%, #7C3AED 100%)' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
            System Activity Feed
          </h2>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[200px] glass-input" style={{ color: '#E5EDFF' }}>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Entities' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
            <SelectTrigger className="w-[200px] glass-input" style={{ color: '#E5EDFF' }}>
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Actions' : type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Activity Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Entity Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center" style={{ color: '#7A8BA6' }}>
                    No activities found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Badge 
                        className={`${getTypeColor(log.type)} border text-xs font-medium`}
                      >
                        {log.type?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm" style={{ color: '#E5EDFF' }}>
                        {log.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#B6C4E0' }}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: '#B6C4E0' }}>
                        <div className="font-medium" style={{ color: '#E5EDFF' }}>
                          {log.user_name || 'System'}
                        </div>
                        <div className="text-xs" style={{ color: '#7A8BA6' }}>
                          {log.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#B6C4E0' }}>
                        {formatDistanceToNow(new Date(log.created_date), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(log.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#B6C4E0' }}>
            Showing {filteredLogs.length} of {logs.length} activities
          </span>
          {(searchQuery || entityTypeFilter !== 'all' || actionTypeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setEntityTypeFilter('all');
                setActionTypeFilter('all');
              }}
              style={{ color: '#3B82F6' }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}