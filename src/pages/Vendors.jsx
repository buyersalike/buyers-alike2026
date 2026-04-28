import React, { useState } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, Filter } from "lucide-react";
import VendorCard from "@/components/vendors/VendorCard";
import BecomeVendorBanner from "@/components/vendors/BecomeVendorBanner";
import VendorApplicationDialog from "@/components/vendors/VendorApplicationDialog";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";



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
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  // Fetch approved vendors from database
  const { data: vendorsData = [], isLoading } = useQuery({
    queryKey: ['approvedVendors'],
    queryFn: async () => {
      const vendors = await base44.entities.VendorApplication.filter({ status: 'approved' });
      return vendors.map(vendor => ({
        ...vendor,
        id: vendor.id,
        name: vendor.business_name,
        category: vendor.category,
        address: `${vendor.province}, Canada`,
        province: vendor.province,
        featured: vendor.featured || false,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.business_name)}&background=EA580C&color=fff&size=200`
      }));
    },
  });

  const featuredVendors = vendorsData.filter(vendor => vendor.featured);
  
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
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 p-8 rounded-2xl" style={{ background: '#D8A11F' }}>
            <div className="flex items-center gap-3 mb-3">
              <Store className="w-8 h-8" style={{ color: '#fff' }} />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#fff' }}>
                Vendor Directory
              </h1>
            </div>
            <p style={{ color: '#fff' }}>
              Explore our trusted network of approved vendors
            </p>
          </div>

          {/* Become a Vendor Banner */}
          <BecomeVendorBanner onApplyClick={() => setIsApplicationDialogOpen(true)} />

          {/* Vendor Application Dialog */}
          <VendorApplicationDialog 
            open={isApplicationDialogOpen} 
            onOpenChange={setIsApplicationDialogOpen}
          />

          {/* Featured Vendors Section */}
          {featuredVendors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#000' }}>
                Featured Vendors
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredVendors.map((vendor, index) => (
                  <VendorCard key={vendor.id} vendor={vendor} index={index} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Vendors Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>
              All Vendors
            </h2>

            {/* Search and Filters */}
            <div className="p-6 mb-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#666' }} />
                    <Input
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
                      style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-1">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
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
                    <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
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
                    style={{ background: '#fff', color: '#000', border: '1px solid #000' }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Vendors Grid */}
            {isLoading ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                <p className="text-lg" style={{ color: '#666' }}>
                  Loading vendors...
                </p>
              </div>
            ) : filteredVendors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor, index) => (
                  <VendorCard key={vendor.id} vendor={vendor} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                <p className="text-lg" style={{ color: '#666' }}>
                  {vendorsData.length === 0 ? 'No approved vendors yet' : 'No vendors found matching your search criteria'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}