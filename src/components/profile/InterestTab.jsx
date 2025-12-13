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
import { Plus, Trash2, X, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterestTab({ user, isOwnProfile }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInterest, setNewInterest] = useState({ interest_name: "", description: "" });
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
      setNewInterest({ interest_name: "", description: "" });
    },
  });

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
      status: "pending"
    });
  };

  const myInterests = interests.filter(i => i.status === "approved");
  const pendingInterests = interests.filter(i => i.status === "pending");
  const rejectedInterests = interests.filter(i => i.status === "rejected");

  const InterestCard = ({ interest, showDelete = false }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-4 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: '#667EEA' }} />
            <h4 className="font-semibold" style={{ color: '#E5EDFF' }}>{interest.interest_name}</h4>
            {interest.status === "approved" && (
              <Badge className="text-xs" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff' }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Approved
              </Badge>
            )}
            {interest.status === "pending" && (
              <Badge className="text-xs" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#fff' }}>
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            {interest.status === "rejected" && (
              <Badge className="text-xs" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#fff' }}>
                <XCircle className="w-3 h-3 mr-1" />
                Rejected
              </Badge>
            )}
          </div>
          {interest.description && (
            <p className="text-sm" style={{ color: '#B6C4E0' }}>{interest.description}</p>
          )}
        </div>
        {showDelete && isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteInterestMutation.mutate(interest.id)}
            className="ml-2"
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );

  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
        style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
        <Sparkles className="w-8 h-8" style={{ color: '#667EEA' }} />
      </div>
      <p style={{ color: '#7A8BA6' }}>{message}</p>
    </div>
  );

  return (
    <>
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#E5EDFF' }}>Interests</h2>
            <p className="text-sm" style={{ color: '#7A8BA6' }}>Manage your interests and preferences</p>
          </div>
          {isOwnProfile && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 px-6 py-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: '#fff' }}
            >
              <Plus className="w-4 h-4" />
              Add Interest
            </Button>
          )}
        </div>

        <Tabs defaultValue="my-interests" className="w-full">
          <TabsList className="glass-card mb-6 p-1 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
            <TabsTrigger value="my-interests" className="rounded-lg px-4 py-2 data-[state=active]:bg-[#667EEA] data-[state=active]:text-white">
              My Interests
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg px-4 py-2 data-[state=active]:bg-[#667EEA] data-[state=active]:text-white">
              My Pending Interests
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg px-4 py-2 data-[state=active]:bg-[#667EEA] data-[state=active]:text-white">
              My Rejected Interests
            </TabsTrigger>
            <TabsTrigger value="available" className="rounded-lg px-4 py-2 data-[state=active]:bg-[#667EEA] data-[state=active]:text-white">
              Available Interests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-interests">
            {myInterests.length === 0 ? (
              <EmptyState message="You haven't added any interests yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {myInterests.map(interest => (
                    <InterestCard key={interest.id} interest={interest} showDelete />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingInterests.length === 0 ? (
              <EmptyState message="You have no pending interest requests." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {pendingInterests.map(interest => (
                    <InterestCard key={interest.id} interest={interest} showDelete />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedInterests.length === 0 ? (
              <EmptyState message="You have no rejected interests." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {rejectedInterests.map(interest => (
                    <InterestCard key={interest.id} interest={interest} showDelete />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available">
            <div className="glass-card p-6 rounded-2xl" style={{ background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#E5EDFF' }}>Suggested Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Business", "Technology", "Finance", "Real Estate", "Marketing", "Sales", "Operations", "Investments", "Partnerships", "Acquisitions", "Franchising", "Consulting"].map(interest => (
                  <Button
                    key={interest}
                    variant="outline"
                    className="rounded-lg"
                    style={{ borderColor: 'rgba(102, 126, 234, 0.3)', color: '#E5EDFF' }}
                    onClick={() => {
                      setNewInterest({ interest_name: interest, description: "" });
                      setShowAddDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {interest}
                  </Button>
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