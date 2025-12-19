import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import Sidebar from "@/components/partnerships/Sidebar";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/seo/SEO";
import { pageMetadata } from "@/components/seo/seoMetadata";

const opportunitiesData = [
  {
    id: 1,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3050119)",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    investment: "$360,000 - $360,000",
    description: "1 bathroom, Single Family, at 906 1250 BURNABY STREET|Vancouver, British Columbia V6E1P5, with...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 2,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3059243)",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    investment: "$369,000 - $369,000",
    description: "1 bathroom, Single Family, at 203 2146 W 43RD AVENUE|Vancouver, British Columbia V6M2E1, wit...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 3,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3023074)",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    investment: "$375,000 - $375,000",
    description: "1 bathroom, Single Family, at 204 3925 KINGSWAY STREET|Burnaby, British Columbia V5H3Y7, with...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 4,
    type: "Franchise",
    title: "Mary Brown's Chicken Franchise Opportunity",
    image: "https://images.unsplash.com/photo-1562158147-f89bc2368a26?w=800&h=600&fit=crop",
    investment: "$250,000 - $500,000",
    description: "Established chicken franchise with strong brand recognition. Comprehensive training and support provided...",
    postedDate: "December 5, 2025",
    partners: "3/15 partners",
  },
  {
    id: 5,
    type: "Franchise",
    title: "Anytime Fitness Franchise Opportunity",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
    investment: "$400,000 - $800,000",
    description: "24/7 fitness franchise with proven business model. Access to corporate support and marketing resources...",
    postedDate: "December 4, 2025",
    partners: "2/12 partners",
  },
  {
    id: 6,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3048120)",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
    investment: "$369,900 - $369,900",
    description: "1 bathroom, Single Family, at 418 138 E HASTINGS STREET|Vancouver, British Columbia V6A1N6, wit...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 7,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3065581)",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    investment: "$399,000 - $399,000",
    description: "1 bathroom, Single Family, at 211 868 KINGSWAY|Vancouver, British Columbia V5V3C3...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 8,
    type: "Real Estate",
    title: "Single Family - Toronto (MLS# R3048480)",
    image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
    investment: "$385,000 - $385,000",
    description: "1 bathroom, Single Family, at 1004 1330 HARWOOD STREET|Vancouver, British Columbia V6E1S8, wit...",
    postedDate: "December 7, 2025",
    partners: "1/20 partners",
  },
  {
    id: 9,
    type: "Business",
    title: "Coffee Shop Chain Expansion",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    investment: "$150,000 - $300,000",
    description: "Established coffee shop brand seeking partners for multi-location expansion. Prime locations secured...",
    postedDate: "December 6, 2025",
    partners: "5/10 partners",
  },
  {
    id: 10,
    type: "Business",
    title: "Tech Startup Co-Founder Opportunity",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    investment: "$50,000 - $150,000",
    description: "AI-powered SaaS platform seeking technical co-founder. Early-stage with strong market traction...",
    postedDate: "December 3, 2025",
    partners: "1/5 partners",
  },
  {
    id: 11,
    type: "Franchise",
    title: "Subway Franchise Opportunity",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    investment: "$200,000 - $400,000",
    description: "World-renowned sandwich franchise with established brand and customer base. Comprehensive training...",
    postedDate: "December 2, 2025",
    partners: "4/15 partners",
  },
  {
    id: 12,
    type: "Real Estate",
    title: "Commercial Property - Downtown Vancouver",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    investment: "$1,200,000 - $1,200,000",
    description: "Prime commercial space in downtown core. High foot traffic area with existing tenants...",
    postedDate: "December 1, 2025",
    partners: "8/25 partners",
  },
];

export default function Opportunities() {
  const metadata = pageMetadata.Opportunities;
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: aiMatches, isLoading } = useQuery({
    queryKey: ['personalizedOpportunities'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getPersonalizedOpportunities', {});
      return response.data;
    },
    enabled: !!currentUser,
  });

  const { data: realEstateData, isLoading: isLoadingRealEstate } = useQuery({
    queryKey: ['realEstateOpportunities'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchRealEstateOpportunities', {});
      return response.data;
    },
    enabled: !!currentUser,
  });

  // Combine static data with real estate API data
  const allOpportunities = [
    ...opportunitiesData,
    ...(realEstateData?.opportunities || [])
  ];

  const filteredOpportunities = allOpportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || opp.type === category;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
  };

  return (
    <div className="flex">
      <SEO 
        title={metadata.title}
        description={metadata.description}
        keywords={metadata.keywords}
      />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#000' }}>
              Business Opportunities
            </h1>
            <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: '#D8A11F', color: '#fff' }}>
              AI-Matched
            </div>
          </div>
          <p style={{ color: '#666' }}>
            Discover opportunities matched to your profile, interests, and activity
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                Search
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

            {/* Category */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl" style={{ color: '#000', background: '#F9FAFB', border: '1px solid #000' }}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Franchise">Franchise</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-1 flex items-end">
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

        {/* AI-Matched Opportunities */}
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: '#666' }}>Analyzing opportunities for you...</p>
          </div>
        ) : aiMatches?.success && aiMatches.opportunities?.length > 0 ? (
          <>
            {/* Top 2 Matches */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" style={{ color: '#D8A11F' }} />
                <h2 className="text-xl font-bold" style={{ color: '#000' }}>
                  Your Top Matches
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {aiMatches.opportunities.slice(0, 2).map((opp) => (
                  <div key={opp.id} className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-2xl font-bold" style={{ color: '#000' }}>{opp.title}</h3>
                          <div className="px-3 py-1 rounded-full text-sm font-bold" style={{ 
                            background: opp.matchScore >= 80 ? '#22C55E' : opp.matchScore >= 60 ? '#D8A11F' : '#F59E0B',
                            color: '#fff'
                          }}>
                            {opp.matchScore}% Match
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="px-3 py-1 rounded-full text-sm" style={{ background: '#D8A11F', color: '#fff' }}>
                            {opp.category}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm" style={{ background: '#666', color: '#fff' }}>
                            {opp.industry}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mb-4" style={{ color: '#666' }}>{opp.description}</p>
                    
                    {opp.matchExplanation && (
                      <div className="mb-4 p-4 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D8A11F' }} />
                          <p className="text-sm" style={{ color: '#000' }}>{opp.matchExplanation}</p>
                        </div>
                      </div>
                    )}

                    {opp.matchReasons && opp.matchReasons.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#000' }}>Why this matches you:</p>
                        <ul className="space-y-1">
                          {opp.matchReasons.map((reason, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#666' }}>
                              <TrendingUp className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: '#22C55E' }} />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Real Estate Highlights */}
            {realEstateData?.success && realEstateData.opportunities?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" style={{ color: '#D8A11F' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#000' }}>
                    Featured Real Estate Opportunities
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realEstateData.opportunities.slice(0, 6).map((opp, index) => (
                    <OpportunityCard key={opp.id} opportunity={opp} index={index} />
                  ))}
                </div>
              </div>
            )}


          </>
        ) : (
          <>
            {/* Real Estate Highlights */}
            {realEstateData?.success && realEstateData.opportunities?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5" style={{ color: '#D8A11F' }} />
                  <h2 className="text-xl font-bold" style={{ color: '#000' }}>
                    Featured Real Estate Opportunities
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realEstateData.opportunities.slice(0, 6).map((opp, index) => (
                    <OpportunityCard key={opp.id} opportunity={opp} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Fallback to original opportunities */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} index={index} />
              ))}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg" style={{ color: '#666' }}>
                  No opportunities found matching your filters
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </main>
    </div>
  );
}