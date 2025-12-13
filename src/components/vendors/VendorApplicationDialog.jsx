import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";

const serviceCategories = [
  "Accounting",
  "Legal Services",
  "Marketing",
  "IT Services",
  "Financial Services",
  "Construction",
  "Human Resources",
  "Franchise Agent",
  "Real Estate",
  "Consulting",
  "Other",
];

const provinces = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Prince Edward Island",
  "Newfoundland and Labrador",
];

export default function VendorApplicationDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    province: "",
    address: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Vendor application:", formData);
    // Reset form and close dialog
    setFormData({
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      category: "",
      province: "",
      address: "",
      description: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EA580C' }}>
              <Store className="w-5 h-5" style={{ color: '#fff' }} />
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
                <Label htmlFor="category" style={{ color: '#B6C4E0' }}>Service Category *</Label>
                <Select required value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="glass-input mt-1" style={{ color: '#E5EDFF' }}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" style={{ color: '#B6C4E0' }}>Business Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="glass-input mt-1 h-24"
                style={{ color: '#E5EDFF' }}
                placeholder="Tell us about your business and services..."
              />
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

            <div className="grid md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="website" style={{ color: '#B6C4E0' }}>Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>Location</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province" style={{ color: '#B6C4E0' }}>Province *</Label>
                <Select required value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
                  <SelectTrigger className="glass-input mt-1" style={{ color: '#E5EDFF' }}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address" style={{ color: '#B6C4E0' }}>Street Address *</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass-input mt-1"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
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
              style={{ background: '#EA580C', color: '#fff' }}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}