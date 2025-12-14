import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export default function CreateOpportunityDialog({ open, onOpenChange, userEmail }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    investment_min: "",
    investment_max: "",
    image_url: "",
    source_url: "",
    related_interests: []
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fetch user's approved interests
  const { data: userInterests = [] } = useQuery({
    queryKey: ['user-interests', userEmail],
    queryFn: () => base44.entities.Interest.filter({ user_email: userEmail, status: 'approved' }),
    enabled: open,
  });

  const createOpportunityMutation = useMutation({
    mutationFn: (data) => base44.entities.Opportunity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      resetForm();
      onOpenChange(false);
    },
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData(prev => ({ ...prev, image_url: file_url }));
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const toggleInterest = (interestName) => {
    setFormData(prev => ({
      ...prev,
      related_interests: prev.related_interests.includes(interestName)
        ? prev.related_interests.filter(i => i !== interestName)
        : [...prev.related_interests, interestName]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      investment_min: "",
      investment_max: "",
      image_url: "",
      source_url: "",
      related_interests: []
    });
    setUploadedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOpportunityMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      investment_min: formData.investment_min ? parseFloat(formData.investment_min) : undefined,
      investment_max: formData.investment_max ? parseFloat(formData.investment_max) : undefined,
      image_url: formData.image_url,
      source_url: formData.source_url,
      status: "pending",
      creator_email: userEmail,
      related_interests: formData.related_interests
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
              <Plus className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            Create New Opportunity
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Information */}
          <div>
            <Label htmlFor="title" style={{ color: '#B6C4E0' }}>Opportunity Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input mt-2"
              style={{ color: '#E5EDFF' }}
              placeholder="e.g., 1-800-GOT-JUNK? Franchise Opportunity"
            />
          </div>

          <div>
            <Label htmlFor="description" style={{ color: '#B6C4E0' }}>Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input mt-2 h-24"
              style={{ color: '#E5EDFF' }}
              placeholder="Describe the opportunity in detail..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" style={{ color: '#B6C4E0' }}>Category *</Label>
              <Select required value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="glass-input mt-2" style={{ color: '#E5EDFF' }}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Franchises">Franchises</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Acquisition">Acquisition</SelectItem>
                  <SelectItem value="Joint Venture">Joint Venture</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source_url" style={{ color: '#B6C4E0' }}>Source URL</Label>
              <Input
                id="source_url"
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                placeholder="https://example.com/franchise"
              />
            </div>
          </div>

          {/* Investment Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investment_min" style={{ color: '#B6C4E0' }}>Minimum Investment ($)</Label>
              <Input
                id="investment_min"
                type="number"
                value={formData.investment_min}
                onChange={(e) => setFormData({ ...formData, investment_min: e.target.value })}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="investment_max" style={{ color: '#B6C4E0' }}>Maximum Investment ($)</Label>
              <Input
                id="investment_max"
                type="number"
                value={formData.investment_max}
                onChange={(e) => setFormData({ ...formData, investment_max: e.target.value })}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                placeholder="250000"
              />
            </div>
          </div>

          {/* Related Interests */}
          {userInterests.length > 0 && (
            <div>
              <Label style={{ color: '#B6C4E0' }}>Related Interests (Optional)</Label>
              <p className="text-xs mb-2" style={{ color: '#7A8BA6' }}>
                Select interests this opportunity relates to
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {userInterests.map(interest => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.interest_name)}
                    className="px-3 py-1 rounded-lg text-sm transition-all"
                    style={{
                      background: formData.related_interests.includes(interest.interest_name)
                        ? 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid ' + (formData.related_interests.includes(interest.interest_name)
                        ? 'rgba(59, 130, 246, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)'),
                      color: '#E5EDFF'
                    }}
                  >
                    {interest.interest_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <Label htmlFor="image" style={{ color: '#B6C4E0' }}>Opportunity Image</Label>
            <p className="text-xs mb-2" style={{ color: '#7A8BA6' }}>
              Accepted formats: JPG, PNG (Max 5MB)
            </p>
            
            {!uploadedFile ? (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.18)', background: 'rgba(255, 255, 255, 0.03)' }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2" style={{ color: '#3B82F6' }} />
                  <p className="text-sm" style={{ color: '#B6C4E0' }}>
                    Click to upload or drag and drop
                  </p>
                </div>
                <input
                  id="image"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div 
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#3B82F6' }}>
                    <Upload className="w-5 h-5" style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleRemoveFile}
                  className="rounded-lg p-2"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="flex-1 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.18)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOpportunityMutation.isPending || uploading}
              className="flex-1 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
            >
              {createOpportunityMutation.isPending ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}