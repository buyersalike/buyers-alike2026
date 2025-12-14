import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMIN_ROLES, getRoleLabel, hasPermission } from "./adminPermissions";

export default function RoleManagement({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => 
      base44.asServiceRole.entities.User.update(userId, { admin_role: role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  // Only show admin users
  const adminUsers = users.filter(u => u.role === 'admin');

  const filteredUsers = adminUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      [ADMIN_ROLES.SUPER_ADMIN]: 'bg-red-500/20 text-red-300',
      [ADMIN_ROLES.USER_MANAGER]: 'bg-blue-500/20 text-blue-300',
      [ADMIN_ROLES.CONTENT_MANAGER]: 'bg-purple-500/20 text-purple-300',
      [ADMIN_ROLES.VENDOR_MANAGER]: 'bg-green-500/20 text-green-300',
      [ADMIN_ROLES.PARTNER_MANAGER]: 'bg-yellow-500/20 text-yellow-300',
    };
    return colors[role] || 'bg-gray-500/20 text-gray-300';
  };

  // Check if current user can manage roles
  const canManageRoles = hasPermission(currentUser?.admin_role, 'manageRoles');

  if (!canManageRoles) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A8BA6' }} />
        <p style={{ color: '#7A8BA6' }}>You don't have permission to manage roles</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
            Admin Role Management
          </h2>
          <p className="text-sm" style={{ color: '#7A8BA6' }}>
            Manage admin roles and permissions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
        <Input
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input pl-10"
          style={{ color: '#E5EDFF' }}
        />
      </div>

      {/* Admin Users Table */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="col-span-4">
            <span className="text-sm font-semibold" style={{ color: '#B6C4E0' }}>Name</span>
          </div>
          <div className="col-span-4">
            <span className="text-sm font-semibold" style={{ color: '#B6C4E0' }}>Email</span>
          </div>
          <div className="col-span-3">
            <span className="text-sm font-semibold" style={{ color: '#B6C4E0' }}>Admin Role</span>
          </div>
          <div className="col-span-1">
            <span className="text-sm font-semibold" style={{ color: '#B6C4E0' }}>Action</span>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div 
              key={user.id}
              className="grid grid-cols-12 gap-4 px-4 py-4 rounded-xl transition-all hover:bg-white/5"
              style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="col-span-4 flex items-center">
                <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
                  {user.full_name || 'N/A'}
                </p>
              </div>
              <div className="col-span-4 flex items-center">
                <p className="text-sm" style={{ color: '#B6C4E0' }}>
                  {user.email}
                </p>
              </div>
              <div className="col-span-3 flex items-center">
                {user.id === currentUser?.id ? (
                  <Badge className={getRoleBadgeColor(user.admin_role)}>
                    {getRoleLabel(user.admin_role || ADMIN_ROLES.SUPER_ADMIN)}
                  </Badge>
                ) : (
                  <Select
                    value={user.admin_role || ADMIN_ROLES.SUPER_ADMIN}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="glass-input h-8 text-xs" style={{ color: '#E5EDFF' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ADMIN_ROLES).map(role => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                {user.id === currentUser?.id && (
                  <span className="text-xs" style={{ color: '#7A8BA6' }}>(You)</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p style={{ color: '#7A8BA6' }}>No admin users found</p>
          </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="mt-8 p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#E5EDFF' }}>Role Descriptions</h3>
        <div className="space-y-3 text-sm" style={{ color: '#B6C4E0' }}>
          <div>
            <span className="font-semibold" style={{ color: '#EF4444' }}>Super Admin:</span> Full access to all sections and can manage other admin roles.
          </div>
          <div>
            <span className="font-semibold" style={{ color: '#3B82F6' }}>User Manager:</span> Manage users, view activity logs, and handle contact requests.
          </div>
          <div>
            <span className="font-semibold" style={{ color: '#7C3AED' }}>Content Manager:</span> Manage opportunities, interests, forum, categories, and professions.
          </div>
          <div>
            <span className="font-semibold" style={{ color: '#10B981' }}>Vendor Manager:</span> Manage vendor applications and vendor-related content.
          </div>
          <div>
            <span className="font-semibold" style={{ color: '#F59E0B' }}>Partner Manager:</span> Manage partnership-related content and connections.
          </div>
        </div>
      </div>
    </div>
  );
}