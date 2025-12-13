import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SkillsSection({ user, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const queryClient = useQueryClient();

  const updateSkillsMutation = useMutation({
    mutationFn: (skills) => base44.auth.updateMe({ skills }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setNewSkill("");
    },
  });

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const currentSkills = user.skills || [];
    updateSkillsMutation.mutate([...currentSkills, newSkill.trim()]);
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = user.skills || [];
    updateSkillsMutation.mutate(currentSkills.filter(s => s !== skillToRemove));
  };

  const skills = user.skills || [];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#E5EDFF' }}>
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }} />
            Skills & Expertise
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => setShowDialog(true)}
              size="sm"
              className="gap-2"
              style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#667EEA', border: '1px solid rgba(102, 126, 234, 0.3)' }}
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center" style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
            <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#667EEA', opacity: 0.5 }} />
            <p style={{ color: '#B6C4E0' }}>No skills added yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {skills.map((skill, idx) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Badge 
                    className="px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 group"
                    style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)', color: '#E5EDFF', border: '1px solid rgba(102, 126, 234, 0.3)' }}
                  >
                    {skill}
                    {isOwnProfile && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      >
                        <X className="w-3 h-3" style={{ color: '#EF4444' }} />
                      </button>
                    )}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Add Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="e.g., Project Management, Python, Marketing"
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={addSkill}
              disabled={!newSkill.trim() || updateSkillsMutation.isPending}
              style={{ background: '#667EEA', color: '#fff' }}
            >
              {updateSkillsMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}