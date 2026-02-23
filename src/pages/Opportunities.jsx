import React, { useState, useEffect, useMemo } from "react";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunitiesFilter from "@/components/opportunities/OpportunitiesFilter";
import OpportunitiesPagination from "@/components/opportunities/OpportunitiesPagination";
import Sidebar from "@/components/partnerships/Sidebar";
import { Sparkles, TrendingUp } from "lucide-react";
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
  const [investmentRange, setInvestmentRange] = useState([0, 2000000]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [sortBy, setSortBy] = useState("most_recent");
  const [franchiseCategory, setFranchiseCategory] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  // Fetch database opportunities
  const { data: dbOpportunities = [] } = useQuery({
    queryKey: ['dbOpportunities'],
    queryFn: () => base44.entities.Opportunity.list('-created_date'),
    enabled: !!currentUser,
  });

  // Fetch user interests for filtering
  const { data: userInterests = [] } = useQuery({
    queryKey: ['userInterests'],
    queryFn: () => base44.entities.Interest.list(),
    enabled: !!currentUser,
  });

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

  const { data: franchiseData } = useQuery({
    queryKey: ['franchiseOpportunities'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchFranchiseOpportunities', {});
      return response.data;
    },
    enabled: !!currentUser,
  });

  // Combine all opportunity sources
  const allOpportunities = useMemo(() => {
    const combined = [
      ...opportunitiesData.map(opp => ({
        ...opp,
        source: 'static',
        investmentMin: parseInvestmentRange(opp.investment).min,
        investmentMax: parseInvestmentRange(opp.investment).max,
        category: opp.type
      })),
      ...(realEstateData?.opportunities || []).map(opp => ({
        ...opp,
        source: 'api',
        investmentMin: parseInvestmentRange(opp.investment).min,
        investmentMax: parseInvestmentRange(opp.investment).max,
        category: opp.type
      })),
      ...(franchiseData?.opportunities || []).map(opp => ({
        ...opp,
        source: 'franchise',
        investmentMin: opp.investmentMin || parseInvestmentRange(opp.investment).min,
        investmentMax: opp.investmentMax || parseInvestmentRange(opp.investment).max,
        category: 'Franchise'
      })),
      ...dbOpportunities.map(opp => ({
        ...opp,
        source: 'db',
        investmentMin: opp.investment_min || 0,
        investmentMax: opp.investment_max || 0,
        type: opp.category,
        investment: formatInvestment(opp.investment_min, opp.investment_max)
      }))
    ];
    return combined;
  }, [realEstateData, dbOpportunities]);

  // Helper function to parse investment range
  function parseInvestmentRange(investmentStr) {
    if (!investmentStr) return { min: 0, max: 0 };
    const matches = investmentStr.match(/\$?([\d,]+)/g);
    if (!matches) return { min: 0, max: 0 };
    const values = matches.map(m => parseInt(m.replace(/[$,]/g, '')));
    return { min: values[0] || 0, max: values[1] || values[0] || 0 };
  }

  function parsePostedDate(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  function formatInvestment(min, max) {
    if (!min && !max) return 'Contact for details';
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }

  // Get all unique interests for filtering
  const availableInterests = useMemo(() => {
    const interests = new Set();
    dbOpportunities.forEach(opp => {
      if (opp.related_interests && Array.isArray(opp.related_interests)) {
        opp.related_interests.forEach(interest => interests.add(interest));
      }
    });
    return Array.from(interests).sort();
  }, [dbOpportunities]);

  // Filter + sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = allOpportunities.filter((opp) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category/type filter
      const matchesCategory = category === "all" || 
        opp.category === category || 
        opp.type === category;

      // Investment range filter
      const oppMin = opp.investmentMin || 0;
      const oppMax = opp.investmentMax || oppMin;
      const matchesInvestment = 
        (oppMin >= investmentRange[0] && oppMin <= investmentRange[1]) ||
        (oppMax >= investmentRange[0] && oppMax <= investmentRange[1]) ||
        (oppMin <= investmentRange[0] && oppMax >= investmentRange[1]);

      // Interests filter
      const matchesInterests = selectedInterests.length === 0 || (
        opp.related_interests && Array.isArray(opp.related_interests) &&
        opp.related_interests.some(interest => selectedInterests.includes(interest))
      );

      // Franchise sub-category filter
      const matchesFranchiseCategory = franchiseCategory === "all" || 
        category !== "Franchise" ||
        opp.franchiseCategory === franchiseCategory ||
        opp.title?.toLowerCase().includes(franchiseCategory.split(' ')[0].toLowerCase()) ||
        opp.description?.toLowerCase().includes(franchiseCategory.toLowerCase());

      // Real estate property type filter
      const matchesPropertyType = propertyType === "all" ||
        category !== "Real Estate" ||
        opp.title?.toLowerCase().includes(propertyType.toLowerCase()) ||
        opp.description?.toLowerCase().includes(propertyType.toLowerCase());

      return matchesSearch && matchesCategory && matchesInvestment && matchesInterests && matchesFranchiseCategory && matchesPropertyType;
    });

    // Sort
    if (sortBy === "lowest_investment") {
      filtered = [...filtered].sort((a, b) => (a.investmentMin || 0) - (b.investmentMin || 0));
    } else if (sortBy === "highest_investment") {
      filtered = [...filtered].sort((a, b) => (b.investmentMax || 0) - (a.investmentMax || 0));
    }
    // "most_recent" — sort all by parsed date descending
    if (sortBy === "most_recent" || !sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = parsePostedDate(a.postedDate || a.created_date || "");
        const dateB = parsePostedDate(b.postedDate || b.created_date || "");
        return dateB - dateA;
      });
    }

    return filtered;
  }, [allOpportunities, searchQuery, category, investmentRange, selectedInterests, sortBy, franchiseCategory, propertyType]);

  // Pagination
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOpportunities.slice(startIndex, endIndex);
  }, [filteredOpportunities, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, investmentRange, selectedInterests, sortBy, franchiseCategory, propertyType]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setInvestmentRange([0, 2000000]);
    setSelectedInterests([]);
    setSortBy("most_recent");
    setFranchiseCategory("all");
    setPropertyType("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (investmentRange[0] !== 0 || investmentRange[1] !== 2000000 ? 1 : 0) +
    selectedInterests.length +
    (franchiseCategory !== "all" ? 1 : 0) +
    (propertyType !== "all" ? 1 : 0) +
    (sortBy !== "most_recent" ? 1 : 0);

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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#000' }}>
              Business Opportunities
            </h1>
            <div className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium" style={{ background: '#D8A11F', color: '#fff' }}>
              AI-Matched
            </div>
          </div>
          <p className="text-sm sm:text-base" style={{ color: '#666' }}>
            Discover opportunities matched to your profile, interests, and activity
          </p>
        </div>

        {/* Filters */}
        <OpportunitiesFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          investmentRange={investmentRange}
          setInvestmentRange={setInvestmentRange}
          selectedInterests={selectedInterests}
          setSelectedInterests={setSelectedInterests}
          availableInterests={availableInterests}
          clearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
          sortBy={sortBy}
          setSortBy={setSortBy}
          franchiseCategory={franchiseCategory}
          setFranchiseCategory={setFranchiseCategory}
          propertyType={propertyType}
          setPropertyType={setPropertyType}
        />

        {/* AI-Matched Opportunities */}
        {isLoading ? (
          <div className="text-center py-12">
            <p style={{ color: '#666' }}>Analyzing opportunities for you...</p>
          </div>
        ) : aiMatches?.success && aiMatches.opportunities?.length > 0 ? (
          <>
            {/* Top 2 Matches */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#D8A11F' }} />
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#000' }}>
                  Your Top Matches
                </h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {aiMatches.opportunities.slice(0, 2).map((opp) => (
                  <div key={opp.id} className="p-4 sm:p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#000' }}>{opp.title}</h3>
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
                    <p className="mb-4 text-sm sm:text-base" style={{ color: '#666' }}>{opp.description}</p>
                    
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

            {/* Filtered Opportunities with Pagination */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#000' }}>
                  All Opportunities
                  <span className="ml-2 text-xs sm:text-sm font-normal" style={{ color: '#666' }}>
                    ({filteredOpportunities.length})
                  </span>
                </h2>
              </div>

              {paginatedOpportunities.length > 0 ? (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedOpportunities.map((opportunity, index) => (
                      <OpportunityCard 
                        key={`${opportunity.source}-${opportunity.id}`} 
                        opportunity={opportunity} 
                        index={index} 
                      />
                    ))}
                  </div>

                  <OpportunitiesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredOpportunities.length}
                    itemsPerPage={itemsPerPage}
                  />
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg" style={{ color: '#666' }}>
                    No opportunities found matching your filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
}