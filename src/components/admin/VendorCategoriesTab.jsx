import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VendorCategoriesTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    active: true,
  });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['vendorCategories'],
    queryFn: () => base44.entities.VendorCategory.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VendorCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VendorCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorCategories'] });
    },
  });

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        active: category.active !== false,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", icon: "", active: true });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "", active: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading categories...</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
              Vendor Categories
            </h2>
            <p className="text-sm mt-1" style={{ color: '#7A8BA6' }}>
              Manage categories for vendor applications
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#3B82F6] hover:bg-[#2563EB]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: '#B6C4E0' }}>Name</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Description</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Icon</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Status</TableHead>
                <TableHead style={{ color: '#B6C4E0' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell style={{ color: '#E5EDFF' }} className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell style={{ color: '#B6C4E0' }}>
                    {category.description || '—'}
                  </TableCell>
                  <TableCell style={{ color: '#B6C4E0' }}>
                    {category.icon || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={category.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {category.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this category?')) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="glass-card max-w-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium" style={{ color: '#B6C4E0' }}>
                Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1 glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: '#B6C4E0' }}>
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: '#B6C4E0' }}>
                Icon (lucide-react icon name)
              </label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., Store, Building, ShoppingBag"
                className="mt-1 glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm" style={{ color: '#B6C4E0' }}>
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}