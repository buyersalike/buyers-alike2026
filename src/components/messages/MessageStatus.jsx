import React from "react";
import { Check, CheckCheck } from "lucide-react";

/**
 * Direct messages: msg.read = true means recipient has read it.
 * All sent messages are "delivered" (stored in DB).
 * 
 * Group messages: msg.read_by array tracks who has read.
 * "Read" = all other members have read it.
 */
export default function MessageStatus({ msg, isGroup = false, groupMemberCount = 0 }) {
  if (isGroup) {
    const readByCount = (msg.read_by || []).length;
    // Exclude sender from total: groupMemberCount includes sender
    const othersCount = Math.max(groupMemberCount - 1, 1);
    const allRead = readByCount >= othersCount;

    return (
      <span className="inline-flex items-center gap-0.5 ml-1">
        {allRead ? (
          <CheckCheck className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
        ) : readByCount > 0 ? (
          <CheckCheck className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        ) : (
          <Check className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        )}
      </span>
    );
  }

  // Direct message
  const isRead = msg.read;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {isRead ? (
        <CheckCheck className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
      ) : (
        <CheckCheck className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
      )}
    </span>
  );
}