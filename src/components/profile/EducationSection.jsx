import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GraduationCap, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function EducationSection({ user, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    graduation_year: ""
  });
  const queryClient = useQueryClient();

  const updateEducationMutation = useMutation({
    mutationFn: (education) => base44.auth.updateMe({ education }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setFormData({ institution: "", degree: "", field: "", graduation_year: "" });
    },
  });

  const addEducation = () => {
    if (!formData.institution.trim() || !formData.degree.trim()) return;
    const currentEducation = user.education || [];
    updateEducationMutation.mutate([...currentEducation, formData]);
  };

  const removeEducation = (index) => {
    const currentEducation = user.education || [];
    updateEducationMutation.mutate(currentEducation.filter((_, i) => i !== index));
  };

  const education = user.education || [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)' }} />
            Education
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(250, 139, 255, 0.15)', color: '#FA8BFF', border: '1px solid rgba(250, 139, 255, 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Education
            </Button>
          )}
        </div>

        {education.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center" style={{ background: 'rgba(250, 139, 255, 0.05)' }}>
            <GraduationCap className="w-12 h-12 mx-auto mb-3" style={{ color: '#FA8BFF', opacity: 0.5 }} />
            <p style={{ color: '#B6C4E0' }}>No education history added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {education.map((edu, idx) => (
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
                      style={{ background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)' }}
                    >
                      <GraduationCap className="w-6 h-6" style={{ color: '#E5EDFF' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg" style={{ color: '#E5EDFF' }}>{edu.institution}</h4>
                          <p className="text-sm font-semibold" style={{ color: '#2BD2FF' }}>{edu.degree}</p>
                          {edu.field && (
                            <p className="text-sm mb-2" style={{ color: '#B6C4E0' }}>{edu.field}</p>
                          )}
                          {edu.graduation_year && (
                            <p className="text-xs" style={{ color: '#7A8BA6' }}>Graduated: {edu.graduation_year}</p>
                          )}
                        </div>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEducation(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
            <DialogTitle style={{ color: '#E5EDFF' }}>Add Education</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Institution *</Label>
              <Input
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g., Harvard University"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Degree *</Label>
              <Input
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g., Bachelor of Science"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Field of Study</Label>
              <Input
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                placeholder="e.g., Computer Science"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Graduation Year</Label>
              <Input
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                placeholder="e.g., 2020"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
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
              onClick={addEducation}
              disabled={!formData.institution.trim() || !formData.degree.trim() || updateEducationMutation.isPending}
              style={{ background: '#2BD2FF', color: '#fff' }}
            >
              {updateEducationMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}