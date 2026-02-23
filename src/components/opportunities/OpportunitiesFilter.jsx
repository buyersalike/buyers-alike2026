import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, X, ArrowUpDown } from "lucide-react";

const FRANCHISE_CATEGORIES = [
  "Food & Beverage",
  "Health & Fitness",
  "Business Services",
  "Retail",
  "Education",
  "Automotive",
  "Home Services",
  "Technology",
  "Beauty & Personal Care",
  "Financial Services",
];

const REAL_ESTATE_PROPERTY_TYPES = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Commercial",
  "Industrial",
  "Land",
];

export default function OpportunitiesFilter({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  investmentRange,
  setInvestmentRange,
  selectedInterests,
  setSelectedInterests,
  availableInterests,
  clearFilters,
  activeFiltersCount,
  sortBy,
  setSortBy,
  franchiseCategory,
  setFranchiseCategory,
  propertyType,
  setPropertyType,
}) {
  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="p-6 mb-8 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: '#000' }}>Filters & Sorting</h2>
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-sm gap-2"
            style={{ color: '#EF4444' }}
          >
            <X className="w-4 h-4" />
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
            Search Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
            <Input
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
              style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
            />
          </div>
        </div>

        {/* Opportunity Type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
            Opportunity Type
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Real Estate">Real Estate</SelectItem>
              <SelectItem value="Franchise">Franchise</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
              <SelectItem value="Acquisition">Acquisition</SelectItem>
              <SelectItem value="Joint Venture">Joint Venture</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
            Sort By
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most_recent">Most Recent</SelectItem>
              <SelectItem value="lowest_investment">Lowest Investment</SelectItem>
              <SelectItem value="highest_investment">Highest Investment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Investment Range */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
            Investment Range: <span style={{ color: '#D8A11F' }}>${investmentRange[0].toLocaleString()} – ${investmentRange[1].toLocaleString()}</span>
          </label>
          <div className="px-1">
            <Slider
              value={investmentRange}
              onValueChange={setInvestmentRange}
              min={0}
              max={2000000}
              step={25000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs mt-1" style={{ color: '#999' }}>
              <span>$0</span>
              <span>$2,000,000+</span>
            </div>
          </div>
        </div>

        {/* Franchise Category — only shown when Franchise is selected */}
        {category === "Franchise" && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
              Franchise Category
            </label>
            <Select value={franchiseCategory} onValueChange={setFranchiseCategory}>
              <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FRANCHISE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Property Type — only shown when Real Estate is selected */}
        {category === "Real Estate" && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
              Property Type
            </label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
                <SelectValue placeholder="All Property Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                {REAL_ESTATE_PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Related Interests */}
      {availableInterests.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
            Related Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: selectedInterests.includes(interest) ? '#D8A11F' : '#F3F4F6',
                  color: selectedInterests.includes(interest) ? '#fff' : '#000',
                  border: '1px solid ' + (selectedInterests.includes(interest) ? '#D8A11F' : '#E5E7EB')
                }}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}