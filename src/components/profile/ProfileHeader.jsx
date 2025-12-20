import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { User, Camera, Mail, MapPin, Calendar, Briefcase, Upload, X, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export default function ProfileHeader({ user, isOwnProfile, currentUser }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState({ cover: false, avatar: false });
  const queryClient = useQueryClient();

  const validateFile = (file) => {
    if (!file) return null;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    
    return null;
  };

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with high quality
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.95 // High quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file, type) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    
    // Resize image based on type
    const maxWidth = type === 'cover' ? 1920 : 800;
    const maxHeight = type === 'cover' ? 600 : 800;
    
    const resizedFile = await resizeImage(file, maxWidth, maxHeight);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover') {
        setCoverFile(resizedFile);
        setCoverPreview(reader.result);
      } else {
        setAvatarFile(resizedFile);
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(resizedFile);
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  const removePreview = (type) => {
    if (type === 'cover') {
      setCoverFile(null);
      setCoverPreview(null);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleMediaUpload = async () => {
    if (!coverFile && !avatarFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const updates = {};
      
      if (coverFile) {
        setUploadProgress(25);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        updates.cover_image_url = file_url;
        setUploadProgress(50);
      }
      
      if (avatarFile) {
        setUploadProgress(coverFile ? 75 : 50);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: avatarFile });
        updates.avatar_url = file_url;
        setUploadProgress(coverFile ? 90 : 75);
      }

      await base44.auth.updateMe(updates);
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      setTimeout(() => {
        setShowEditDialog(false);
        setCoverFile(null);
        setAvatarFile(null);
        setCoverPreview(null);
        setAvatarPreview(null);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Cover Image with Gradient Overlay */}
        <div 
          className="h-80 w-full relative overflow-hidden"
          style={{ 
            background: user.cover_image_url 
              ? `url(${user.cover_image_url})` 
              : 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: '-webkit-optimize-contrast'
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10, 22, 40, 0.8) 100%)' }} />
          
          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" 
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-20" 
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-24">
            {/* Avatar */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div 
                className="w-48 h-48 rounded-3xl flex items-center justify-center border-4 overflow-hidden shadow-2xl"
                style={{ 
                  background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name} 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                ) : (
                  <User className="w-24 h-24" style={{ color: '#E5EDFF' }} />
                )}
              </div>
              
              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}>
                Active
              </div>
            </motion.div>

            {/* User Info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 pb-6"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-3" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}>
                   {user.full_name || user.email.split('@')[0]}
                  </h1>

                  {user.bio && (
                   <p className="text-lg mb-4 max-w-2xl" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)' }}>
                     {user.bio}
                   </p>
                  )}
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    {user.title && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.35)' }}>
                        <Briefcase className="w-4 h-4" style={{ color: '#fff' }} />
                        <span className="text-sm font-semibold" style={{ color: '#fff' }}>{user.title}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.35)' }}>
                        <MapPin className="w-4 h-4" style={{ color: '#fff' }} />
                        <span className="text-sm font-semibold" style={{ color: '#fff' }}>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.35)' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#fff' }} />
                      <span className="text-sm font-semibold" style={{ color: '#fff' }}>Joined {formatDistanceToNow(new Date(user.created_date), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {isOwnProfile && (
                  <Button
                    onClick={() => setShowEditDialog(true)}
                    className="gap-2 px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ background: '#D8A11F', color: '#fff' }}
                  >
                    <Camera className="w-4 h-4" />
                    Edit Media
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Edit Media Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl" style={{ background: '#F2F1F5', border: '2px solid #000' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#000' }}>Edit Media</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                <span className="text-sm" style={{ color: '#EF4444' }}>{error}</span>
              </div>
            )}

            {/* Cover Image Upload */}
            <div>
              <Label className="mb-2 block" style={{ color: '#000' }}>
                Cover Image
                <span className="text-xs ml-2" style={{ color: '#666' }}>(Max 5MB, 1200x320 recommended)</span>
              </Label>
              
              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="w-full h-40 object-cover" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <button
                    onClick={() => removePreview('cover')}
                    className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
                    style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                  >
                    <X className="w-4 h-4" style={{ color: '#fff' }} />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={(e) => handleDrag(e, 'cover')}
                  onDragLeave={(e) => handleDrag(e, 'cover')}
                  onDragOver={(e) => handleDrag(e, 'cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  className="relative rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{ 
                    background: dragActive.cover ? 'rgba(59, 130, 246, 0.1)' : '#fff',
                    border: `2px dashed ${dragActive.cover ? '#3B82F6' : '#000'}` 
                  }}
                  onClick={() => document.getElementById('cover-input').click()}
                >
                  <Upload className="w-8 h-8 mb-2" style={{ color: dragActive.cover ? '#3B82F6' : '#666' }} />
                  <p className="text-sm font-medium" style={{ color: dragActive.cover ? '#3B82F6' : '#000' }}>
                    {dragActive.cover ? 'Drop your image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#666' }}>
                    JPEG, PNG or WebP (max 5MB)
                  </p>
                  <Input
                    id="cover-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files?.[0], 'cover')}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Profile Picture Upload */}
            <div>
              <Label className="mb-2 block" style={{ color: '#000' }}>
                Profile Picture
                <span className="text-xs ml-2" style={{ color: '#666' }}>(Max 5MB, square image recommended)</span>
              </Label>
              
              {avatarPreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden mx-auto" style={{ border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                  <button
                    onClick={() => removePreview('avatar')}
                    className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
                    style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                  >
                    <X className="w-4 h-4" style={{ color: '#fff' }} />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={(e) => handleDrag(e, 'avatar')}
                  onDragLeave={(e) => handleDrag(e, 'avatar')}
                  onDragOver={(e) => handleDrag(e, 'avatar')}
                  onDrop={(e) => handleDrop(e, 'avatar')}
                  className="relative rounded-lg h-32 w-32 mx-auto flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{ 
                    background: dragActive.avatar ? 'rgba(59, 130, 246, 0.1)' : '#fff',
                    border: `2px dashed ${dragActive.avatar ? '#3B82F6' : '#000'}` 
                  }}
                  onClick={() => document.getElementById('avatar-input').click()}
                >
                  <Camera className="w-6 h-6 mb-1" style={{ color: dragActive.avatar ? '#3B82F6' : '#666' }} />
                  <p className="text-xs font-medium text-center px-2" style={{ color: dragActive.avatar ? '#3B82F6' : '#000' }}>
                    {dragActive.avatar ? 'Drop here' : 'Upload'}
                  </p>
                  <Input
                    id="avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files?.[0], 'avatar')}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center" style={{ color: '#000' }}>
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowEditDialog(false);
                setCoverFile(null);
                setAvatarFile(null);
                setCoverPreview(null);
                setAvatarPreview(null);
                setError(null);
              }}
              disabled={uploading}
              style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMediaUpload}
              disabled={uploading || (!coverFile && !avatarFile)}
              className="flex-1"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}