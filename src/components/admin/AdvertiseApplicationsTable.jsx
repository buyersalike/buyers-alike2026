import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Eye, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdvertiseApplicationsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [columnSelection, setColumnSelection] = useState(1);
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['advertiseApplications'],
    queryFn: () => base44.entities.AdvertiseApplication.list('-created_date'),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ applicationId, column }) => {
      const app = applications.find(a => a.id === applicationId);
      const approvedDate = new Date();
      const expiryDate = new Date(approvedDate);
      expiryDate.setMonth(expiryDate.getMonth() + app.duration_months);
      
      await base44.entities.AdvertiseApplication.update(applicationId, {
        status: 'approved',
        approved_date: approvedDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        landing_column: column
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiseApplications'] });
      setSelectedApplication(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (applicationId) =>
      base44.entities.AdvertiseApplication.update(applicationId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiseApplications'] });
      setSelectedApplication(null);
    },
  });

  const filteredApplications = applications.filter(app =>
    app.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.package?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    expired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading advertising applications...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
              Advertising Applications
            </h2>
            <p className="text-sm mt-1" style={{ color: '#7A8BA6' }}>
              {applications.length} total applications
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: '#B6C4E0' }}>Business Name</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Contact</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Package</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Duration</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Budget</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Status</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Date</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => {
                const StatusIcon = statusColors[app.status]?.icon || Clock;
                return (
                  <TableRow key={app.id}>
                    <TableCell style={{ color: '#E5EDFF' }} className="font-medium">
                      {app.business_name}
                    </TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>
                      <div className="text-sm">
                        <div>{app.contact_name}</div>
                        <div className="text-xs">{app.email}</div>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>{app.package}</TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>{app.duration_months} months</TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>{app.budget}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[app.status]?.bg} ${statusColors[app.status]?.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>
                      {new Date(app.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => rejectMutation.mutate(app.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="glass-card max-w-3xl" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Application Details</DialogTitle>
            <DialogDescription style={{ color: '#7A8BA6' }}>
              Review advertising application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Business Name</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.business_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Contact Name</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Email</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Phone</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Package</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.package}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Duration</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.duration_months} months</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Budget</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.budget}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>Status</p>
                  <Badge className={`${statusColors[selectedApplication.status]?.bg} ${statusColors[selectedApplication.status]?.text}`}>
                    {selectedApplication.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#7A8BA6' }}>Objectives</p>
                <p style={{ color: '#E5EDFF' }}>{selectedApplication.objectives}</p>
              </div>

              {selectedApplication.additional_info && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#7A8BA6' }}>Additional Info</p>
                  <p style={{ color: '#E5EDFF' }}>{selectedApplication.additional_info}</p>
                </div>
              )}

              {selectedApplication.flyer_url && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#7A8BA6' }}>Flyer</p>
                  <a
                    href={selectedApplication.flyer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Flyer
                  </a>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div>
                    <Label style={{ color: '#B6C4E0' }}>Landing Page Column Placement</Label>
                    <Select value={String(columnSelection)} onValueChange={(val) => setColumnSelection(Number(val))}>
                      <SelectTrigger className="glass-input mt-2" style={{ color: '#E5EDFF' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Column 1 (Left)</SelectItem>
                        <SelectItem value="2">Column 2 (Center)</SelectItem>
                        <SelectItem value="3">Column 3 (Right)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs mt-1" style={{ color: '#7A8BA6' }}>
                      Choose which column this ad will appear in on the landing page
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => approveMutation.mutate({ applicationId: selectedApplication.id, column: columnSelection })}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve Application'}
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate(selectedApplication.id)}
                      variant="destructive"
                      className="flex-1"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}