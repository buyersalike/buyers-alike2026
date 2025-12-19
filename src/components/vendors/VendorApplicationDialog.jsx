import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Store, Upload, X, FileText, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const totalSteps = 5;
  const stepTitles = [
    "Business Info",
    "Contact Details",
    "Location",
    "Social Media",
    "Portfolio & Review"
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPortfolioUrl(file_url);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload portfolio. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.VendorApplication.create(data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your vendor application has been submitted successfully. We'll review it shortly.",
      });
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
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      });
      setUploadedFiles([]);
      setPortfolioUrl("");
      setCurrentStep(1);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && (!formData.businessName || !formData.category || !formData.description)) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && (!formData.contactName || !formData.email || !formData.phone)) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 3 && (!formData.province || !formData.address)) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a vendor application.",
        variant: "destructive",
      });
      return;
    }

    const applicationData = {
      business_name: formData.businessName,
      user_email: user.email,
      category: formData.category,
      province: formData.province,
      website: formData.website,
      social_media: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
      },
      portfolio_url: portfolioUrl,
      status: "pending"
    };

    submitMutation.mutate(applicationData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#E5EDFF' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EA580C' }}>
              <Store className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            Apply to Become a Vendor
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep > index + 1
                        ? 'bg-green-500'
                        : currentStep === index + 1
                        ? 'bg-[#EA580C]'
                        : 'bg-gray-600'
                    }`}
                    style={{ color: '#fff' }}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center" style={{ color: currentStep === index + 1 ? '#E5EDFF' : '#7A8BA6' }}>
                    {title}
                  </p>
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-2 rounded-full"
                    style={{ background: currentStep > index + 1 ? '#22C55E' : 'rgba(255, 255, 255, 0.1)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  Let's start with your business details. This helps us understand your offerings.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName" style={{ color: '#B6C4E0' }}>Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="glass-input mt-1"
                    style={{ color: '#E5EDFF' }}
                  />
                </div>

                <div>
                  <Label htmlFor="category" style={{ color: '#B6C4E0' }}>Service Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input mt-1 h-32"
                  style={{ color: '#E5EDFF' }}
                  placeholder="Tell us about your business and services..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  How can potential clients reach you?
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName" style={{ color: '#B6C4E0' }}>Contact Name *</Label>
                  <Input
                    id="contactName"
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
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  Where is your business located?
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province" style={{ color: '#B6C4E0' }}>Province *</Label>
                  <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
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
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="glass-input mt-1"
                    style={{ color: '#E5EDFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Social Media */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  Connect your social media profiles (optional but recommended).
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1877F2' }}>
                    <Facebook className="w-5 h-5" style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="facebook" style={{ color: '#B6C4E0' }}>Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      className="glass-input mt-1"
                      style={{ color: '#E5EDFF' }}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1DA1F2' }}>
                    <Twitter className="w-5 h-5" style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="twitter" style={{ color: '#B6C4E0' }}>Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="glass-input mt-1"
                      style={{ color: '#E5EDFF' }}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#0A66C2' }}>
                    <Linkedin className="w-5 h-5" style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="linkedin" style={{ color: '#B6C4E0' }}>LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="glass-input mt-1"
                      style={{ color: '#E5EDFF' }}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
                    <Instagram className="w-5 h-5" style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="instagram" style={{ color: '#B6C4E0' }}>Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="glass-input mt-1"
                      style={{ color: '#E5EDFF' }}
                      placeholder="https://instagram.com/yourbusiness"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Portfolio & Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                <p className="text-sm" style={{ color: '#E5EDFF' }}>
                  Upload your portfolio and review your application before submission.
                </p>
              </div>

              <div>
                <Label htmlFor="portfolio" style={{ color: '#B6C4E0' }}>Portfolio Upload (Optional)</Label>
                <p className="text-xs mb-2" style={{ color: '#7A8BA6' }}>
                  Upload a PDF showcasing your work, services, or case studies (Max 10MB)
                </p>
                
                {!portfolioUrl ? (
                  <label
                    htmlFor="portfolio"
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.18)', background: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2" style={{ color: '#EA580C' }} />
                      <p className="text-sm" style={{ color: '#B6C4E0' }}>
                        {uploading ? 'Uploading...' : 'Click to upload portfolio'}
                      </p>
                    </div>
                    <input
                      id="portfolio"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handlePortfolioUpload}
                      disabled={uploading}
                    />
                  </label>
                ) : (
                  <div 
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#22C55E' }}>
                        <FileText className="w-5 h-5" style={{ color: '#fff' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
                          Portfolio uploaded
                        </p>
                        <p className="text-xs" style={{ color: '#7A8BA6' }}>
                          Ready to submit
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setPortfolioUrl("")}
                      className="rounded-lg p-2"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Application Summary */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#E5EDFF' }}>Application Summary</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Business Name</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Category</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Contact Name</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.contactName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Email</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Phone</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>Province</p>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{formData.province || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                className="rounded-lg"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.18)' }}
              >
                Back
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.18)' }}
              >
                Cancel
              </Button>
            )}

            <div className="flex-1" />

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-lg px-8"
                style={{ background: '#EA580C', color: '#fff' }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="rounded-lg px-8"
                style={{ background: '#22C55E', color: '#fff' }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}