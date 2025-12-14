import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoryManagementTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", slug: "" });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", slug: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: "", description: "", slug: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description, slug: category.slug });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    updateMutation.mutate({ id: selectedCategory.id, data: formData });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p style={{ color: '#7A8BA6' }}>Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
          Opportunity Categories
        </h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-xl"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Category
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#E5EDFF' }}>
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#E5EDFF' }}>
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#E5EDFF' }}>
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#E5EDFF' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4" style={{ color: '#E5EDFF' }}>
                    {category.name}
                  </td>
                  <td className="px-6 py-4" style={{ color: '#B6C4E0' }}>
                    {category.description}
                  </td>
                  <td className="px-6 py-4" style={{ color: '#7A8BA6' }}>
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(category)}
                        size="sm"
                        className="rounded-lg"
                        style={{ background: '#3B82F6', color: '#fff' }}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(category.id)}
                        size="sm"
                        className="rounded-lg"
                        style={{ background: '#EF4444', color: '#fff' }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && (
            <div className="p-12 text-center">
              <p style={{ color: '#7A8BA6' }}>No categories found. Create your first category to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-card border-0 sm:max-w-md" style={{ color: '#E5EDFF' }}>
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#E5EDFF' }}>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ ...formData, name, slug: generateSlug(name) });
                }}
                placeholder="Category name"
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={4}
                className="glass-input resize-none"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(false)}
              variant="outline"
              className="glass-input"
              style={{ color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-0 sm:max-w-md" style={{ color: '#E5EDFF' }}>
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: '#E5EDFF' }}>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={4}
                className="glass-input resize-none"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: '#B6C4E0' }}>
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="glass-input"
              style={{ color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}