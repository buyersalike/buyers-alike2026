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

export default function FilterBar({ viewMode, setViewMode, totalResults, filtersOpen, setFiltersOpen }) {
  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left - Results count */}
        <div className="flex items-center gap-4">
          <p style={{ color: '#000' }}>
            Showing <span className="font-semibold" style={{ color: '#000' }}>{totalResults}</span> partnerships
          </p>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen && setFiltersOpen(!filtersOpen)}
            className="glass-card glass-card-hover rounded-xl"
            style={filtersOpen 
              ? { color: '#fff', background: '#D8A11F', border: '1px solid #D8A11F' }
              : { color: '#000', background: '#fff', border: '1px solid rgba(0, 0, 0, 0.1)' }
            }
          >
            <Filter className="w-4 h-4 mr-2" style={{ color: filtersOpen ? '#fff' : '#D8A11F' }} />
            Filters
          </Button>
        </div>

        {/* Right - View controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select defaultValue="match">
            <SelectTrigger className="w-40 glass-card rounded-xl" style={{ color: '#000', background: '#fff', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <ArrowUpDown className="w-4 h-4 mr-2" style={{ color: '#D8A11F' }} />
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
                background: '#D8A11F',
                color: '#fff'
              } : {
                color: '#000'
              }}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-lg transition-all"
              style={viewMode === "list" ? {
                background: '#D8A11F',
                color: '#fff'
              } : {
                color: '#000'
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