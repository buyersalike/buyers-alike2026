import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
// framer-motion not needed here
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OpportunitiesManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['allOpportunities'],
    queryFn: () => base44.asServiceRole.entities.Opportunity.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.asServiceRole.entities.Opportunity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
    },
  });

  const [updatingId, setUpdatingId] = useState(null);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await base44.asServiceRole.entities.Opportunity.update(id, { status });
      queryClient.invalidateQueries({ queryKey: ['allOpportunities'] });
      toast.success(`Opportunity ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'unverified': return '#6B7280';
      case 'rejected': return '#EF4444';
      default: return '#7A8BA6';
    }
  };

  const handleViewDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailDialogOpen(true);
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.created_by?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #3B82F6 100%)' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
            Manage Opportunities
          </h2>
        </div>
      </div>

      {/* Search */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #ddd' }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#fff', border: '1px solid #ddd', color: '#000' }}
          />
        </div>
      </div>

      {/* Opportunities Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'transparent', border: '2px solid #000' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#F2F1F5' }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Images
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Source Link
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Investment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Creator
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#000' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#ddd', background: '#fff' }}>
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center" style={{ color: '#666' }}>
                    No opportunities found
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp, index) => (
                  <tr
                    key={opp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {opp.image_url ? (
                        <img
                          src={opp.image_url}
                          alt={opp.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          style={{ border: '1px solid #ddd' }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: '#F2F1F5', border: '1px solid #ddd' }}>
                          <span className="text-xs" style={{ color: '#666' }}>No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm" style={{ color: '#000' }}>
                        {opp.title || 'Untitled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm line-clamp-3" style={{ color: '#000' }}>
                        {opp.description || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {opp.source_url ? (
                        <a 
                          href={opp.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                          style={{ color: '#3B82F6' }}
                        >
                          {opp.source_url.substring(0, 20)}...
                        </a>
                      ) : (
                        <span className="text-sm" style={{ color: '#666' }}>N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {opp.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium" style={{ color: '#000' }}>
                        {opp.investment_min && opp.investment_max 
                          ? `$${opp.investment_min.toLocaleString()} - $${opp.investment_max.toLocaleString()}`
                          : opp.investment_min 
                          ? `$${opp.investment_min.toLocaleString()}`
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#000' }}>
                        {opp.creator_email || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ 
                          color: getStatusColor(opp.status), 
                          background: `${getStatusColor(opp.status)}22` 
                        }}
                      >
                        {opp.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: '#666' }}>
                        N/A
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(opp)}
                          style={{ background: '#3B82F6', color: '#fff' }}
                          className="hover:opacity-80"
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {opp.status !== 'verified' && (
                           <Button
                             size="sm"
                             onClick={(e) => { e.stopPropagation(); updateStatus(opp.id, 'verified'); }}
                             disabled={updatingId === opp.id}
                             style={{ background: '#22C55E', color: '#fff' }}
                             className="hover:opacity-80"
                             title="Approve"
                           >
                             <CheckCircle className="w-3 h-3" />
                           </Button>
                         )}
                         {opp.status !== 'unverified' && (
                           <Button
                             size="sm"
                             onClick={(e) => { e.stopPropagation(); updateStatus(opp.id, 'unverified'); }}
                             disabled={updatingId === opp.id}
                             style={{ background: '#EF4444', color: '#fff' }}
                             className="hover:opacity-80"
                             title="Reject"
                           >
                             <XCircle className="w-3 h-3" />
                           </Button>
                         )}
                        <Button
                          size="sm"
                          onClick={() => deleteMutation.mutate(opp.id)}
                          style={{ background: '#6B7280', color: '#fff' }}
                          className="hover:opacity-80"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent 
          className="border-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto" 
          style={{ 
            background: '#F2F1F5',
            border: '2px solid #000',
            color: '#000' 
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#000' }}>Opportunity Details</DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4 py-4">
              {selectedOpportunity.image_url && (
                <div>
                  <img
                    src={selectedOpportunity.image_url}
                    alt={selectedOpportunity.title}
                    className="w-full h-60 rounded-lg object-cover"
                    style={{ border: '1px solid #000' }}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Title</label>
                <p style={{ color: '#333' }}>{selectedOpportunity.title || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Description</label>
                <p className="whitespace-pre-wrap" style={{ color: '#333' }}>{selectedOpportunity.description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Category</label>
                  <p style={{ color: '#333' }}>{selectedOpportunity.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Status</label>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ color: getStatusColor(selectedOpportunity.status), background: `${getStatusColor(selectedOpportunity.status)}22` }}
                  >
                    {selectedOpportunity.status || 'pending'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Investment Range</label>
                <p style={{ color: '#333' }}>
                  {selectedOpportunity.investment_min && selectedOpportunity.investment_max 
                    ? `$${selectedOpportunity.investment_min.toLocaleString()} - $${selectedOpportunity.investment_max.toLocaleString()}`
                    : selectedOpportunity.investment_min 
                    ? `$${selectedOpportunity.investment_min.toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
              {selectedOpportunity.source_url && (
                <div>
                  <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Source Link</label>
                  <a 
                    href={selectedOpportunity.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: '#3B82F6' }}
                  >
                    {selectedOpportunity.source_url}
                  </a>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: '#000' }}>Created By</label>
                <p style={{ color: '#333' }}>{selectedOpportunity.creator_email || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}