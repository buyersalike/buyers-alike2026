import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, MapPin, Calendar, Mail, Heart, Edit, Building2, Phone, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import SkillsSection from "./SkillsSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import CertificationsSection from "./CertificationsSection";
import PortfolioSection from "./PortfolioSection";

export default function AboutTab({ user, isOwnProfile }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    bio: user.bio || '',
    title: user.title || '',
    location: user.location || '',
    status: user.status || '',
    birth_date: user.birth_date || '',
  });
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditDialog(false);
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <>
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#E5EDFF' }}>Overview</h2>
            <p className="text-sm" style={{ color: '#7A8BA6' }}>Personal and professional information</p>
          </div>
          {isOwnProfile && (
            <Button
              onClick={() => setShowEditDialog(true)}
              className="gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#667EEA', border: '1px solid rgba(102, 126, 234, 0.3)' }}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {user.bio && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl" 
            style={{ background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)' }}
          >
            <p className="text-lg leading-relaxed" style={{ color: '#E5EDFF' }}>{user.bio}</p>
          </motion.div>
        )}

        {/* Professional Information */}
        {(user.title || user.occupation || user.business_name) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#E5EDFF' }}>
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }} />
              Professional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.title && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                      <Briefcase className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#667EEA' }}>Title</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.title}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {user.occupation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' }}>
                      <UserIcon className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#43E97B' }}>Occupation</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.occupation}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {user.business_name && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)' }}>
                      <Building2 className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#2BD2FF' }}>Business</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.business_name}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Personal Information */}
        {(user.birth_date || user.status || user.marital_status) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#E5EDFF' }}>
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)' }} />
              Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.birth_date && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)' }}>
                      <Calendar className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#F093FB' }}>Birth Date</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{new Date(user.birth_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {user.status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)' }}>
                      <Heart className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#FA709A' }}>Status</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.status}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {user.marital_status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card p-6 rounded-2xl cursor-pointer"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #FFA8A8 0%, #FCFF00 100%)' }}>
                      <Heart className="w-6 h-6" style={{ color: '#0A1628' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#FFA8A8' }}>Marital Status</p>
                      <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.marital_status}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Contact & Location */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' }} />
            Contact & Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.location && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-6 rounded-2xl cursor-pointer"
                style={{ transition: 'all 0.3s ease' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' }}>
                    <MapPin className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#4FACFE' }}>Location</p>
                    <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.location}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {user.phone_number && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-6 rounded-2xl cursor-pointer"
                style={{ transition: 'all 0.3s ease' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)' }}>
                    <Phone className="w-6 h-6" style={{ color: '#0A1628' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#A8EDEA' }}>Phone</p>
                    <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.phone_number}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 rounded-2xl cursor-pointer"
              style={{ transition: 'all 0.3s ease' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
                  <Mail className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#667EEA' }}>Email</p>
                  <p className="text-lg font-semibold break-all" style={{ color: '#E5EDFF' }}>{user.email}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Member Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #FCCB90 0%, #D57EEB 100%)' }} />
            Membership
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 rounded-2xl cursor-pointer"
              style={{ transition: 'all 0.3s ease' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #FCCB90 0%, #D57EEB 100%)' }}>
                  <Calendar className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#FCCB90' }}>Member Since</p>
                  <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{new Date(user.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Skills Section */}
        <SkillsSection user={user} isOwnProfile={isOwnProfile} />

        {/* Experience Section */}
        <ExperienceSection user={user} isOwnProfile={isOwnProfile} />

        {/* Education Section */}
        <EducationSection user={user} isOwnProfile={isOwnProfile} />

        {/* Certifications Section */}
        <CertificationsSection user={user} isOwnProfile={isOwnProfile} />

        {/* Portfolio Section */}
        <PortfolioSection user={user} isOwnProfile={isOwnProfile} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#B6C4E0' }}>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <Label style={{ color: '#B6C4E0' }}>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#B6C4E0' }}>Status</Label>
                <Input
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <Label style={{ color: '#B6C4E0' }}>Birth Date</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowEditDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              style={{ background: '#3B82F6', color: '#fff' }}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}