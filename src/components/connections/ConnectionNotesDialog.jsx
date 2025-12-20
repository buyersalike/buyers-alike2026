import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { StickyNote, Plus, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ConnectionNotesDialog({ open, onOpenChange, connection, userEmail }) {
  const [noteContent, setNoteContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['connectionNotes', connection?.id],
    queryFn: () => base44.entities.ConnectionNote.filter({ 
      connection_id: connection.id,
      author_email: userEmail 
    }, '-created_date'),
    enabled: !!connection?.id && !!userEmail && open,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.ConnectionNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionNotes'] });
      setNoteContent("");
      setIsImportant(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.ConnectionNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectionNotes'] });
    },
  });

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    createNoteMutation.mutate({
      connection_id: connection.id,
      author_email: userEmail,
      content: noteContent,
      is_important: isImportant
    });
  };

  if (!connection) return null;

  const otherUserEmail = connection.user1_email === userEmail 
    ? connection.user2_email 
    : connection.user1_email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl" style={{ color: '#E5EDFF' }}>
            <StickyNote className="w-6 h-6" />
            Notes - {otherUserEmail.split('@')[0]}
          </DialogTitle>
          <p className="text-sm" style={{ color: '#7A8BA6' }}>
            Private notes about your connection (only visible to you)
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Add Note Form */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note about this connection..."
              className="glass-input mb-3 h-24"
              style={{ color: '#E5EDFF' }}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsImportant(!isImportant)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ 
                  background: isImportant ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isImportant ? '#FBB13C' : '#7A8BA6',
                  border: '1px solid ' + (isImportant ? '#FBB13C' : 'rgba(255, 255, 255, 0.1)')
                }}
              >
                <Star className={`w-4 h-4 ${isImportant ? 'fill-current' : ''}`} />
                <span className="text-sm">Mark as important</span>
              </button>
              <Button
                onClick={handleAddNote}
                disabled={!noteContent.trim() || createNoteMutation.isPending}
                className="rounded-lg gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#7A8BA6' }}>
                <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl"
                  style={{ 
                    background: note.is_important 
                      ? 'rgba(251, 191, 36, 0.1)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (note.is_important 
                      ? 'rgba(251, 191, 36, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)')
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {note.is_important && (
                        <Star className="w-4 h-4 fill-current" style={{ color: '#FBB13C' }} />
                      )}
                      <span className="text-xs" style={{ color: '#7A8BA6' }}>
                        {formatDistanceToNow(new Date(note.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        if (confirm('Delete this note?')) {
                          deleteNoteMutation.mutate(note.id);
                        }
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#E5EDFF' }}>
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}