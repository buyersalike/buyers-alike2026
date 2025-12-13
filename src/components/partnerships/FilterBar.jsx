import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  SlidersHorizontal, 
  Grid3x3, 
  List,
  ArrowUpDown,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FilterBar({ viewMode, setViewMode, totalResults }) {
  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left - Results count */}
        <div className="flex items-center gap-4">
          <p style={{ color: '#B6C4E0' }}>
            Showing <span className="font-semibold" style={{ color: '#E5EDFF' }}>{totalResults}</span> partnerships
          </p>
          <Button
            variant="outline"
            className="glass-card glass-card-hover rounded-xl"
            style={{ color: '#B6C4E0' }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Right - View controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select defaultValue="match">
            <SelectTrigger className="w-40 glass-card rounded-xl" style={{ color: '#E5EDFF' }}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: '#0B1F3B', borderColor: 'rgba(255, 255, 255, 0.18)', color: '#E5EDFF' }}>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="dealsize">Deal Size</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px) saturate(180%)',
            WebkitBackdropFilter: 'blur(10px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <button
              onClick={() => setViewMode("grid")}
              className="p-2 rounded-lg transition-all"
              style={viewMode === "grid" ? {
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
                color: '#E5EDFF'
              } : {
                color: '#7A8BA6'
              }}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-lg transition-all"
              style={viewMode === "list" ? {
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
                color: '#E5EDFF'
              } : {
                color: '#7A8BA6'
              }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}