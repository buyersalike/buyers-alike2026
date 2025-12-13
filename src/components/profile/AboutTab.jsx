import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, MapPin, Calendar, Mail, Heart, Edit } from "lucide-react";

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
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>Overview</h2>
          {isOwnProfile && (
            <Button
              onClick={() => setShowEditDialog(true)}
              variant="ghost"
              size="icon"
              style={{ color: '#3B82F6' }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>

        {user.bio && (
          <div className="mb-6">
            <p className="text-lg" style={{ color: '#B6C4E0' }}>{user.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.title && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Title</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.title}</p>
                </div>
              </div>
            </div>
          )}

          {user.birth_date && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Born</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{new Date(user.birth_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {user.status && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Status</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.status}</p>
                </div>
              </div>
            </div>
          )}

          {user.location && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Lives in</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.location}</p>
                </div>
              </div>
            </div>
          )}

          {user.occupation && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Occupation</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.occupation}</p>
                </div>
              </div>
            </div>
          )}

          {user.business_name && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Business</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.business_name}</p>
                </div>
              </div>
            </div>
          )}

          {user.phone_number && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Phone</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.phone_number}</p>
                </div>
              </div>
            </div>
          )}

          {user.marital_status && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#7A8BA6' }}>Marital Status</p>
                  <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.marital_status}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <div>
                <p className="text-sm" style={{ color: '#7A8BA6' }}>Joined on</p>
                <p className="font-medium" style={{ color: '#E5EDFF' }}>{new Date(user.created_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" style={{ color: '#3B82F6' }} />
              <div>
                <p className="text-sm" style={{ color: '#7A8BA6' }}>Email</p>
                <p className="font-medium" style={{ color: '#E5EDFF' }}>{user.email}</p>
              </div>
            </div>
          </div>
        </div>
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