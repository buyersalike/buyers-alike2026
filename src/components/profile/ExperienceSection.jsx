import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ExperienceSection({ user, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: ""
  });
  const queryClient = useQueryClient();

  const updateExperienceMutation = useMutation({
    mutationFn: (experience) => base44.auth.updateMe({ experience }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setFormData({ title: "", company: "", start_date: "", end_date: "", description: "" });
    },
  });

  const addExperience = () => {
    if (!formData.title.trim() || !formData.company.trim()) return;
    const currentExperience = user.experience || [];
    updateExperienceMutation.mutate([...currentExperience, formData]);
  };

  const removeExperience = (index) => {
    const currentExperience = user.experience || [];
    updateExperienceMutation.mutate(currentExperience.filter((_, i) => i !== index));
  };

  const experience = user.experience || [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' }} />
            Work Experience
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(67, 233, 123, 0.15)', color: '#43E97B', border: '1px solid rgba(67, 233, 123, 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          )}
        </div>

        {experience.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center" style={{ background: 'rgba(67, 233, 123, 0.05)' }}>
            <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: '#43E97B', opacity: 0.5 }} />
            <p style={{ color: '#B6C4E0' }}>No work experience added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {experience.map((exp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-2xl group"
                >
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' }}
                    >
                      <Briefcase className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg" style={{ color: '#E5EDFF' }}>{exp.title}</h4>
                          <p className="text-sm font-semibold mb-2" style={{ color: '#43E97B' }}>{exp.company}</p>
                          <p className="text-xs mb-3" style={{ color: '#7A8BA6' }}>
                            {exp.start_date} - {exp.end_date || 'Present'}
                          </p>
                        </div>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExperience(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-sm" style={{ color: '#B6C4E0' }}>{exp.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Add Work Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Job Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Product Manager"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Company *</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Tech Corp"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: '#B6C4E0' }}>Start Date</Label>
                <Input
                  type="month"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <Label style={{ color: '#B6C4E0' }}>End Date (leave blank if current)</Label>
                <Input
                  type="month"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="glass-input mt-2"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                rows={4}
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
              onClick={addExperience}
              disabled={!formData.title.trim() || !formData.company.trim() || updateExperienceMutation.isPending}
              style={{ background: '#43E97B', color: '#fff' }}
            >
              {updateExperienceMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}