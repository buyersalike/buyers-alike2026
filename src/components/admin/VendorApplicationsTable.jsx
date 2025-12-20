import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Eye, Search, Star, Award, Briefcase, Users, Globe, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export default function VendorApplicationsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['vendorApplications'],
    queryFn: () => base44.entities.VendorApplication.list('-created_date'),
  });

  const approveMutation = useMutation({
    mutationFn: async (applicationId) => {
      const vendorId = `vendor_${Date.now()}`;
      await base44.entities.VendorApplication.update(applicationId, {
        status: 'approved',
        vendor_id: vendorId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorApplications'] });
      setSelectedApplication(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (applicationId) =>
      base44.entities.VendorApplication.update(applicationId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorApplications'] });
      setSelectedApplication(null);
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ appId, featured }) => 
      base44.entities.VendorApplication.update(appId, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorApplications'] });
    },
  });

  const filteredApplications = applications.filter(app =>
    app.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading vendor applications...</p>
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
              Vendor Applications
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
                <TableHead style={{ color: '#B6C4E0' }}>Email</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Category</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Province</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Status</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Featured</TableHead>
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
                    <TableCell style={{ color: '#B6C4E0' }}>{app.user_email}</TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>{app.category}</TableCell>
                    <TableCell style={{ color: '#B6C4E0' }}>{app.province}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[app.status]?.bg} ${statusColors[app.status]?.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.status === 'approved' && (
                        <Button
                          size="sm"
                          variant={app.featured ? "default" : "outline"}
                          onClick={() => toggleFeaturedMutation.mutate({ appId: app.id, featured: !app.featured })}
                          disabled={toggleFeaturedMutation.isPending}
                          className={app.featured ? 'bg-[#D8A11F] hover:bg-[#C2941B]' : ''}
                        >
                          <Star className="w-3 h-3 mr-1" fill={app.featured ? 'currentColor' : 'none'} />
                          {app.featured ? 'Featured' : 'Feature'}
                        </Button>
                      )}
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
                              onClick={() => approveMutation.mutate(app.id)}
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
        <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: '#E5EDFF' }}>Application Details</DialogTitle>
            <DialogDescription style={{ color: '#7A8BA6' }}>
              Review complete vendor application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#E5EDFF' }}>
                  <Briefcase className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Business Name</p>
                    <p className="font-semibold" style={{ color: '#E5EDFF' }}>{selectedApplication.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Email</p>
                    <p style={{ color: '#E5EDFF' }}>{selectedApplication.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Category</p>
                    <p style={{ color: '#E5EDFF' }}>{selectedApplication.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Province</p>
                    <p style={{ color: '#E5EDFF' }}>{selectedApplication.province}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Status</p>
                    <Badge className={`${statusColors[selectedApplication.status]?.bg} ${statusColors[selectedApplication.status]?.text}`}>
                      {selectedApplication.status}
                    </Badge>
                  </div>
                  {selectedApplication.years_experience && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#7A8BA6' }}>Years in Business</p>
                      <p style={{ color: '#E5EDFF' }}>{selectedApplication.years_experience} years</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tagline */}
              {selectedApplication.tagline && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(216, 161, 31, 0.1)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#7A8BA6' }}>Tagline / USP</p>
                  <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>"{selectedApplication.tagline}"</p>
                </div>
              )}

              {/* Description */}
              {selectedApplication.description && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#7A8BA6' }}>Business Description</p>
                  <p className="leading-relaxed" style={{ color: '#E5EDFF' }}>{selectedApplication.description}</p>
                </div>
              )}

              {/* Unique Value */}
              {selectedApplication.unique_value && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#7A8BA6' }}>
                    <CheckCircle className="w-4 h-4" />
                    Why Choose This Vendor?
                  </p>
                  <p className="leading-relaxed" style={{ color: '#E5EDFF' }}>{selectedApplication.unique_value}</p>
                </div>
              )}

              {/* Specialties */}
              {selectedApplication.specialties && selectedApplication.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#7A8BA6' }}>Service Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.specialties.map((specialty, idx) => (
                      <div key={idx} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(216, 161, 31, 0.2)', color: '#D8A11F' }}>
                        {specialty}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Types */}
              {selectedApplication.client_types && selectedApplication.client_types.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#7A8BA6' }}>
                    <Users className="w-4 h-4" />
                    Client Types Served
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.client_types.map((type, idx) => (
                      <div key={idx} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selectedApplication.certifications && selectedApplication.certifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#7A8BA6' }}>
                    <Award className="w-4 h-4" />
                    Certifications & Awards
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {selectedApplication.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                        <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
                        <span style={{ color: '#E5EDFF' }}>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website & Portfolio */}
              {(selectedApplication.website || selectedApplication.portfolio_url) && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#7A8BA6' }}>
                    <Globe className="w-4 h-4" />
                    Online Presence
                  </p>
                  <div className="space-y-2">
                    {selectedApplication.website && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: '#7A8BA6' }}>Website</p>
                        <a 
                          href={selectedApplication.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline"
                          style={{ color: '#3B82F6' }}
                        >
                          {selectedApplication.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {selectedApplication.portfolio_url && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: '#7A8BA6' }}>Portfolio</p>
                        <a 
                          href={selectedApplication.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline"
                          style={{ color: '#3B82F6' }}
                        >
                          View Portfolio Document
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {selectedApplication.social_media && Object.values(selectedApplication.social_media).some(v => v) && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: '#7A8BA6' }}>Social Media</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedApplication.social_media.facebook && (
                      <a href={selectedApplication.social_media.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                        Facebook <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApplication.social_media.twitter && (
                      <a href={selectedApplication.social_media.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                        Twitter <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApplication.social_media.linkedin && (
                      <a href={selectedApplication.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApplication.social_media.instagram && (
                      <a href={selectedApplication.social_media.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                        Instagram <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Application Metadata */}
              <div className="pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: '#7A8BA6' }}>Application Date</p>
                    <p style={{ color: '#E5EDFF' }}>{new Date(selectedApplication.created_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{ color: '#7A8BA6' }}>Vendor ID</p>
                    <p style={{ color: '#E5EDFF' }}>{selectedApplication.vendor_id || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => approveMutation.mutate(selectedApplication.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(selectedApplication.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}