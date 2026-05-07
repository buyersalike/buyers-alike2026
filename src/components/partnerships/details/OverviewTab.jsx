import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, User, Mail, Building2, Edit, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import PartnershipStageProgress from "@/components/partnerships/PartnershipStageProgress";

export default function OverviewTab({ partnership }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(partnership);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Partnership.update(partnership.id, data),
    onSuccess: async () => {
      const user = await base44.auth.me();
      await base44.entities.PartnershipActivity.create({
        partnership_id: partnership.id,
        activity_type: "note_added",
        title: "Partnership updated",
        description: "Partnership details were updated",
        user_email: user.email,
        user_name: user.full_name
      });
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      setEditing(false);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div>
          <Label style={{ color: '#000' }}>Description</Label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{ color: '#000' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label style={{ color: '#000' }}>Stage</Label>
            <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
              <SelectTrigger style={{ color: '#000' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="agreement">Agreement</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="renewal">Renewal</SelectItem>
                <SelectItem value="termination">Termination</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label style={{ color: '#000' }}>Deal Size</Label>
            <Input
              value={formData.deal_size || ""}
              onChange={(e) => setFormData({ ...formData, deal_size: e.target.value })}
              style={{ color: '#000' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label style={{ color: '#000' }}>Start Date</Label>
            <Input
              type="date"
              value={formData.start_date || ""}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              style={{ color: '#000' }}
            />
          </div>
          <div>
            <Label style={{ color: '#000' }}>End Date</Label>
            <Input
              type="date"
              value={formData.end_date || ""}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              style={{ color: '#000' }}
            />
          </div>
        </div>

        <div>
          <Label style={{ color: '#000' }}>Performance Score (0-100)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.performance_score || ""}
            onChange={(e) => setFormData({ ...formData, performance_score: parseInt(e.target.value) })}
            style={{ color: '#000' }}
          />
        </div>

        <div>
          <Label style={{ color: '#000' }}>Notes</Label>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            style={{ color: '#000' }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setEditing(false); setFormData(partnership); }}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} style={{ background: '#D8A11F', color: '#fff' }}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Partner Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: '#D8A11F' }} />
                <span style={{ color: '#000' }}>{partnership.partner_name}</span>
              </div>
              {partnership.partner_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: '#D8A11F' }} />
                  <span style={{ color: '#000' }}>{partnership.partner_email}</span>
                </div>
              )}
              {partnership.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: '#D8A11F' }} />
                  <span style={{ color: '#000' }}>{partnership.industry}</span>
                </div>
              )}
            </div>
          </div>

          {partnership.description && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Description</h3>
              <p style={{ color: '#666' }}>{partnership.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Timeline</h3>
            <div className="space-y-2">
              {partnership.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#D8A11F' }} />
                  <span style={{ color: '#000' }}>Start: {format(new Date(partnership.start_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {partnership.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#D8A11F' }} />
                  <span style={{ color: '#000' }}>End: {format(new Date(partnership.end_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {partnership.renewal_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#D8A11F' }} />
                  <span style={{ color: '#000' }}>Renewal: {format(new Date(partnership.renewal_date), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {partnership.deal_size && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Deal Size</h3>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: '#D8A11F' }} />
                <span style={{ color: '#000' }}>{partnership.deal_size}</span>
              </div>
            </div>
          )}

          {partnership.performance_score && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Performance Score</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all" 
                    style={{ 
                      width: `${partnership.performance_score}%`,
                      background: partnership.performance_score >= 75 ? '#22C55E' : partnership.performance_score >= 50 ? '#FACC15' : '#EF4444'
                    }}
                  />
                </div>
                <span className="font-semibold" style={{ color: '#000' }}>{partnership.performance_score}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="p-4 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#000' }}>Stage Progress</h3>
        <PartnershipStageProgress stage={partnership.stage} />
      </div>

      {partnership.notes && (
        <div>
          <h3 className="font-semibold mb-2" style={{ color: '#000' }}>Notes</h3>
          <p className="text-sm" style={{ color: '#666' }}>{partnership.notes}</p>
        </div>
      )}
    </div>
  );
}