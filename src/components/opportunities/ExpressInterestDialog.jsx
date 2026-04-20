import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { Users, ExternalLink, User, Clock, Loader2, Link2, Crown } from "lucide-react";

export default function ExpressInterestDialog({ open, onOpenChange, opportunity, currentUser, onSubmit, isPending }) {
  const [existingGroups, setExistingGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // 'new' or 'join'
  const [selectedGroup, setSelectedGroup] = useState(null);

  // New group form
  const [groupTitle, setGroupTitle] = useState(`Group for "${opportunity?.title}"`);
  const [maxMembers, setMaxMembers] = useState(20);
  const [groupIntent, setGroupIntent] = useState("");

  useEffect(() => {
    if (!open || !opportunity) return;
    setLoading(true);
    setMode(null);
    setSelectedGroup(null);
    setGroupTitle(`Group for "${opportunity.title}"`);
    setMaxMembers(20);
    setGroupIntent("");

    base44.entities.PartnershipGroup.filter({
      opportunity_id: opportunity.id || opportunity.title,
    }).then(groups => {
      const openGroups = groups.filter(g =>
        g.status === 'forming' &&
        (g.members || []).filter(m => m.status === 'active').length < (g.max_members || 20) &&
        !(g.pending_members || []).some(m => m.email === currentUser?.email) &&
        !(g.members || []).some(m => m.email === currentUser?.email)
      );
      setExistingGroups(openGroups);
      if (openGroups.length === 0) {
        setMode('new');
      }
      setLoading(false);
    }).catch(() => {
      setExistingGroups([]);
      setMode('new');
      setLoading(false);
    });
  }, [open, opportunity?.id]);

  const opportunityLink = opportunity?.link || opportunity?.source_url || opportunity?.contact?.website || null;

  const handleSubmit = () => {
    if (mode === 'new') {
      onSubmit({
        mode: 'new',
        groupTitle,
        maxMembers: Math.max(2, Math.min(50, maxMembers)),
        groupIntent,
      });
    } else if (mode === 'join' && selectedGroup) {
      onSubmit({
        mode: 'join',
        group: selectedGroup,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#F2F1F5', border: '1px solid #000' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: '#000' }}>Express Interest</DialogTitle>
          <DialogDescription style={{ color: '#666' }}>
            Join or create a partnership group for this opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Opportunity Summary */}
        <div className="flex gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          {opportunity?.image && (
            <img src={opportunity.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#000' }}>{opportunity?.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#22C55E' }}>{opportunity?.investment}</p>
            <p className="text-xs truncate" style={{ color: '#666' }}>{opportunity?.description}</p>
          </div>
          {opportunityLink && (
            <a href={opportunityLink} target="_blank" rel="noopener noreferrer" 
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg self-center flex-shrink-0 hover:opacity-80"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Listing
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#D8A11F' }} />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* If existing groups available, show choice */}
            {existingGroups.length > 0 && mode === null && (
              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#000' }}>
                  {existingGroups.length} existing group{existingGroups.length > 1 ? 's' : ''} found for this opportunity:
                </p>
                {existingGroups.map(group => {
                  const activeMembers = (group.members || []).filter(m => m.status === 'active');
                  return (
                    <div
                      key={group.id}
                      onClick={() => { setMode('join'); setSelectedGroup(group); }}
                      className="p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                      style={{ background: '#fff', border: '1px solid #E5E7EB' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm" style={{ color: '#000' }}>{group.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          {activeMembers.length}/{group.max_members || 20} members
                        </span>
                      </div>
                      {group.group_intent && (
                        <p className="text-xs mb-2" style={{ color: '#666' }}>{group.group_intent}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {activeMembers.slice(0, 5).map((m, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#F3F4F6', color: '#000' }}>
                            <User className="w-3 h-3" /> {m.name || m.email.split('@')[0]}
                          </span>
                        ))}
                        {activeMembers.length > 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F3F4F6', color: '#666' }}>
                            +{activeMembers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="text-center pt-2">
                  <span className="text-xs" style={{ color: '#666' }}>or</span>
                </div>
                <Button
                  onClick={() => setMode('new')}
                  variant="outline"
                  className="w-full rounded-xl"
                  style={{ border: '1px solid #D8A11F', color: '#D8A11F' }}
                >
                  Create a New Group Instead
                </Button>
              </div>
            )}

            {/* Join existing group detail */}
            {mode === 'join' && selectedGroup && (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => { setMode(null); setSelectedGroup(null); }} style={{ color: '#666' }}>
                  ← Back to options
                </Button>
                <div className="p-4 rounded-xl" style={{ background: '#fff', border: '1px solid #000' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold" style={{ color: '#000' }}>{selectedGroup.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#D8A11F', color: '#fff' }}>
                      {(selectedGroup.members || []).filter(m => m.status === 'active').length}/{selectedGroup.max_members || 20} members
                    </span>
                  </div>
                  {selectedGroup.group_intent && (
                    <div className="p-3 rounded-lg mb-3" style={{ background: '#F9FAFB' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#666' }}>Group Intent</p>
                      <p className="text-sm" style={{ color: '#000' }}>{selectedGroup.group_intent}</p>
                    </div>
                  )}
                  {selectedGroup.opportunity_link && (
                    <a href={selectedGroup.opportunity_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg mb-3 hover:opacity-80 transition-opacity"
                      style={{ background: '#EBF5FF', border: '1px solid #3B82F6' }}
                    >
                      <Link2 className="w-4 h-4" style={{ color: '#3B82F6' }} />
                      <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>View Property/Business Listing</span>
                      <ExternalLink className="w-3 h-3 ml-auto" style={{ color: '#3B82F6' }} />
                    </a>
                  )}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#666' }}>Current Members</p>
                    <div className="space-y-1.5">
                      {(selectedGroup.members || []).filter(m => m.status === 'active').map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#D8A11F', color: '#fff' }}>
                            {(m.name || m.email).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm" style={{ color: '#000' }}>{m.name || m.email}</span>
                          {m.email === selectedGroup.creator_email && (
                            <span className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
                              <Crown className="w-3 h-3" /> Creator
                            </span>
                          )}
                          <span className="text-xs ml-auto" style={{ color: '#999' }}>
                            {m.joined_date ? new Date(m.joined_date).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(selectedGroup.pending_members || []).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>
                          Pending Requests ({selectedGroup.pending_members.length})
                        </p>
                        {selectedGroup.pending_members.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 p-1.5 text-xs" style={{ color: '#666' }}>
                            <Clock className="w-3 h-3" style={{ color: '#F59E0B' }} />
                            {m.name || m.email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create new group form */}
            {mode === 'new' && (
              <div className="space-y-4">
                {existingGroups.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)} style={{ color: '#666' }}>
                    ← Back to options
                  </Button>
                )}
                <div className="p-4 rounded-xl space-y-4" style={{ background: '#fff', border: '1px solid #000' }}>
                  <h3 className="font-bold" style={{ color: '#000' }}>Create New Partnership Group</h3>
                  <div>
                    <Label style={{ color: '#000' }}>Group Title *</Label>
                    <Input
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      placeholder="Enter a name for your group"
                      className="mt-1.5"
                      style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#000' }}>Max Members</Label>
                    <Input
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(parseInt(e.target.value) || 2)}
                      min={2}
                      max={50}
                      className="mt-1.5"
                      style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
                    />
                    <p className="text-xs mt-1" style={{ color: '#666' }}>Between 2 and 50 members</p>
                  </div>
                  <div>
                    <Label style={{ color: '#000' }}>Group Intent / Goal</Label>
                    <Textarea
                      value={groupIntent}
                      onChange={(e) => setGroupIntent(e.target.value)}
                      placeholder="Describe what this group aims to achieve together (e.g., co-invest in this property, form a franchise partnership...)"
                      className="mt-1.5"
                      style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            {mode && (
              <Button
                onClick={handleSubmit}
                disabled={isPending || (mode === 'new' && !groupTitle.trim()) || (mode === 'join' && !selectedGroup)}
                className="w-full rounded-xl py-5 text-base font-bold"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                ) : mode === 'new' ? (
                  "Create Group & Express Interest"
                ) : (
                  "Request to Join Group"
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}