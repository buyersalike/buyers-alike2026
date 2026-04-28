import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Award, Briefcase, Users, ExternalLink, Globe, Mail, Phone, Facebook, Twitter, Linkedin, Instagram, CheckCircle } from "lucide-react";

export default function VendorDetailDialog({ vendor, open, onOpenChange }) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: '#fff' }}>
        {/* Header */}
        <DialogHeader className="border-b pb-4" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-start gap-4">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" style={{ border: '1px solid #E5E7EB' }} />
            ) : (
              <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: '#D8A11F' }}>
                <Store className="w-10 h-10" style={{ color: '#fff' }} />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2" style={{ color: '#000' }}>
                {vendor.name}
              </DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#D8A11F', color: '#fff' }}>
                  {vendor.category}
                </div>
                {vendor.featured && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: '#FEF3C7', color: '#D8A11F' }}>
                    <CheckCircle className="w-3 h-3" />
                    Featured Vendor
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#666' }}>
                <MapPin className="w-4 h-4" />
                <span>{vendor.address}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Tagline */}
          {vendor.tagline && (
            <div className="p-4 rounded-xl" style={{ background: '#FEF3C7' }}>
              <p className="text-lg font-semibold text-center" style={{ color: '#000' }}>
                "{vendor.tagline}"
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {vendor.years_experience && (
              <div className="text-center p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
                <Briefcase className="w-6 h-6 mx-auto mb-2" style={{ color: '#D8A11F' }} />
                <p className="text-2xl font-bold mb-1" style={{ color: '#000' }}>{vendor.years_experience}+</p>
                <p className="text-xs" style={{ color: '#666' }}>Years Experience</p>
              </div>
            )}
            {vendor.certifications && vendor.certifications.length > 0 && (
              <div className="text-center p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
                <Award className="w-6 h-6 mx-auto mb-2" style={{ color: '#D8A11F' }} />
                <p className="text-2xl font-bold mb-1" style={{ color: '#000' }}>{vendor.certifications.length}</p>
                <p className="text-xs" style={{ color: '#666' }}>Certifications</p>
              </div>
            )}
            {vendor.client_types && vendor.client_types.length > 0 && (
              <div className="text-center p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#D8A11F' }} />
                <p className="text-2xl font-bold mb-1" style={{ color: '#000' }}>{vendor.client_types.length}</p>
                <p className="text-xs" style={{ color: '#666' }}>Client Types</p>
              </div>
            )}
          </div>

          {/* Description */}
          {vendor.description && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#000' }}>About Us</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                {vendor.description}
              </p>
            </div>
          )}

          {/* Unique Value */}
          {vendor.unique_value && (
            <div className="p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#000' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#D8A11F' }} />
                Why Choose Us?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                {vendor.unique_value}
              </p>
            </div>
          )}

          {/* Specialties */}
          {vendor.specialties && vendor.specialties.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#000' }}>Our Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.specialties.map((specialty, idx) => (
                  <div key={idx} className="px-4 py-2 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <span className="text-sm font-medium" style={{ color: '#000' }}>{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Types */}
          {vendor.client_types && vendor.client_types.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#000' }}>Clients We Serve</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.client_types.map((type, idx) => (
                  <div key={idx} className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: '#FEF3C7' }}>
                    <Users className="w-4 h-4" style={{ color: '#D8A11F' }} />
                    <span className="text-sm font-medium" style={{ color: '#000' }}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {vendor.certifications && vendor.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#000' }}>Certifications & Awards</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {vendor.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#F9FAFB' }}>
                    <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#D8A11F' }} />
                    <span className="text-sm" style={{ color: '#000' }}>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Social */}
          <div className="border-t pt-6" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              {vendor.website && (
                <Button 
                  onClick={() => window.open(vendor.website, '_blank')}
                  className="rounded-lg gap-2"
                  style={{ background: '#D8A11F', color: '#fff' }}
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </Button>
              )}
              {vendor.social_media?.linkedin && (
                <Button 
                  onClick={() => window.open(vendor.social_media.linkedin, '_blank')}
                  variant="outline"
                  className="rounded-lg gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              )}
              {vendor.social_media?.facebook && (
                <Button 
                  onClick={() => window.open(vendor.social_media.facebook, '_blank')}
                  variant="outline"
                  className="rounded-lg gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
              )}
              {vendor.social_media?.twitter && (
                <Button 
                  onClick={() => window.open(vendor.social_media.twitter, '_blank')}
                  variant="outline"
                  className="rounded-lg gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
              )}
              {vendor.social_media?.instagram && (
                <Button 
                  onClick={() => window.open(vendor.social_media.instagram, '_blank')}
                  variant="outline"
                  className="rounded-lg gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}