import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, Trash2, User, ChevronLeft, ChevronRight, Shield, Edit, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EditUserDialog from "./EditUserDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLE_CONFIG = {
  Admin: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)', icon: Shield },
  Editor: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)', icon: Edit },
  Viewer: { color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)', icon: Eye },
  User: { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', icon: User }
};

export default function UsersTable({ users }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setUserToDelete(null);
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.business_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone_number?.toLowerCase().includes(search) ||
      user.state?.toLowerCase().includes(search) ||
      user.country?.toLowerCase().includes(search) ||
      user.address?.toLowerCase().includes(search) ||
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl"
        style={{ background: '#fff', border: '2px solid #000' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Users</h2>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#666' }} />
            <Input
              placeholder="Search by username, business name, email, phone number, state, country, address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
              style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Photo</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Username</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Business Name</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>First Name</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Last Name</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Email</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Phone Number</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Country</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>State</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Address</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Biography</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Role</th>
                <th className="text-left py-4 px-3 text-sm font-semibold" style={{ color: '#000' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: '1px solid #ddd' }}
                >
                  <td className="py-4 px-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)' }}>
                      <User className="w-5 h-5" style={{ color: '#fff' }} />
                    </div>
                  </td>
                  <td className="py-4 px-3 text-sm font-medium" style={{ color: '#000' }}>
                    {user.username || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.business_name || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.first_name || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.last_name || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.email}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.phone_number || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.country || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm" style={{ color: '#000' }}>
                    {user.state || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm max-w-xs truncate" style={{ color: '#000' }}>
                    {user.address || 'N/A'}
                  </td>
                  <td className="py-4 px-3 text-sm max-w-xs truncate" style={{ color: '#000' }}>
                    {user.overview || 'N/A'}
                  </td>
                  <td className="py-4 px-3">
                    {(() => {
                      const role = user.platform_role || 'User';
                      const config = ROLE_CONFIG[role];
                      const RoleIcon = config?.icon || User;
                      return (
                        <Badge 
                          className="flex items-center gap-2 w-fit px-3 py-1"
                          style={{ 
                            background: config?.bgColor,
                            color: config?.color,
                            border: `1px solid ${config?.color}30`
                          }}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {role}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-blue-500/20"
                        style={{ color: '#3B82F6' }}
                        onClick={() => setUserToEdit(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-red-500/20"
                        style={{ color: '#EF4444' }}
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: '1px solid #000' }}>
          <p className="text-sm" style={{ color: '#666' }}>
            Page {currentPage} of {totalPages} ({filteredUsers.length} users)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="font-medium"
              style={{ color: '#000', borderColor: '#000' }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="font-medium"
              style={{ color: '#000', borderColor: '#000' }}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Edit User Dialog */}
      <EditUserDialog 
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent style={{
          background: 'rgba(15, 39, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E5EDFF'
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#E5EDFF' }}>Delete User</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#B6C4E0' }}>
              Are you sure you want to delete {userToDelete?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
              style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#fff' }}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}