import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, CheckCircle, XCircle, Clock, Sparkles, Upload, FileImage, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterestTab({ user, isOwnProfile }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInterest, setNewInterest] = useState({ interest_name: "", description: "", attachment_urls: [] });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const queryClient = useQueryClient();

  const { data: interests = [] } = useQuery({
    queryKey: ['interests', user.email],
    queryFn: () => base44.entities.Interest.filter({ user_email: user.email }),
  });

  const addInterestMutation = useMutation({
    mutationFn: (data) => base44.entities.Interest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      setShowAddDialog(false);
      setNewInterest({ interest_name: "", description: "", attachment_urls: [] });
      setSelectedFiles([]);
    },
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setNewInterest(prev => ({
        ...prev,
        attachment_urls: [...(prev.attachment_urls || []), ...urls]
      }));
      setSelectedFiles(prev => [...prev, ...files]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (index) => {
    setNewInterest(prev => ({
      ...prev,
      attachment_urls: prev.attachment_urls.filter((_, i) => i !== index)
    }));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteInterestMutation = useMutation({
    mutationFn: (id) => base44.entities.Interest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
    },
  });

  const handleAddInterest = () => {
    if (!newInterest.interest_name.trim()) return;
    addInterestMutation.mutate({
      user_email: user.email,
      interest_name: newInterest.interest_name,
      description: newInterest.description,
      status: "approved"
    });
  };

  const myInterests = interests.filter(i => i.status === "approved");
  const pendingInterests = interests.filter(i => i.status === "pending");
  const rejectedInterests = interests.filter(i => i.status === "rejected");

  const InterestCard = ({ interest, showDelete = false }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-6 rounded-2xl group cursor-pointer"
      style={{ 
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" 
              style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#E5EDFF' }} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1" style={{ color: '#000' }}>{interest.interest_name}</h4>
              {interest.status === "approved" && (
                <Badge className="text-xs font-semibold px-3 py-1" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  Approved
                </Badge>
              )}
              {interest.status === "pending" && (
                <Badge className="text-xs font-semibold px-3 py-1" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}>
                  <Clock className="w-3 h-3 mr-1.5" />
                  Pending Review
                </Badge>
              )}
              {interest.status === "rejected" && (
                <Badge className="text-xs font-semibold px-3 py-1" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>
                  <XCircle className="w-3 h-3 mr-1.5" />
                  Rejected
                </Badge>
              )}
            </div>
          </div>
          {interest.description && (
            <p className="text-sm leading-relaxed ml-13 mb-3" style={{ color: '#000' }}>{interest.description}</p>
          )}
          {interest.attachment_urls && interest.attachment_urls.length > 0 && (
            <div className="ml-13 flex flex-wrap gap-2">
              {interest.attachment_urls.map((url, idx) => (
                <a 
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#667EEA', border: '1px solid rgba(102, 126, 234, 0.3)' }}
                >
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <FileImage className="w-4 h-4" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                  Attachment {idx + 1}
                </a>
              ))}
            </div>
          )}
        </div>
        {showDelete && isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              deleteInterestMutation.mutate(interest.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );

  const EmptyState = ({ message }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg" 
        style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
        <Sparkles className="w-10 h-10" style={{ color: '#667EEA' }} />
      </div>
      <p className="text-lg font-medium" style={{ color: '#B6C4E0' }}>{message}</p>
    </motion.div>
  );

  return (
    <>
      <div className="p-8 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#000' }}>Interests</h2>
            <p className="text-sm" style={{ color: '#666' }}>Manage your interests and preferences</p>
          </div>
          {isOwnProfile && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 px-6 py-2 rounded-xl"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              <Plus className="w-4 h-4" />
              Add Interest
            </Button>
          )}
        </div>

        <Tabs defaultValue="my-interests" className="w-full">
          <TabsList className="mb-8 p-2 rounded-2xl" style={{ background: '#F2F1F5', border: '1px solid #000' }}>
            <TabsTrigger value="my-interests" className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              My Interests
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              Rejected
            </TabsTrigger>
            <TabsTrigger value="available" className="rounded-xl px-5 py-3 font-semibold text-sm transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
              Available
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-interests" className="mt-6">
            {myInterests.length === 0 ? (
              <EmptyState message="You haven't added any interests yet." />
            ) : (
              <>
                <div className="mb-4 px-1">
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                    {myInterests.length} {myInterests.length === 1 ? 'Interest' : 'Interests'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {myInterests.map((interest, index) => (
                      <motion.div
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <InterestCard interest={interest} showDelete />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingInterests.length === 0 ? (
              <EmptyState message="You have no pending interest requests." />
            ) : (
              <>
                <div className="mb-4 px-1">
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                    {pendingInterests.length} Pending {pendingInterests.length === 1 ? 'Request' : 'Requests'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {pendingInterests.map((interest, index) => (
                      <motion.div
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <InterestCard interest={interest} showDelete />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedInterests.length === 0 ? (
              <EmptyState message="You have no rejected interests." />
            ) : (
              <>
                <div className="mb-4 px-1">
                  <p className="text-sm font-medium" style={{ color: '#7A8BA6' }}>
                    {rejectedInterests.length} Rejected {rejectedInterests.length === 1 ? 'Interest' : 'Interests'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {rejectedInterests.map((interest, index) => (
                      <motion.div
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <InterestCard interest={interest} showDelete />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-6">
            <div className="p-8 rounded-2xl" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#000' }}>Suggested Interests</h3>
                <p className="text-sm" style={{ color: '#666' }}>Click on any interest to add it to your profile</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {["Business", "Technology", "Finance", "Real Estate", "Marketing", "Sales", "Operations", "Investments", "Partnerships", "Acquisitions", "Franchising", "Consulting", "Strategy", "Innovation", "Leadership", "Growth"].map((interest, index) => (
                  <motion.div
                    key={interest}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl py-6 font-semibold transition-all"
                      style={{ 
                        borderColor: '#D8A11F', 
                        color: '#000',
                        background: '#fff'
                      }}
                      onClick={() => {
                        setNewInterest({ interest_name: interest, description: "" });
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {interest}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Interest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }} className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: '#E5EDFF' }}>Add New Interest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: '#B6C4E0' }}>Interest Name *</Label>
              <Input
                value={newInterest.interest_name}
                onChange={(e) => setNewInterest({ ...newInterest, interest_name: e.target.value })}
                placeholder="e.g., Business Development"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Description (Optional)</Label>
              <Textarea
                value={newInterest.description}
                onChange={(e) => setNewInterest({ ...newInterest, description: e.target.value })}
                placeholder="Why are you interested in this?"
                className="glass-input mt-2"
                style={{ color: '#E5EDFF' }}
                rows={3}
              />
            </div>
            <div>
              <Label style={{ color: '#B6C4E0' }}>Attachments (Optional)</Label>
              <div className="mt-2">
                <label 
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-3 p-6 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                    color: '#B6C4E0'
                  }}
                >
                  <Upload className="w-5 h-5" style={{ color: '#667EEA' }} />
                  <span className="font-medium">
                    {uploadingFiles ? 'Uploading...' : 'Click to upload files or images'}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={uploadingFiles}
                  className="hidden"
                />
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium" style={{ color: '#7A8BA6' }}>
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)' }}
                    >
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? (
                          <FileImage className="w-5 h-5" style={{ color: '#667EEA' }} />
                        ) : (
                          <File className="w-5 h-5" style={{ color: '#667EEA' }} />
                        )}
                        <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8"
                        style={{ color: '#EF4444' }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddDialog(false)}
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddInterest}
              disabled={addInterestMutation.isPending || !newInterest.interest_name.trim()}
              style={{ background: '#667EEA', color: '#fff' }}
            >
              {addInterestMutation.isPending ? 'Adding...' : 'Add Interest'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}