import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Activity as ActivityIcon, ChevronLeft, ChevronRight, Filter, Users, Briefcase, Heart, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ActivityTab({ userEmail, isOwnProfile }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const itemsPerPage = 12;

  // Fetch this user's activities
  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', userEmail],
    queryFn: () => base44.entities.Activity.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  // Filter activities by type
  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(a => a.type === filterType);

  // Sort by most recent first
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  // Pagination
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = sortedActivities.slice(startIndex, endIndex);

  const getActivityIcon = (type) => {
    const icons = {
      connection: UserPlus,
      post: ActivityIcon,
      interest_approved: Heart,
      opportunity: Briefcase,
    };
    return icons[type] || ActivityIcon;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      connection: 'bg-blue-100 text-blue-800',
      post: 'bg-purple-100 text-purple-800',
      comment: 'bg-green-100 text-green-800',
      achievement: 'bg-yellow-100 text-yellow-800',
      interest_approved: 'bg-pink-100 text-pink-800',
      opportunity: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      connection: 'New Connection',
      post: 'Forum Post',
      comment: 'Comment',
      achievement: 'Achievement',
      interest_approved: 'Interest Added',
      opportunity: 'Opportunity Posted',
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 7;
    
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) buttons.push(i);
        buttons.push('...');
        buttons.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        buttons.push(1);
        buttons.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) buttons.push(i);
      } else {
        buttons.push(1);
        buttons.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) buttons.push(i);
        buttons.push('...');
        buttons.push(totalPages);
      }
    }
    
    return buttons;
  };

  return (
    <div className="p-8 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Activity Log</h2>
            <p className="text-sm" style={{ color: '#666' }}>Recent activity history</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" style={{ color: '#666' }} />
          <Select value={filterType} onValueChange={(value) => {
            setFilterType(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px] rounded-xl" style={{ borderColor: '#ddd' }}>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="connection">Connections</SelectItem>
              <SelectItem value="interest_approved">Interests</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="post">Forum Posts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Cards */}
      {currentActivities.length > 0 ? (
        <div className="grid gap-4 mb-6">
          {currentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id}
                className="p-5 rounded-2xl transition-all hover:shadow-md"
                style={{ background: '#fff', border: '1px solid #ddd' }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" 
                    style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        to={createPageUrl('Profile') + `?email=${activity.user_email}`}
                        className="font-bold hover:underline"
                        style={{ color: '#000' }}
                      >
                        {activity.user_name}
                      </Link>
                      <Badge className={getActivityTypeColor(activity.type)}>
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: '#333' }}>
                      {activity.title}
                    </p>
                    
                    {activity.description && (
                      <p className="text-sm mb-2" style={{ color: '#666' }}>
                        {activity.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <p className="text-xs" style={{ color: '#888' }}>
                        {formatDistanceToNow(new Date(activity.created_date.endsWith('Z') ? activity.created_date : activity.created_date + 'Z'), { addSuffix: true })}
                      </p>
                      
                      {activity.link && (
                        <Link 
                          to={activity.link}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: '#3B82F6' }}
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
          <p className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>No activities to display</p>
          <p className="text-sm" style={{ color: '#6B7280' }}>Activity will appear here as it happens</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg p-2"
            style={{ 
              background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)', 
              color: '#B6C4E0',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {renderPaginationButtons().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2" style={{ color: '#7A8BA6' }}>...</span>
            ) : (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="rounded-lg w-10 h-10"
                style={{ 
                  background: currentPage === page 
                    ? '#D8A11F' 
                    : '#fff',
                  color: currentPage === page ? '#fff' : '#000',
                  border: '1px solid #ddd'
                }}
              >
                {page}
              </Button>
            )
          ))}

          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg p-2"
            style={{ 
              background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)', 
              color: '#B6C4E0',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}