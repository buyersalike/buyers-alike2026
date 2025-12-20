import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Mail, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ContactManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['contactSubmissions'],
    queryFn: async () => {
      const data = await base44.asServiceRole.entities.ContactSubmission.list('-created_date');
      console.log('Contact submissions fetched:', data);
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.asServiceRole.entities.ContactSubmission.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.ContactSubmission.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
    },
  });

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    if (submission.status === 'new') {
      updateStatusMutation.mutate({ id: submission.id, status: 'read' });
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'read':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'responded':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading...</p>
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
          <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
            Contact Form Submissions
          </h2>
        </div>
      </motion.div>

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
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#fff', border: '1px solid #ddd', color: '#000' }}
          />
        </div>
      </motion.div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '2px solid #000' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#F2F1F5' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#ddd' }}>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center" style={{ color: '#666' }}>
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {format(new Date(submission.created_date), 'M/d/yyyy, h:mm:ss a')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium" style={{ color: '#000' }}>
                        {submission.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {submission.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {submission.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm line-clamp-2" style={{ color: '#000' }}>
                        {submission.message}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-xs font-medium">
                        {submission.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(submission)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(submission.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent 
          className="border-0 sm:max-w-2xl" 
          style={{ 
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#E5EDFF' 
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2" style={{ color: '#E5EDFF' }}>
              <Mail className="w-5 h-5" />
              Contact Submission Details
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#7A8BA6' }}>
                    Name
                  </label>
                  <p className="text-sm" style={{ color: '#E5EDFF' }}>{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#7A8BA6' }}>
                    Email
                  </label>
                  <p className="text-sm" style={{ color: '#E5EDFF' }}>{selectedSubmission.email}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#7A8BA6' }}>
                  Subject
                </label>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>{selectedSubmission.subject}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#7A8BA6' }}>
                  Message
                </label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#E5EDFF' }}>{selectedSubmission.message}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#7A8BA6' }}>
                  Submitted
                </label>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  {format(new Date(selectedSubmission.created_date), 'MMMM d, yyyy h:mm:ss a')}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateStatusMutation.mutate({ id: selectedSubmission.id, status: 'responded' })}
                  style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff' }}
                >
                  Mark as Responded
                </Button>
                <Button
                  onClick={() => window.location.href = `mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
                >
                  Reply via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #ddd' }}
      >
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: '#000' }}>
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </span>
          <div className="flex gap-4">
            <span style={{ color: '#000' }}>
              New: <span style={{ color: '#22C55E' }}>{submissions.filter(s => s.status === 'new').length}</span>
            </span>
            <span style={{ color: '#000' }}>
              Read: <span style={{ color: '#3B82F6' }}>{submissions.filter(s => s.status === 'read').length}</span>
            </span>
            <span style={{ color: '#000' }}>
              Responded: <span style={{ color: '#666' }}>{submissions.filter(s => s.status === 'responded').length}</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}