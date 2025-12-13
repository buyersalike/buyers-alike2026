import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Award, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CertificationsSection({ user, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    date: "",
    credential_url: ""
  });
  const queryClient = useQueryClient();

  const updateCertificationsMutation = useMutation({
    mutationFn: (certifications) => base44.auth.updateMe({ certifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setFormData({ name: "", issuer: "", date: "", credential_url: "" });
    },
  });

  const addCertification = () => {
    if (!formData.name.trim() || !formData.issuer.trim()) return;
    const currentCerts = user.certifications || [];
    updateCertificationsMutation.mutate([...currentCerts, formData]);
  };

  const removeCertification = (index) => {
    const currentCerts = user.certifications || [];
    updateCertificationsMutation.mutate(currentCerts.filter((_, i) => i !== index));
  };

  const certifications = user.certifications || [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)' }} />
            Certifications & Achievements
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(240, 147, 251, 0.15)', color: '#F093FB', border: '1px solid rgba(240, 147, 251, 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          )}
        </div>

        {certifications.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center" style={{ background: 'rgba(240, 147, 251, 0.05)' }}>
            <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#F093FB', opacity: 0.5 }} />
            <p style={{ color: '#B6C4E0' }}>No certifications added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {certifications.map((cert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-2xl group"
                >
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)' }}
                    >
                      <Award className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1" style={{ color: '#E5EDFF' }}>{cert.name}</h4>
                          <p className="text-sm font-semibold mb-2" style={{ color: '#F093FB' }}>{cert.issuer}</p>
                          {cert.date && (
                            <p className="text-xs mb-2" style={{ color: '#7A8BA6' }}>Issued: {cert.date}</p>
                          )}
                          {cert.credential_url && (
                            <a 
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 hover:underline"
                              style={{ color: '#3B82F6' }}
                            >
                              View Credential <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCertification(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Add Certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Certification Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., AWS Certified Solutions Architect"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Issuing Organization *</Label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g., Amazon Web Services"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Issue Date</Label>
              <Input
                type="month"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Credential URL</Label>
              <Input
                value={formData.credential_url}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                placeholder="https://..."
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={addCertification}
              disabled={!formData.name.trim() || !formData.issuer.trim() || updateCertificationsMutation.isPending}
              style={{ background: '#F093FB', color: '#fff' }}
            >
              {updateCertificationsMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}