import React, { useState } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export default function MessageActions({ msg, isOwn, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const canEdit = isOwn && !msg.deleted && (Date.now() - new Date(msg.created_date).getTime()) < EDIT_WINDOW_MS;
  const canDelete = isOwn && !msg.deleted;

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== msg.content) {
      onEdit(msg.id, editText.trim());
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mt-1 space-y-1">
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="resize-none text-sm"
          style={{ color: '#000', background: '#fff', border: '1px solid #D8A11F' }}
          rows={2}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        <div className="flex gap-1 justify-end">
          <Button size="sm" onClick={() => setEditing(false)} className="h-6 w-6 p-0 rounded-full" style={{ background: '#E5E7EB' }}>
            <X className="w-3 h-3" style={{ color: '#666' }} />
          </Button>
          <Button size="sm" onClick={handleSaveEdit} className="h-6 w-6 p-0 rounded-full" style={{ background: '#D8A11F' }}>
            <Check className="w-3 h-3" style={{ color: '#fff' }} />
          </Button>
        </div>
      </div>
    );
  }

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      {canEdit && (
        <button onClick={() => { setEditText(msg.content); setEditing(true); }} className="p-1 rounded hover:bg-gray-200 transition-colors" title="Edit (within 15 min)">
          <Pencil className="w-3 h-3" style={{ color: '#666' }} />
        </button>
      )}
      {canDelete && (
        <button onClick={() => onDelete(msg.id)} className="p-1 rounded hover:bg-red-100 transition-colors" title="Delete message">
          <Trash2 className="w-3 h-3" style={{ color: '#EF4444' }} />
        </button>
      )}
    </div>
  );
}