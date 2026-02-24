import React, { useState, useEffect, useMemo } from "react";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunitiesFilter from "@/components/opportunities/OpportunitiesFilter";
import OpportunitiesPagination from "@/components/opportunities/OpportunitiesPagination";
import CompareDrawer from "@/components/opportunities/CompareDrawer";
import { CompareProvider } from "@/components/opportunities/CompareContext";
import Sidebar from "@/components/partnerships/Sidebar";
import { Sparkles, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/seo/SEO";
import { pageMetadata } from "@/components/seo/seoMetadata";

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

  // Fetch saved opportunities for the current user
  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['savedOpportunities', currentUser?.email],
    queryFn: () => base44.entities.SavedOpportunity.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 30 * 1000,
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
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  const { data: realEstateCache } = useQuery({
    queryKey: ['realEstateCache'],
    queryFn: () => base44.entities.RealEstateCache.list('-created_date', 1),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: franchiseCache } = useQuery({
    queryKey: ['franchiseCache'],
    queryFn: () => base44.entities.FranchiseCache.list('-created_date', 1),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const realEstateData = useMemo(() => {
    const cache = realEstateCache?.[0];
    if (!cache) return null;
    return { success: true, opportunities: cache.opportunities || [] };
  }, [realEstateCache]);

  const franchiseData = useMemo(() => {
    const cache = franchiseCache?.[0];
    if (!cache) return null;
    return { success: true, opportunities: cache.opportunities || [] };
  }, [franchiseCache]);

  // Combine all opportunity sources — only recalculate when data actually changes
  const allOpportunities = useMemo(() => {
    const combined = [
      ...(realEstateData?.opportunities || []).map(opp => ({
        ...opp,
        source: 'api',
        investmentMin: opp.investmentMin || parseInvestmentRange(opp.investment).min,
        investmentMax: opp.investmentMax || parseInvestmentRange(opp.investment).max,
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
  }, [realEstateData, franchiseData, dbOpportunities]);

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
    <CompareProvider>
    <>
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
        {aiMatches?.success && aiMatches.opportunities?.length > 0 ? (
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
                    <OpportunityCard key={opp.id} opportunity={opp} index={index} currentUser={currentUser} savedOpportunities={savedOpportunities} />
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
                    <OpportunityCard key={opp.id} opportunity={opp} index={index} currentUser={currentUser} savedOpportunities={savedOpportunities} />
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
                        currentUser={currentUser}
                        savedOpportunities={savedOpportunities}
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
    <CompareDrawer />
    </>
    </CompareProvider>
  );
}