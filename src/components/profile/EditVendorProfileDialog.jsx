import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Plus } from "lucide-react";

export default function EditVendorProfileDialog({ vendor, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    tagline: vendor?.tagline || "",
    description: vendor?.description || "",
    unique_value: vendor?.unique_value || "",
    years_experience: vendor?.years_experience || "",
    specialties: vendor?.specialties || [],
    client_types: vendor?.client_types || [],
    certifications: vendor?.certifications || [],
    website: vendor?.website || "",
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newClientType, setNewClientType] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorApplication.update(vendor.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['approvedVendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-apps'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      setter("");
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: '#E5EDFF' }}>
            Edit Vendor Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Tagline (Max 60 characters)
            </label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              maxLength={60}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
              placeholder="Your unique selling proposition in one line"
            />
            <p className="text-xs mt-1" style={{ color: '#7A8BA6' }}>
              {formData.tagline.length}/60 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              About Your Business
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input h-32"
              style={{ color: '#E5EDFF' }}
              placeholder="Describe your business, services, and what you offer"
            />
          </div>

          {/* Unique Value */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Why Choose Us?
            </label>
            <Textarea
              value={formData.unique_value}
              onChange={(e) => setFormData({ ...formData, unique_value: e.target.value })}
              className="glass-input h-24"
              style={{ color: '#E5EDFF' }}
              placeholder="What makes your business unique? Why should clients choose you?"
            />
          </div>

          {/* Years Experience */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Years in Business
            </label>
            <Input
              type="number"
              value={formData.years_experience}
              onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
              placeholder="0"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Service Specialties
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('specialties', newSpecialty, setNewSpecialty))}
                className="glass-input flex-1"
                style={{ color: '#E5EDFF' }}
                placeholder="e.g., Tax Planning, Contract Negotiation"
              />
              <Button
                type="button"
                onClick={() => addItem('specialties', newSpecialty, setNewSpecialty)}
                className="rounded-lg"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(216, 161, 31, 0.2)', color: '#D8A11F' }}>
                  <span className="text-sm">{specialty}</span>
                  <button type="button" onClick={() => removeItem('specialties', idx)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Client Types */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Client Types You Serve
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('client_types', newClientType, setNewClientType))}
                className="glass-input flex-1"
                style={{ color: '#E5EDFF' }}
                placeholder="e.g., Small Businesses, Startups, Franchises"
              />
              <Button
                type="button"
                onClick={() => addItem('client_types', newClientType, setNewClientType)}
                className="rounded-lg"
                style={{ background: '#3B82F6', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.client_types.map((type, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                  <span className="text-sm">{type}</span>
                  <button type="button" onClick={() => removeItem('client_types', idx)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Certifications & Awards
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certifications', newCertification, setNewCertification))}
                className="glass-input flex-1"
                style={{ color: '#E5EDFF' }}
                placeholder="e.g., CPA, Certified Business Advisor"
              />
              <Button
                type="button"
                onClick={() => addItem('certifications', newCertification, setNewCertification)}
                className="rounded-lg"
                style={{ background: '#22C55E', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-sm" style={{ color: '#E5EDFF' }}>{cert}</span>
                  <button type="button" onClick={() => removeItem('certifications', idx)}>
                    <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
              Website
            </label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
              placeholder="https://yourbusiness.com"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 rounded-lg"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}