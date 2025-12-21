import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedFilters({ 
  filters, 
  setFilters, 
  isOpen, 
  setIsOpen 
}) {
  const handleReset = () => {
    setFilters({
      industry: "all",
      companySize: "all",
      location: "",
      investmentMin: "",
      investmentMax: "",
      sortBy: "match_score"
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        style={{ 
          background: isOpen ? '#D8A11F' : '#fff', 
          color: isOpen ? '#fff' : '#000',
          border: '1px solid #000'
        }}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Advanced Filters
        {Object.values(filters).some(v => v && v !== 'all' && v !== 'match_score') && (
          <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }}></span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 mt-4 rounded-2xl space-y-4" style={{ background: '#fff', border: '2px solid #000' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#000' }}>
                  Advanced Filters
                </h3>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  style={{ color: '#666' }}
                >
                  <X className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                    Industry
                  </label>
                  <Select 
                    value={filters.industry} 
                    onValueChange={(value) => setFilters({ ...filters, industry: value })}
                  >
                    <SelectTrigger style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Clean Energy">Clean Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Size Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                    Company Size
                  </label>
                  <Select 
                    value={filters.companySize} 
                    onValueChange={(value) => setFilters({ ...filters, companySize: value })}
                  >
                    <SelectTrigger style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
                      <SelectValue placeholder="All Sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-25">11-25 employees</SelectItem>
                      <SelectItem value="26-50">26-50 employees</SelectItem>
                      <SelectItem value="51-100">51-100 employees</SelectItem>
                      <SelectItem value="101-250">101-250 employees</SelectItem>
                      <SelectItem value="251+">251+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                    Location
                  </label>
                  <Input
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="City, State or Country"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                    Sort By
                  </label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match_score">Match Score</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="deal_size_high">Deal Size (High to Low)</SelectItem>
                      <SelectItem value="deal_size_low">Deal Size (Low to High)</SelectItem>
                      <SelectItem value="company_size">Company Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Investment Range */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                  Investment Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={filters.investmentMin}
                    onChange={(e) => setFilters({ ...filters, investmentMin: e.target.value })}
                    placeholder="Min ($)"
                    type="number"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  />
                  <Input
                    value={filters.investmentMax}
                    onChange={(e) => setFilters({ ...filters, investmentMax: e.target.value })}
                    placeholder="Max ($)"
                    type="number"
                    style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}