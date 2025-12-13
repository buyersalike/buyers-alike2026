import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Megaphone, Upload, X } from "lucide-react";

const advertisingPackages = [
  "Featured Listing - $299/month",
  "Premium Placement - $499/month",
  "Sponsored Content - $799/month",
  "Custom Package - Contact Us",
];

export default function AdvertiseApplicationDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    currentVendorId: "",
    package: "",
    objectives: "",
    budget: "",
    additionalInfo: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Advertising application:", formData);
    console.log("Uploaded flyer:", uploadedFile);
    setFormData({
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      currentVendorId: "",
      package: "",
      objectives: "",
      budget: "",
      additionalInfo: "",
    });
    setUploadedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366F1' }}>
              <Megaphone className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            Apply to Advertise
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>Business Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName" style={{ color: '#B6C4E0' }}>Business Name *</Label>
                <Input
                  id="businessName"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                />
              </div>

              <div>
                <Label htmlFor="currentVendorId" style={{ color: '#B6C4E0' }}>Current Vendor ID (if applicable)</Label>
                <Input
                  id="currentVendorId"
                  value={formData.currentVendorId}
                  onChange={(e) => setFormData({ ...formData, currentVendorId: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                  placeholder="V-12345"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName" style={{ color: '#B6C4E0' }}>Contact Name *</Label>
                <Input
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                />
              </div>

              <div>
                <Label htmlFor="email" style={{ color: '#B6C4E0' }}>Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" style={{ color: '#B6C4E0' }}>Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input mt-1"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>

          {/* Advertising Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>Advertising Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package" style={{ color: '#B6C4E0' }}>Advertising Package *</Label>
                <Select required value={formData.package} onValueChange={(value) => setFormData({ ...formData, package: value })}>
                  <SelectTrigger className="glass-input mt-1" style={{ color: '#E5EDFF' }}>
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {advertisingPackages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget" style={{ color: '#B6C4E0' }}>Monthly Budget</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                  placeholder="$500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="objectives" style={{ color: '#B6C4E0' }}>Advertising Objectives *</Label>
              <Textarea
                id="objectives"
                required
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="glass-input mt-1 h-24"
                style={{ color: '#E5EDFF' }}
                placeholder="What do you hope to achieve with advertising?"
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo" style={{ color: '#B6C4E0' }}>Additional Information</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="glass-input mt-1 h-20"
                style={{ color: '#E5EDFF' }}
                placeholder="Any other details you'd like to share..."
              />
            </div>

            <div>
              <Label htmlFor="flyer" style={{ color: '#B6C4E0' }}>Upload Advertising Flyer</Label>
              <p className="text-xs mb-2" style={{ color: '#7A8BA6' }}>
                Accepted formats: JPG, PNG, PDF (Max 5MB)
              </p>
              
              {!uploadedFile ? (
                <label
                  htmlFor="flyer"
                  className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.18)', background: 'rgba(255, 255, 255, 0.03)' }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2" style={{ color: '#6366F1' }} />
                    <p className="text-sm" style={{ color: '#B6C4E0' }}>
                      Click to upload or drag and drop
                    </p>
                  </div>
                  <input
                    id="flyer"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#6366F1' }}>
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
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.18)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg"
              style={{ background: '#6366F1', color: '#fff' }}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}