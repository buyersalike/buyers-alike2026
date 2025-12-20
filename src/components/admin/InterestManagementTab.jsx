import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Eye, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function InterestManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });

  const queryClient = useQueryClient();

  const { data: interests = [], isLoading } = useQuery({
    queryKey: ['allInterests'],
    queryFn: () => base44.asServiceRole.entities.Interest.list('-created_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.asServiceRole.entities.Interest.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allInterests'] });
    },
  });

  const updateInterestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.Interest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allInterests'] });
      setIsEditDialogOpen(false);
      setSelectedInterest(null);
      setEditFormData({ name: "", description: "" });
    },
  });

  const handleViewDetails = (interest) => {
    setSelectedInterest(interest);
    setIsDetailDialogOpen(true);
  };

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  const handleEdit = (interest) => {
    setSelectedInterest(interest);
    setEditFormData({
      name: interest.name || "",
      description: interest.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editFormData.name || !selectedInterest) return;
    updateInterestMutation.mutate({ id: selectedInterest.id, data: editFormData });
  };

  const filteredInterests = interests.filter(interest =>
    interest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interest.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#22C55E';
      case 'rejected':
        return '#EF4444';
      case 'pending':
      default:
        return '#F59E0B';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl text-center" style={{ background: '#fff', border: '2px solid #000' }}>
        <p style={{ color: '#666' }}>Loading interests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #3B82F6 100%)' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
            Interests
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
            placeholder="Search interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#fff', border: '1px solid #ddd', color: '#000' }}
          />
        </div>
      </motion.div>

      {/* Interests Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '2px solid #000' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#0a0a0a', borderBottom: '1px solid #333' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#fff' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#333' }}>
              {filteredInterests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center" style={{ color: '#999' }}>
                    No interests found
                  </td>
                </tr>
              ) : (
                filteredInterests.map((interest, index) => (
                  <motion.tr
                    key={interest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-900 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {interest.image_url ? (
                        <img
                          src={interest.image_url}
                          alt={interest.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          style={{ border: '1px solid #333' }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
                          <span className="text-xs" style={{ color: '#666' }}>N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium" style={{ color: '#fff' }}>
                        {interest.name || 'Untitled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#ccc' }}>
                        {interest.description || interest.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ color: getStatusColor(interest.status), background: `${getStatusColor(interest.status)}22` }}
                      >
                        {interest.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#999' }}>
                        N/A
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(interest)}
                          style={{ background: '#3B82F6', color: '#fff' }}
                          className="hover:opacity-80"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEdit(interest)}
                          style={{ background: '#D8A11F', color: '#fff' }}
                          className="hover:opacity-80"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {interest.status !== 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(interest.id)}
                            style={{ background: '#22C55E', color: '#fff' }}
                            className="hover:opacity-80"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {interest.status !== 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleReject(interest.id)}
                            style={{ background: '#EF4444', color: '#fff' }}
                            className="hover:opacity-80"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent 
          className="border-0 sm:max-w-lg" 
          style={{ 
            background: '#F2F1F5',
            border: '2px solid #000',
            color: '#000' 
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#000' }}>Interest Details</DialogTitle>
          </DialogHeader>
          {selectedInterest && (
            <div className="space-y-4 py-4">
              {selectedInterest.image_url && (
                <div>
                  <img
                    src={selectedInterest.image_url}
                    alt={selectedInterest.name}
                    className="w-full h-48 rounded-lg object-cover"
                    style={{ border: '1px solid #000' }}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Name</label>
                <p style={{ color: '#333' }}>{selectedInterest.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Description</label>
                <p style={{ color: '#333' }}>{selectedInterest.description || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Status</label>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ color: getStatusColor(selectedInterest.status), background: `${getStatusColor(selectedInterest.status)}22` }}
                >
                  {selectedInterest.status || 'pending'}
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Created By</label>
                <p style={{ color: '#333' }}>{selectedInterest.created_by || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          className="border-0 sm:max-w-md" 
          style={{ 
            background: '#F2F1F5',
            border: '2px solid #000',
            color: '#000' 
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#000' }}>Edit Interest</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#000' }}>
                Name
              </label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Interest name"
                style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#000' }}>
                Description
              </label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Interest description"
                rows={4}
                className="resize-none"
                style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              style={{ border: '1px solid #000', color: '#000', background: '#fff' }}
              disabled={updateInterestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={!editFormData.name.trim() || updateInterestMutation.isPending}
              style={{ background: '#D8A11F', color: '#fff' }}
              className="hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateInterestMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}