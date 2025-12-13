import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Link as LinkIcon, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PortfolioSection({ user, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: ""
  });
  const queryClient = useQueryClient();

  const updatePortfolioMutation = useMutation({
    mutationFn: (portfolio_links) => base44.auth.updateMe({ portfolio_links }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setFormData({ title: "", url: "", description: "" });
    },
  });

  const addPortfolioLink = () => {
    if (!formData.title.trim() || !formData.url.trim()) return;
    const currentLinks = user.portfolio_links || [];
    updatePortfolioMutation.mutate([...currentLinks, formData]);
  };

  const removePortfolioLink = (index) => {
    const currentLinks = user.portfolio_links || [];
    updatePortfolioMutation.mutate(currentLinks.filter((_, i) => i !== index));
  };

  const portfolio_links = user.portfolio_links || [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' }} />
            Portfolio & Projects
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(79, 172, 254, 0.15)', color: '#4FACFE', border: '1px solid rgba(79, 172, 254, 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          )}
        </div>

        {portfolio_links.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center" style={{ background: 'rgba(79, 172, 254, 0.05)' }}>
            <LinkIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#4FACFE', opacity: 0.5 }} />
            <p style={{ color: '#B6C4E0' }}>No portfolio links added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {portfolio_links.map((link, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-2xl group hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' }}
                    >
                      <LinkIcon className="w-5 h-5" style={{ color: '#E5EDFF' }} />
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePortfolioLink(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#E5EDFF' }}>{link.title}</h4>
                  {link.description && (
                    <p className="text-sm mb-3" style={{ color: '#B6C4E0' }}>{link.description}</p>
                  )}
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2 font-semibold hover:underline"
                    style={{ color: '#4FACFE' }}
                  >
                    Visit Project <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Add Portfolio Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., My SaaS Product"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>URL *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={addPortfolioLink}
              disabled={!formData.title.trim() || !formData.url.trim() || updatePortfolioMutation.isPending}
              style={{ background: '#4FACFE', color: '#fff' }}
            >
              {updatePortfolioMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}