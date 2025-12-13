import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Bookmark,
  Share2,
  Eye,
  LogOut,
  CheckCircle2,
  Circle,
  X
} from "lucide-react";

export default function PartnershipCard({ partnership, index }) {
  const matchPercentage = partnership.matchScore || 85;
  
  // Partnership stages
  const stages = [
    { id: 'intent', label: 'Intent Created', completed: true },
    { id: 'pending', label: 'Pending Group Join', completed: true },
    { id: 'accepted', label: 'Accepted into Group', completed: true },
    { id: 'documents', label: 'Document Gathering', completed: false },
    { id: 'approvals', label: 'Approvals Complete', completed: false },
    { id: 'active', label: 'Partnership Active', completed: false },
    { id: 'forming', label: 'Group Forming', completed: true },
    { id: 'completed', label: 'Partnership Completed', completed: false }
  ];
  
  const currentStageIndex = stages.findIndex(s => s.id === 'forming');
  const progress = ((currentStageIndex + 1) / stages.length) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-6 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{
        background: '#0F2744',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 transition-colors" style={{ color: '#E5EDFF' }}>
            {partnership.title}
          </h3>
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <CheckCircle2 className="w-3 h-3" />
            accepted into group
          </div>
          
          <p className="text-sm line-clamp-2 mt-2" style={{ color: '#B6C4E0' }}>{partnership.description}</p>
        </div>
      </div>
      
      {/* Group Info */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#E5EDFF' }}>
          Group: Group for "{partnership.title}"
        </p>
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#B6C4E0' }}>
          <Users className="w-4 h-4" />
          <span>Members: 1/20</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2" 
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
        >
          <Eye className="w-4 h-4" />
          View Group Details
        </Button>
        <Button 
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2" 
          style={{ background: '#EF4444', color: '#fff' }}
        >
          <LogOut className="w-4 h-4" />
          Leave Partnership
        </Button>
      </div>
      
      {/* Group Forming Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#FACC15' }}>Group Forming</span>
          <span className="text-xs" style={{ color: '#7A8BA6' }}>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FACC15 0%, #3B82F6 100%)' }}
          />
        </div>
      </div>
      
      {/* Partnership Stages */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-2">
            {stage.completed ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3B82F6' }} />
            ) : (
              <X className="w-4 h-4 flex-shrink-0" style={{ color: '#7A8BA6' }} />
            )}
            <span className="text-xs" style={{ color: stage.completed ? '#B6C4E0' : '#7A8BA6' }}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}