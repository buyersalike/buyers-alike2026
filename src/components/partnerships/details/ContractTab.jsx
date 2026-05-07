import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, CheckCircle, Circle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ContractTab({ partnership }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const replaceInputRef = React.useRef(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const user = await base44.auth.me();
      const updated = await base44.entities.Partnership.update(partnership.id, {
        contract_url: file_url
      });
      await base44.entities.PartnershipActivity.create({
        partnership_id: partnership.id,
        activity_type: "document_uploaded",
        title: "Contract uploaded",
        description: "Partnership contract document uploaded",
        user_email: user.email,
        user_name: user.full_name
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      setUploading(false);
    }
  });

  const toggleSignedMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const updated = await base44.entities.Partnership.update(partnership.id, {
        contract_signed: !partnership.contract_signed
      });
      await base44.entities.PartnershipActivity.create({
        partnership_id: partnership.id,
        activity_type: "contract_signed",
        title: partnership.contract_signed ? "Contract unsigned" : "Contract signed",
        description: partnership.contract_signed ? "Contract marked as unsigned" : "Contract marked as signed",
        user_email: user.email,
        user_name: user.full_name
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#000' }}>Contract Management</h3>
        
        {partnership.contract_url ? (
          <div className="p-6 rounded-lg space-y-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" style={{ color: '#D8A11F' }} />
                <div>
                  <p className="font-semibold" style={{ color: '#000' }}>Contract Document</p>
                  <p className="text-sm" style={{ color: '#666' }}>Uploaded contract file</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(partnership.contract_url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSignedMutation.mutate()}>
                  {partnership.contract_signed ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                  )}
                </button>
                <span style={{ color: '#000' }}>
                  {partnership.contract_signed ? 'Contract Signed' : 'Contract Not Signed'}
                </span>
              </div>
              
              <input
                ref={replaceInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button variant="outline" disabled={uploading} onClick={() => replaceInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Replace Contract'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-lg text-center" style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB' }}>
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
            <p className="mb-4" style={{ color: '#666' }}>No contract uploaded yet</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button style={{ background: '#D8A11F', color: '#fff' }} disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Contract'}
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#000' }}>Contract Dates</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Label style={{ color: '#666' }}>Start Date</Label>
            <p className="font-semibold mt-1" style={{ color: '#000' }}>
              {partnership.start_date || 'Not set'}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Label style={{ color: '#666' }}>End Date</Label>
            <p className="font-semibold mt-1" style={{ color: '#000' }}>
              {partnership.end_date || 'Not set'}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Label style={{ color: '#666' }}>Renewal Date</Label>
            <p className="font-semibold mt-1" style={{ color: '#000' }}>
              {partnership.renewal_date || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}