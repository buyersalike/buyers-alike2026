import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    additional_name: "",
    username: "",
    occupation: "",
    marital_status: "",
    phone_number: "",
    address: "",
    state: "",
    country: "",
    business_name: "",
    overview: "",
    notification_preferences: {
      connection_requests: true,
      connection_accepted: true,
      new_messages: true,
      post_mentions: true,
      post_comments: true,
      post_likes: false,
      opportunity_match: true,
    },
    email_notifications: true,
    preferred_communication: "email",
    investment_history: []
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        additional_name: user.additional_name || "",
        username: user.username || "",
        occupation: user.occupation || "",
        marital_status: user.marital_status || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        state: user.state || "",
        country: user.country || "",
        business_name: user.business_name || "",
        overview: user.overview || "",
        notification_preferences: user.notification_preferences || {
          connection_requests: true,
          connection_accepted: true,
          new_messages: true,
          post_mentions: true,
          post_comments: true,
          post_likes: false,
          opportunity_match: true,
        },
        email_notifications: user.email_notifications !== false,
        preferred_communication: user.preferred_communication || "email",
        investment_history: user.investment_history || []
      });
    });
  }, []);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Settings saved successfully!');
    },
  });

  const handleSaveChanges = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handlePasswordUpdate = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords don't match!");
      return;
    }
    // Password update logic would go here
    alert("Password update functionality coming soon!");
  };

  const characterLimit = 300;
  const remainingChars = characterLimit - (formData.overview?.length || 0);

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#E5EDFF' }}>
            Settings
          </h1>

          {/* Account Settings */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: '#E5EDFF' }}>
              Account Settings
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  First name
                </label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Last name
                </label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Additional name
                </label>
                <Input
                  value={formData.additional_name}
                  onChange={(e) => setFormData({...formData, additional_name: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  User name
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Occupation
                </label>
                <Input
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Marital Status
                </label>
                <Select value={formData.marital_status} onValueChange={(value) => setFormData({...formData, marital_status: value})}>
                  <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Phone number
                </label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Email
              </label>
              <Input
                value={currentUser?.email || ""}
                disabled
                className="glass-input opacity-60"
                style={{ color: '#7A8BA6' }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  State
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="glass-input"
                  style={{ color: '#E5EDFF' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Business Name
              </label>
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                className="glass-input"
                style={{ color: '#E5EDFF' }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Overview
              </label>
              <Textarea
                value={formData.overview}
                onChange={(e) => setFormData({...formData, overview: e.target.value})}
                className="glass-input h-32"
                style={{ color: '#E5EDFF' }}
                maxLength={characterLimit}
              />
              <p className="text-sm mt-1" style={{ color: remainingChars < 50 ? '#F59E0B' : '#7A8BA6' }}>
                Character limit: {remainingChars}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveChanges}
                disabled={updateSettingsMutation.isPending}
                className="px-6"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>

          {/* Communication Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
                <svg className="w-6 h-6" style={{ color: '#E5EDFF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>Communication Preferences</h2>
                <p className="text-sm" style={{ color: '#7A8BA6' }}>Choose how you'd like to be contacted</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Preferred Communication Channel
              </label>
              <Select 
                value={formData.preferred_communication} 
                onValueChange={(value) => setFormData({...formData, preferred_communication: value})}
              >
                <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in_app">In-App Messages Only</SelectItem>
                  <SelectItem value="any">Any Channel</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs mt-2" style={{ color: '#7A8BA6' }}>
                This helps others know how you prefer to be contacted for business opportunities
              </p>
            </div>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}>
                <svg className="w-6 h-6" style={{ color: '#E5EDFF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>Notification Preferences</h2>
                <p className="text-sm" style={{ color: '#7A8BA6' }}>Manage what notifications you receive</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Notifications Master Toggle */}
              <div 
                className="flex items-start justify-between p-4 rounded-xl transition-all"
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>📧 Email Notifications</p>
                  <p className="text-sm" style={{ color: '#B6C4E0' }}>Receive notifications via email in addition to in-app notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={formData.email_notifications ?? true}
                    onChange={(e) => setFormData({
                      ...formData,
                      email_notifications: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: formData.email_notifications ? '#3B82F6' : '#4B5563' }}></div>
                </label>
              </div>

              {[
                { key: 'connection_requests', label: 'Connection Requests', description: 'Get notified when someone sends you a connection request' },
                { key: 'connection_accepted', label: 'Connection Accepted', description: 'Get notified when someone accepts your connection request' },
                { key: 'new_messages', label: 'New Messages', description: 'Get notified when you receive a new message' },
                { key: 'post_mentions', label: 'Post Mentions', description: 'Get notified when someone mentions you in a post' },
                { key: 'post_comments', label: 'Post Comments', description: 'Get notified when someone comments on your posts' },
                { key: 'post_likes', label: 'Post Likes', description: 'Get notified when someone likes your posts' },
                { key: 'opportunity_match', label: 'Opportunity Matches', description: 'Get notified when new opportunities match your interests' },
              ].map((pref) => (
                <div 
                  key={pref.key}
                  className="flex items-start justify-between p-4 rounded-xl transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <div className="flex-1">
                    <p className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>{pref.label}</p>
                    <p className="text-sm" style={{ color: '#B6C4E0' }}>{pref.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.notification_preferences?.[pref.key] ?? true}
                      onChange={(e) => setFormData({
                        ...formData,
                        notification_preferences: {
                          ...formData.notification_preferences,
                          [pref.key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: formData.notification_preferences?.[pref.key] ? '#3B82F6' : '#4B5563' }}></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: '#E5EDFF' }}>
              Change your password
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Current password
              </label>
              <div className="relative">
                <Input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className="glass-input pr-10"
                  style={{ color: '#E5EDFF' }}
                />
                <button
                  onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#7A8BA6' }}
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                New password
              </label>
              <div className="relative">
                <Input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="glass-input pr-10"
                  style={{ color: '#E5EDFF' }}
                />
                <button
                  onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#7A8BA6' }}
                >
                  {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#B6C4E0' }}>
                Confirm password
              </label>
              <div className="relative">
                <Input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="glass-input pr-10"
                  style={{ color: '#E5EDFF' }}
                />
                <button
                  onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#7A8BA6' }}
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handlePasswordUpdate}
                className="px-6"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
              >
                Update password
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}