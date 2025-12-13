import React, { useState } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, Filter } from "lucide-react";
import VendorCard from "@/components/vendors/VendorCard";
import BecomeVendorBanner from "@/components/vendors/BecomeVendorBanner";
import AdvertiseBanner from "@/components/vendors/AdvertiseBanner";
import VendorApplicationDialog from "@/components/vendors/VendorApplicationDialog";
import AdvertiseApplicationDialog from "@/components/vendors/AdvertiseApplicationDialog";

const vendorsData = [
  {
    id: 1,
    name: "Test vendor",
    category: "Accounting",
    address: "123 Main Street, Anytown, Ontario, Canada",
    logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&h=200&fit=crop",
    province: "Ontario",
  },
  {
    id: 2,
    name: "Nicety AI Inc.",
    category: "Franchise Agent",
    address: "855 Crossgate Street, Ottawa, Ontario, Canada",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
    province: "Ontario",
  },
  {
    id: 3,
    name: "Legal Solutions Pro",
    category: "Legal Services",
    address: "456 Bay Street, Toronto, Ontario, Canada",
    logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop",
    province: "Ontario",
  },
  {
    id: 4,
    name: "Marketing Masters",
    category: "Marketing",
    address: "789 Yonge Street, Toronto, Ontario, Canada",
    logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop",
    province: "Ontario",
  },
  {
    id: 5,
    name: "Tech Consultants Ltd",
    category: "IT Services",
    address: "321 King Street, Vancouver, British Columbia, Canada",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop",
    province: "British Columbia",
  },
  {
    id: 6,
    name: "Financial Advisors Group",
    category: "Financial Services",
    address: "654 Queen Street, Calgary, Alberta, Canada",
    logo: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200&h=200&fit=crop",
    province: "Alberta",
  },
  {
    id: 7,
    name: "Construction Pros",
    category: "Construction",
    address: "987 Main Avenue, Montreal, Quebec, Canada",
    logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop",
    province: "Quebec",
  },
  {
    id: 8,
    name: "HR Solutions Inc",
    category: "Human Resources",
    address: "147 Spadina Road, Toronto, Ontario, Canada",
    logo: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200&h=200&fit=crop",
    province: "Ontario",
  },
];

const categories = [
  "All Categories",
  "Accounting",
  "Legal Services",
  "Marketing",
  "IT Services",
  "Financial Services",
  "Construction",
  "Human Resources",
  "Franchise Agent",
];

const provinces = [
  "All Provinces",
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
];

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isAdvertiseDialogOpen, setIsAdvertiseDialogOpen] = useState(false);

  const filteredVendors = vendorsData.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || vendor.category === selectedCategory;
    const matchesProvince = selectedProvince === "All Provinces" || vendor.province === selectedProvince;
    return matchesSearch && matchesCategory && matchesProvince;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedProvince("All Provinces");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-8 h-8" style={{ color: '#fff' }} />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#fff' }}>
                Vendor Directory
              </h1>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Explore our trusted network of approved vendors
            </p>
          </div>

          {/* Become a Vendor Banner */}
          <BecomeVendorBanner onApplyClick={() => setIsApplicationDialogOpen(true)} />

          {/* Apply to Advertise Banner */}
          <AdvertiseBanner onApplyClick={() => setIsAdvertiseDialogOpen(true)} />

          {/* Vendor Application Dialog */}
          <VendorApplicationDialog 
            open={isApplicationDialogOpen} 
            onOpenChange={setIsApplicationDialogOpen}
          />

          {/* Advertise Application Dialog */}
          <AdvertiseApplicationDialog 
            open={isAdvertiseDialogOpen} 
            onOpenChange={setIsAdvertiseDialogOpen}
          />

          {/* Featured Vendors Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#E5EDFF' }}>
              Featured Vendors
            </h2>

            {/* Search and Filters */}
            <div className="glass-card p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
                    <Input
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 glass-input"
                      style={{ color: '#E5EDFF' }}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Province Filter */}
                <div className="md:col-span-1">
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="md:col-span-1">
                  <Button
                    onClick={clearFilters}
                    className="w-full rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.18)' }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Vendors Grid */}
            {filteredVendors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredVendors.map((vendor, index) => (
                  <VendorCard key={vendor.id} vendor={vendor} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass-card">
                <p className="text-lg" style={{ color: '#7A8BA6' }}>
                  No vendors found matching your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}