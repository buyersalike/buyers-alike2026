import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Megaphone, Upload, X, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const advertisingPackages = [
  "Featured Listing - $299/month",
  "Premium Placement - $499/month",
  "Sponsored Content - $799/month",
  "Custom Package - Contact Us",
];

export default function AdvertiseApplicationDialog({ open, onOpenChange }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userVendorApp, setUserVendorApp] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    package: "",
    durationMonths: 1,
    objectives: "",
    budget: "",
    additionalInfo: "",
    targetAudience: "",
    campaignGoals: [],
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [flyerUrl, setFlyerUrl] = useState("");

  const totalSteps = 4;
  const stepTitles = [
    "Business Info",
    "Campaign Goals",
    "Targeting & Budget",
    "Creative & Review"
  ];

  const campaignGoalOptions = [
    "Brand Awareness",
    "Lead Generation",
    "Website Traffic",
    "Sales/Conversions",
    "Partnership Opportunities"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Check if user has an approved vendor application
      const vendorApps = await base44.entities.VendorApplication.filter({ 
        user_email: user.email,
        status: "approved"
      });
      
      if (vendorApps.length > 0) {
        const vendorApp = vendorApps[0];
        setUserVendorApp(vendorApp);
        setIsVendor(true);
        setFormData(prev => ({
          ...prev,
          businessName: vendorApp.business_name || "",
          email: user.email
        }));
      }
    };
    
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFlyerUrl(file_url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFlyerUrl("");
  };

  const submitApplicationMutation = useMutation({
    mutationFn: (data) => base44.entities.AdvertiseApplication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertise-applications'] });
      setFormData({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        package: "",
        durationMonths: 1,
        objectives: "",
        budget: "",
        additionalInfo: "",
        targetAudience: "",
        campaignGoals: [],
      });
      setUploadedFile(null);
      setFlyerUrl("");
      setCurrentStep(1);
      onOpenChange(false);
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && (!formData.businessName || !formData.contactName || !formData.email || !formData.phone)) {
      alert("Please fill in all required fields.");
      return;
    }
    if (currentStep === 2 && (formData.campaignGoals.length === 0 || !formData.objectives)) {
      alert("Please select at least one campaign goal and describe your objectives.");
      return;
    }
    if (currentStep === 3 && (!formData.package || !formData.budget)) {
      alert("Please fill in all required fields.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleCampaignGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      campaignGoals: prev.campaignGoals.includes(goal)
        ? prev.campaignGoals.filter(g => g !== goal)
        : [...prev.campaignGoals, goal]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isVendor) {
      alert("You must be an approved vendor to advertise. Please apply to become a vendor first.");
      return;
    }

    submitApplicationMutation.mutate({
      business_name: formData.businessName,
      user_email: currentUser.email,
      vendor_id: userVendorApp.vendor_id,
      contact_name: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      package: formData.package,
      duration_months: parseInt(formData.durationMonths),
      budget: formData.budget,
      objectives: formData.objectives,
      additional_info: formData.additionalInfo,
      flyer_url: flyerUrl,
      status: "pending"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: '#F2F1F5', border: '1px solid #000' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#000' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#D8A11F' }}>
              <Megaphone className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            Create Ad Campaign
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
                        ? 'bg-[#D8A11F]'
                        : 'bg-gray-400'
                    }`}
                    style={{ color: '#fff' }}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center" style={{ color: currentStep === index + 1 ? '#000' : '#666' }}>
                    {title}
                  </p>
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-2 rounded-full"
                    style={{ background: currentStep > index + 1 ? '#22C55E' : '#E5E7EB' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep < totalSteps) {
              e.preventDefault();
              handleNext();
            }
          }}
          className="space-y-6"
        >
          {/* Vendor Status Alert */}
          {!isVendor && (
            <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: '#FEE2E2', border: '1px solid #EF4444' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#EF4444' }}>Vendor Status Required</p>
                <p className="text-sm" style={{ color: '#991B1B' }}>
                  You must be an approved vendor to advertise. Please apply to become a vendor first.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                <p className="text-sm" style={{ color: '#000' }}>
                  Let's start with your business details to set up your advertising campaign.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName" style={{ color: '#000' }}>Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="mt-1 rounded-xl"
                    style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  />
                </div>

                <div>
                  <Label htmlFor="vendorId" style={{ color: '#000' }}>Vendor ID</Label>
                  <Input
                    id="vendorId"
                    value={userVendorApp?.vendor_id || "Not available"}
                    disabled
                    className="mt-1 opacity-70 rounded-xl"
                    style={{ color: isVendor ? '#22C55E' : '#666', background: '#F9FAFB', border: '1px solid #000' }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName" style={{ color: '#000' }}>Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="mt-1 rounded-xl"
                    style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  />
                </div>

                <div>
                  <Label htmlFor="email" style={{ color: '#000' }}>Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 rounded-xl"
                    style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" style={{ color: '#000' }}>Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Campaign Goals */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                <p className="text-sm" style={{ color: '#000' }}>
                  What are your primary goals for this advertising campaign?
                </p>
              </div>

              <div>
                <Label style={{ color: '#000' }}>Campaign Goals * (Select all that apply)</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {campaignGoalOptions.map((goal) => (
                    <div
                      key={goal}
                      onClick={() => toggleCampaignGoal(goal)}
                      className="p-4 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: formData.campaignGoals.includes(goal) ? '#FEF3C7' : '#fff',
                        border: `2px solid ${formData.campaignGoals.includes(goal) ? '#D8A11F' : '#000'}`,
                      }}
                    >
                      <p className="font-medium" style={{ color: '#000' }}>{goal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="objectives" style={{ color: '#000' }}>Specific Objectives *</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="mt-1 h-32 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  placeholder="Describe what you want to achieve with this campaign..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Targeting & Budget */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl mb-4" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                <p className="text-sm" style={{ color: '#000' }}>
                  Define your target audience and budget allocation.
                </p>
              </div>

              <div>
                <Label htmlFor="targetAudience" style={{ color: '#000' }}>Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="mt-1 h-24 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  placeholder="Describe your ideal audience (e.g., entrepreneurs in tech, small business owners...)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="package" style={{ color: '#000' }}>Advertising Package *</Label>
                  <Select value={formData.package} onValueChange={(value) => setFormData({ ...formData, package: value })}>
                    <SelectTrigger className="mt-1 rounded-xl" style={{ color: '#000', background: '#fff', border: '1px solid #000' }}>
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
                  <Label htmlFor="budget" style={{ color: '#000' }}>Monthly Budget *</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1 rounded-xl"
                    style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                    placeholder="$500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration" style={{ color: '#000' }}>Campaign Duration (months) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                  className="mt-1 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                />
                <p className="text-xs mt-1" style={{ color: '#666' }}>
                  Campaign starts when approved. Minimum 1 month.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Creative & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl mb-4" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                <p className="text-sm" style={{ color: '#000' }}>
                  Upload your creative assets and review your campaign details.
                </p>
              </div>

              <div>
                <Label htmlFor="flyer" style={{ color: '#000' }}>Upload Advertising Creative</Label>
                <p className="text-xs mb-2" style={{ color: '#666' }}>
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
                
                {!uploadedFile ? (
                  <label
                    htmlFor="flyer"
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50"
                    style={{ borderColor: '#000', background: '#fff' }}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2" style={{ color: '#D8A11F' }} />
                      <p className="text-sm" style={{ color: '#000' }}>
                        Click to upload your ad creative
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
                    style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#D8A11F' }}>
                        <Upload className="w-5 h-5" style={{ color: '#fff' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#000' }}>
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs" style={{ color: '#666' }}>
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRemoveFile}
                      className="rounded-lg p-2"
                      style={{ background: '#FEE2E2', color: '#EF4444', border: '1px solid #EF4444' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="additionalInfo" style={{ color: '#000' }}>Additional Notes</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  className="mt-1 h-20 rounded-xl"
                  style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                  placeholder="Any special requests or additional information..."
                />
              </div>

              {/* Campaign Summary */}
              <div className="p-6 rounded-xl space-y-4" style={{ background: '#fff', border: '1px solid #000' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#000' }}>Campaign Summary</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: '#666' }}>Business</p>
                    <p className="text-sm font-medium" style={{ color: '#000' }}>{formData.businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#666' }}>Package</p>
                    <p className="text-sm font-medium" style={{ color: '#000' }}>{formData.package || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#666' }}>Budget</p>
                    <p className="text-sm font-medium" style={{ color: '#000' }}>{formData.budget || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#666' }}>Duration</p>
                    <p className="text-sm font-medium" style={{ color: '#000' }}>{formData.durationMonths} month(s)</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs" style={{ color: '#666' }}>Campaign Goals</p>
                    <p className="text-sm font-medium" style={{ color: '#000' }}>
                      {formData.campaignGoals.length > 0 ? formData.campaignGoals.join(', ') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t" style={{ borderColor: '#000' }}>
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                className="rounded-lg"
                style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
              >
                Back
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg"
                style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
              >
                Cancel
              </Button>
            )}

            <div className="flex-1" />

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isVendor}
                className="rounded-lg px-8"
                style={{ background: '#D8A11F', color: '#fff', opacity: !isVendor ? 0.5 : 1 }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isVendor || submitApplicationMutation.isPending || uploading}
                className="rounded-lg px-8"
                style={{ background: '#D8A11F', color: '#fff', opacity: !isVendor ? 0.5 : 1 }}
              >
                {submitApplicationMutation.isPending ? "Submitting..." : "Launch Campaign"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}