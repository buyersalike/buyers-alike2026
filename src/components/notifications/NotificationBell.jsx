import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, Check, X, UserPlus, MessageSquare, AtSign, Heart, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import moment from "moment";

const notificationIcons = {
  connection_request: UserPlus,
  connection_accepted: Check,
  new_message: MessageSquare,
  post_mention: AtSign,
  post_comment: MessageSquare,
  post_like: Heart,
  opportunity_match: ThumbsUp,
};

const notificationColors = {
  connection_request: '#F59E0B',
  connection_accepted: '#22C55E',
  new_message: '#3B82F6',
  post_mention: '#7C3AED',
  post_comment: '#06B6D4',
  post_like: '#EF4444',
  opportunity_match: '#D8A11F',
};

export default function NotificationBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => base44.entities.Notification.update(n.id, { read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          style={{ color: '#E5EDFF' }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#EF4444', color: '#fff' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.18)' }}
        align="end"
      >
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: '#E5EDFF' }}>Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs"
                style={{ color: '#3B82F6' }}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 mb-3" style={{ color: '#7A8BA6' }} />
              <p className="text-sm" style={{ color: '#7A8BA6' }}>No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const color = notificationColors[notification.type] || '#3B82F6';

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {notification.link ? (
                        <Link to={notification.link} onClick={() => handleNotificationClick(notification)}>
                          <NotificationItem 
                            notification={notification} 
                            Icon={Icon} 
                            color={color}
                            onDelete={() => deleteNotificationMutation.mutate(notification.id)}
                          />
                        </Link>
                      ) : (
                        <NotificationItem 
                          notification={notification} 
                          Icon={Icon} 
                          color={color}
                          onDelete={() => deleteNotificationMutation.mutate(notification.id)}
                          onClick={() => handleNotificationClick(notification)}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification, Icon, color, onDelete, onClick }) {
  return (
    <div
      className="p-3 mb-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02] group"
      style={{ 
        background: notification.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(59, 130, 246, 0.1)',
        border: `1px solid ${notification.read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.2)'}`,
      }}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm mb-1" style={{ color: '#E5EDFF' }}>{notification.title}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              style={{ color: '#EF4444' }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs mb-2" style={{ color: '#B6C4E0' }}>{notification.message}</p>
          <p className="text-xs" style={{ color: '#7A8BA6' }}>{moment.utc(notification.created_date).fromNow()}</p>
        </div>
      </div>
    </div>
  );
}