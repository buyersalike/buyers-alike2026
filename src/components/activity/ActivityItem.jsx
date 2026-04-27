import React from "react";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Award, FileText, UserPlus, Sparkles } from "lucide-react";
import moment from "moment";
import { Badge } from "@/components/ui/badge";

const activityIcons = {
  connection: UserPlus,
  post: FileText,
  comment: MessageSquare,
  achievement: Award,
  interest_approved: Sparkles,
};

const activityColors = {
  connection: '#22C55E',
  post: '#F59E0B',
  comment: '#06B6D4',
  achievement: '#7C3AED',
  interest_approved: '#667EEA',
};

const activityBgColors = {
  connection: 'rgba(34, 197, 94, 0.15)',
  post: 'rgba(245, 158, 11, 0.15)',
  comment: 'rgba(6, 182, 212, 0.15)',
  achievement: 'rgba(124, 58, 237, 0.15)',
  interest_approved: 'rgba(102, 126, 234, 0.15)',
};

export default function ActivityItem({ activity }) {
  const Icon = activityIcons[activity.type] || MessageSquare;
  const color = activityColors[activity.type] || '#3B82F6';
  const bgColor = activityBgColors[activity.type] || 'rgba(59, 130, 246, 0.15)';

  const content = (
    <div
      className="p-5 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer"
      style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: bgColor, border: `1px solid ${color}40` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <p className="font-bold text-lg mb-1" style={{ color: '#E5EDFF' }}>
                {activity.user_name}
              </p>
              <Badge 
                className="text-xs font-semibold px-2 py-1" 
                style={{ background: bgColor, color, border: `1px solid ${color}40` }}
              >
                {activity.type === 'interest_approved' ? 'Interest Approved' : activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </Badge>
            </div>
            <p className="text-xs font-medium whitespace-nowrap" style={{ color: '#7A8BA6' }}>
              {moment.utc(activity.created_date).fromNow()}
            </p>
          </div>
          
          <p className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>
            {activity.title}
          </p>
          
          {activity.description && (
            <p className="text-sm" style={{ color: '#B6C4E0' }}>
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (activity.link) {
    return <Link to={activity.link}>{content}</Link>;
  }

  return content;
}