import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Edit2, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditVendorProfileDialog from "./EditVendorProfileDialog";

export default function VendorProfileSection({ userEmail }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendorProfile, isLoading } = useQuery({
    queryKey: ['vendorProfile', userEmail],
    queryFn: async () => {
      const vendors = await base44.entities.VendorApplication.filter({ 
        user_email: userEmail,
        status: 'approved'
      });
      return vendors[0] || null;
    },
    enabled: !!userEmail,
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <p style={{ color: '#B6C4E0' }}>Loading vendor profile...</p>
      </div>
    );
  }

  if (!vendorProfile) {
    return null;
  }

  return (
    <>
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8A11F' }}>
              <Store className="w-6 h-6" style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#E5EDFF' }}>Vendor Profile</h3>
              <p className="text-sm" style={{ color: '#7A8BA6' }}>{vendorProfile.business_name}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowEditDialog(true)}
            className="gap-2"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        <div className="space-y-4">
          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Category</label>
              <p style={{ color: '#E5EDFF' }}>{vendorProfile.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Location</label>
              <p style={{ color: '#E5EDFF' }}>{vendorProfile.province}, Canada</p>
            </div>
          </div>

          {/* Tagline */}
          {vendorProfile.tagline && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Tagline</label>
              <p style={{ color: '#E5EDFF' }}>"{vendorProfile.tagline}"</p>
            </div>
          )}

          {/* Description */}
          {vendorProfile.description && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>About</label>
              <p className="text-sm" style={{ color: '#E5EDFF' }}>{vendorProfile.description}</p>
            </div>
          )}

          {/* Unique Value */}
          {vendorProfile.unique_value && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Why Choose Us</label>
              <p className="text-sm" style={{ color: '#E5EDFF' }}>{vendorProfile.unique_value}</p>
            </div>
          )}

          {/* Years Experience */}
          {vendorProfile.years_experience && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Years in Business</label>
              <p style={{ color: '#E5EDFF' }}>{vendorProfile.years_experience} years</p>
            </div>
          )}

          {/* Specialties */}
          {vendorProfile.specialties && vendorProfile.specialties.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>Specialties</label>
              <div className="flex flex-wrap gap-2">
                {vendorProfile.specialties.map((specialty, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(216, 161, 31, 0.2)', color: '#D8A11F' }}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Client Types */}
          {vendorProfile.client_types && vendorProfile.client_types.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>Client Types</label>
              <div className="flex flex-wrap gap-2">
                {vendorProfile.client_types.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {vendorProfile.certifications && vendorProfile.certifications.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>Certifications & Awards</label>
              <div className="space-y-1">
                {vendorProfile.certifications.map((cert, idx) => (
                  <div key={idx} className="text-sm" style={{ color: '#E5EDFF' }}>• {cert}</div>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {vendorProfile.website && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: '#B6C4E0' }}>Website</label>
              <a href={vendorProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: '#3B82F6' }}>
                {vendorProfile.website}
              </a>
            </div>
          )}
        </div>
      </div>

      <EditVendorProfileDialog
        vendor={vendorProfile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}