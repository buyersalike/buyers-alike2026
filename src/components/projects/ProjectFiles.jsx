import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, File, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectFiles({ project, currentUser }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: files = [] } = useQuery({
    queryKey: ['projectFiles', project.id],
    queryFn: () => base44.entities.ProjectFile.filter({ project_id: project.id }, '-created_date'),
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.ProjectFile.create({
        project_id: project.id,
        name: file.name,
        url: file_url,
        size: file.size,
        type: file.type,
        uploaded_by: currentUser.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles'] });
      setUploading(false);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles'] });
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center gap-3 py-8 border-2 border-dashed rounded-xl transition-colors hover:border-[#D8A11F]" style={{ borderColor: '#000' }}>
            <Upload className="w-6 h-6" style={{ color: '#D8A11F' }} />
            <span style={{ color: '#000' }}>
              {uploading ? 'Uploading...' : 'Click to upload file'}
            </span>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: '#fff', border: '1px solid #000', color: '#666' }}>
            <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: '#fff', border: '1px solid #000' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(216, 161, 31, 0.15)' }}
                >
                  <File className="w-5 h-5" style={{ color: '#D8A11F' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: '#000' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: '#666' }}>
                    {formatFileSize(file.size)} • Uploaded {formatDistanceToNow(new Date(file.created_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.open(file.url, '_blank')}
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  style={{ color: '#D8A11F' }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Delete this file?')) {
                      deleteFileMutation.mutate(file.id);
                    }
                  }}
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}