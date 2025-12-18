import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Upload, X, FileText, Link as LinkIcon } from "lucide-react";

export default function CreatePostDialog({ open, onOpenChange, categories, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
    link_url: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      });
      
      const uploadedFilesData = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...uploadedFilesData]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.ForumPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setFormData({ title: "", content: "", category_id: "", link_url: "" });
      setUploadedFiles([]);
      onOpenChange(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Check if user is banned from forum
    if (currentUser.forum_banned) {
      alert("You have been banned from the forum and cannot create posts.");
      return;
    }
    
    createPostMutation.mutate({
      ...formData,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email.split('@')[0],
      views: 0,
      file_urls: uploadedFiles.map(f => f.url),
      flagged: false,
      removed: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" style={{ background: '#F2F1F5', border: '1px solid #000' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#000' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#D8A11F' }}>
              <MessageSquare className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title" style={{ color: '#000' }}>Post Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
              style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
              placeholder="What would you like to discuss?"
            />
          </div>

          <div>
            <Label htmlFor="category" style={{ color: '#000' }}>Category *</Label>
            <Select 
              required 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger className="mt-1" style={{ color: '#000', background: '#fff', border: '1px solid #000' }}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content" style={{ color: '#000' }}>Content *</Label>
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 h-40"
              style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
              placeholder="Share your thoughts, insights, or questions..."
            />
          </div>

          <div>
            <Label htmlFor="link_url" style={{ color: '#000' }}>Share a Link (Optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#000' }} />
              <Input
                id="link_url"
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="mt-1 pl-10"
                style={{ color: '#000', background: '#fff', border: '1px solid #000' }}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <Label style={{ color: '#000' }}>Attach Files (Optional)</Label>
            <p className="text-xs mb-2" style={{ color: '#666' }}>
              Upload documents, images, or PDFs (Max 5MB per file)
            </p>
            
            <label
              htmlFor="files"
              className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-opacity-50 mb-3"
              style={{ borderColor: '#000', background: '#fff' }}
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 mb-1" style={{ color: '#D8A11F' }} />
                <p className="text-sm" style={{ color: '#000' }}>
                  {uploading ? 'Uploading...' : 'Click to upload files'}
                </p>
              </div>
              <input
                id="files"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D8A11F' }}>
                        <FileText className="w-4 h-4" style={{ color: '#fff' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#000' }}>
                        {file.name}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="rounded-lg p-1"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-lg"
              style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg"
              style={{ background: '#D8A11F', color: '#fff' }}
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}