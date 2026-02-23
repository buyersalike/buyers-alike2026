import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, User as UserIcon, BarChart3, Megaphone, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLES, PERMISSIONS } from "@/components/utils/permissions";

const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    icon: Shield,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  [ROLES.MANAGER]: {
    icon: Settings,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  [ROLES.ANALYST]: {
    icon: BarChart3,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  [ROLES.ADVERTISER]: {
    icon: Megaphone,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  [ROLES.USER]: {
    icon: UserIcon,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  }
};

export default function EditUserDialog({ user, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    country: '',
    state: '',
    role: 'user'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        phone_number: user.phone_number || '',
        country: user.country || '',
        state: user.state || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('updateUserAdmin', { userId: user.id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  if (!user) return null;

  const roleConfig = ROLE_CONFIG[formData.role];
  const rolePermissions = PERMISSIONS[formData.role];
  const RoleIcon = roleConfig?.icon || UserIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl"
        style={{
          background: 'rgba(15, 39, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E5EDFF'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-sm mb-1" style={{ color: '#7A8BA6' }}>Email</p>
            <p className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>{user.email}</p>
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block" style={{ color: '#B6C4E0' }}>
              Platform Role
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger className="glass-input h-14" style={{ color: '#E5EDFF' }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: roleConfig?.bgColor || 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${roleConfig?.borderColor || 'rgba(16, 185, 129, 0.3)'}`
                    }}
                  >
                    <RoleIcon className="w-5 h-5" style={{ color: roleConfig?.color || '#10B981' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-left">{rolePermissions?.label || formData.role}</p>
                    <p className="text-xs text-left" style={{ color: '#7A8BA6' }}>{rolePermissions?.description}</p>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {Object.keys(ROLE_CONFIG).map((role) => {
                  const config = ROLE_CONFIG[role];
                  const permissions = PERMISSIONS[role];
                  const Icon = config.icon;
                  return (
                    <SelectItem key={role} value={role} style={{ color: '#E5EDFF' }}>
                      <div className="flex items-center gap-3 py-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ 
                            background: config.bgColor,
                            border: `1px solid ${config.borderColor}`
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#E5EDFF' }}>{permissions.label}</p>
                          <p className="text-xs" style={{ color: '#7A8BA6' }}>{permissions.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                First Name
              </Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Last Name
              </Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
              Username
            </Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
              Phone Number
            </Label>
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Country
              </Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                State
              </Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              style={{ color: '#000', background: '#fff', borderColor: '#ccc' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}