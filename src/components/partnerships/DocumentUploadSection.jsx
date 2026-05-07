import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";

export default function DocumentUploadSection({ group, currentUser }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newDoc = {
        name: file.name,
        url: file_url,
        uploaded_by: currentUser.email,
        uploaded_date: new Date().toISOString()
      };
      const updatedDocs = [...(group.documents || []), newDoc];
      await base44.entities.PartnershipGroup.update(group.id, { documents: updatedDocs });
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      toast.success("Document uploaded successfully");
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload document");
      setUploading(false);
    },
  });

  const removeDocMutation = useMutation({
    mutationFn: async (docUrl) => {
      const updatedDocs = (group.documents || []).filter(d => d.url !== docUrl);
      await base44.entities.PartnershipGroup.update(group.id, { documents: updatedDocs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      toast.success("Document removed");
    },
    onError: (error) => toast.error(error.message || "Failed to remove document"),
  });

  if (!group || !currentUser) return null;

  const isMember = (group.members || []).some(m => m.email === currentUser.email && m.status === 'active');
  if (!isMember) return null;

  const myDocs = (group.documents || []).filter(d => d.uploaded_by === currentUser.email);
  const allDocs = group.documents || [];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be under 10MB");
        return;
      }
      uploadMutation.mutate(file);
    }
    e.target.value = '';
  };

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold" style={{ color: '#E5EDFF' }}>
          Documents ({allDocs.length})
        </p>
        {myDocs.length > 0 && (
          <span className="flex items-center gap-1 text-xs" style={{ color: '#22C55E' }}>
            <CheckCircle2 className="w-3 h-3" />
            You uploaded {myDocs.length}
          </span>
        )}
      </div>

      {/* Existing documents */}
      {allDocs.length > 0 && (
        <div className="space-y-2 mb-3">
          {allDocs.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#3B82F6' }} />
              <div className="flex-1 min-w-0">
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline block truncate" style={{ color: '#E5EDFF' }}>
                  {doc.name}
                </a>
                <p className="text-xs" style={{ color: '#7A8BA6' }}>
                  By {doc.uploaded_by === currentUser.email ? 'You' : doc.uploaded_by}
                  {doc.uploaded_date && ` · ${new Date(doc.uploaded_date).toLocaleDateString()}`}
                </p>
              </div>
              {doc.uploaded_by === currentUser.email && (
                <Button
                  onClick={() => removeDocMutation.mutate(doc.url)}
                  disabled={removeDocMutation.isPending}
                  className="p-1 rounded"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label
        htmlFor={`doc-upload-${group.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50"
        style={{ borderColor: 'rgba(255, 255, 255, 0.18)', background: 'rgba(255, 255, 255, 0.03)' }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#D8A11F' }} />
            <span className="text-sm" style={{ color: '#B6C4E0' }}>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" style={{ color: '#D8A11F' }} />
            <span className="text-sm" style={{ color: '#B6C4E0' }}>Upload Document</span>
          </>
        )}
        <input
          id={`doc-upload-${group.id}`}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </label>
      <p className="text-xs mt-2 text-center" style={{ color: '#7A8BA6' }}>
        PDF, DOC, images, or spreadsheets up to 10MB
      </p>
    </div>
  );
}