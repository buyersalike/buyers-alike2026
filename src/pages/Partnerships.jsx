import React, { useState } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import FilterBar from "@/components/partnerships/FilterBar";
import PartnershipCard from "@/components/partnerships/PartnershipCard";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";
import { pageMetadata } from "@/components/seo/seoMetadata";

// Sample data with status
const partnershipsData = [
  {
    id: 1,
    title: "Mary Brown's Chicken Franchise Opportunity",
    description: "Established chicken franchise with strong brand recognition looking for strategic investment partner to scale operations.",
    matchScore: 95,
    location: "San Francisco, CA",
    industry: "Food & Beverage",
    dealSize: "$2M - $5M",
    companySize: "50-100",
    postedDate: "2 days ago",
    status: "active",
  },
  {
    id: 13,
    title: "Anytime Fitness Franchise Opportunity",
    description: "24/7 fitness franchise opportunity with proven business model and support systems.",
    matchScore: 94,
    location: "Los Angeles, CA",
    industry: "Fitness",
    dealSize: "$1M - $3M",
    companySize: "25-50",
    postedDate: "1 week ago",
    status: "active",
  },
  {
    id: 14,
    title: "Coffee Shop Chain Partnership",
    description: "Growing coffee shop chain seeking partners for expansion into new markets.",
    matchScore: 88,
    location: "Seattle, WA",
    industry: "Food & Beverage",
    dealSize: "$500K - $1M",
    companySize: "10-25",
    postedDate: "3 days ago",
    status: "intent",
  },
  {
    id: 15,
    title: "Tech Startup Co-Founder Wanted",
    description: "AI-powered SaaS platform seeking technical co-founder for product development.",
    matchScore: 92,
    location: "Austin, TX",
    industry: "SaaS",
    dealSize: "$100K - $500K",
    companySize: "5-10",
    postedDate: "5 days ago",
    status: "intent",
  },
  {
    id: 16,
    title: "Real Estate Development Group",
    description: "Join established real estate development group for commercial projects.",
    matchScore: 87,
    location: "Miami, FL",
    industry: "Real Estate",
    dealSize: "$5M - $10M",
    companySize: "50-100",
    postedDate: "1 week ago",
    status: "available",
  },
  {
    id: 17,
    title: "E-commerce Platform Partnership",
    description: "Established e-commerce platform seeking partners for product line expansion.",
    matchScore: 90,
    location: "New York, NY",
    industry: "E-commerce",
    dealSize: "$1M - $3M",
    companySize: "25-50",
    postedDate: "4 days ago",
    status: "available",
  },
  {
    id: 18,
    title: "Restaurant Chain Acquisition",
    description: "Successfully completed acquisition and integration of multi-location restaurant chain.",
    matchScore: 95,
    location: "Chicago, IL",
    industry: "Food & Beverage",
    dealSize: "$3M - $5M",
    companySize: "100-250",
    postedDate: "3 months ago",
    status: "completed",
  },
  {
    id: 19,
    title: "Manufacturing Joint Venture",
    description: "Completed joint venture for automotive parts manufacturing facility.",
    matchScore: 91,
    location: "Detroit, MI",
    industry: "Manufacturing",
    dealSize: "$10M+",
    companySize: "250-500",
    postedDate: "6 months ago",
    status: "completed",
  },
  {
    id: 20,
    title: "Software Development Partnership",
    description: "Partnership declined due to misaligned technology stack and business goals.",
    matchScore: 78,
    location: "San Francisco, CA",
    industry: "Tech",
    dealSize: "$500K - $1M",
    companySize: "10-25",
    postedDate: "2 weeks ago",
    status: "declined",
  },
  {
    id: 21,
    title: "Retail Store Expansion",
    description: "Withdrawn from retail expansion partnership due to market conditions.",
    matchScore: 82,
    location: "Boston, MA",
    industry: "Retail",
    dealSize: "$2M - $4M",
    companySize: "50-100",
    postedDate: "1 month ago",
    status: "withdrawn",
  },
  {
    id: 2,
    title: "E-commerce Brand Acquisition Opportunity",
    description: "Profitable DTC e-commerce brand in health & wellness space. $3M annual revenue with strong margins and loyal customer base.",
    matchScore: 92,
    location: "Austin, TX",
    industry: "E-commerce",
    dealSize: "$1M - $3M",
    companySize: "10-25",
    postedDate: "3 days ago",
    status: "active",
  },
  {
    id: 2,
    title: "E-commerce Brand Acquisition Opportunity",
    description: "Profitable DTC e-commerce brand in health & wellness space. $3M annual revenue with strong margins and loyal customer base.",
    matchScore: 92,
    location: "Austin, TX",
    industry: "E-commerce",
    dealSize: "$1M - $3M",
    companySize: "10-25",
    postedDate: "3 days ago",
  },
  {
    id: 3,
    title: "Tech Startup Joint Venture",
    description: "AI-powered analytics platform seeking JV partner for expansion into European markets. Proven product-market fit.",
    matchScore: 88,
    location: "New York, NY",
    industry: "AI/Tech",
    dealSize: "$500K - $1M",
    companySize: "25-50",
    postedDate: "5 days ago",
  },
  {
    id: 4,
    title: "Manufacturing Business Merger",
    description: "Family-owned manufacturing business with 30-year history. Looking to merge with complementary company for market expansion.",
    matchScore: 85,
    location: "Chicago, IL",
    industry: "Manufacturing",
    dealSize: "$5M - $10M",
    companySize: "100-250",
    postedDate: "1 week ago",
  },
  {
    id: 5,
    title: "FinTech Strategic Partnership",
    description: "Digital payment platform with 100K+ users seeking strategic partner for product development and market expansion.",
    matchScore: 90,
    location: "Boston, MA",
    industry: "FinTech",
    dealSize: "$3M - $7M",
    companySize: "50-100",
    postedDate: "4 days ago",
  },
  {
    id: 6,
    title: "Real Estate Investment Opportunity",
    description: "Commercial real estate portfolio with stable cash flow. Seeking investment partner for portfolio expansion.",
    matchScore: 87,
    location: "Miami, FL",
    industry: "Real Estate",
    dealSize: "$10M+",
    companySize: "25-50",
    postedDate: "6 days ago",
  },
  {
    id: 7,
    title: "Healthcare Tech Acquisition",
    description: "Telemedicine platform with regulatory approvals. Strong growth trajectory and established provider network.",
    matchScore: 93,
    location: "Seattle, WA",
    industry: "HealthTech",
    dealSize: "$2M - $4M",
    companySize: "25-50",
    postedDate: "3 days ago",
  },
  {
    id: 8,
    title: "Marketing Agency Partnership",
    description: "Full-service digital marketing agency with Fortune 500 clients. Looking for merger to expand service offerings.",
    matchScore: 84,
    location: "Los Angeles, CA",
    industry: "Marketing",
    dealSize: "$1M - $2M",
    companySize: "50-75",
    postedDate: "1 week ago",
  },
  {
    id: 9,
    title: "Clean Energy Joint Venture",
    description: "Solar energy solutions provider seeking JV partner for residential market expansion. Proven technology and installations.",
    matchScore: 89,
    location: "Denver, CO",
    industry: "Clean Energy",
    dealSize: "$3M - $5M",
    companySize: "50-100",
    postedDate: "5 days ago",
  },
  {
    id: 10,
    title: "EdTech Platform Investment",
    description: "Online learning platform with 50K+ active students. Looking for investment to scale content and technology.",
    matchScore: 91,
    location: "San Diego, CA",
    industry: "EdTech",
    dealSize: "$1M - $3M",
    companySize: "25-50",
    postedDate: "4 days ago",
  },
  {
    id: 11,
    title: "Food & Beverage Brand Acquisition",
    description: "Organic beverage brand with national distribution. Strong brand recognition and growth potential.",
    matchScore: 86,
    location: "Portland, OR",
    industry: "F&B",
    dealSize: "$2M - $4M",
    companySize: "10-25",
    postedDate: "1 week ago",
  },
  {
    id: 12,
    title: "Logistics Company Partnership",
    description: "Last-mile delivery service with proprietary technology. Seeking strategic partner for geographic expansion.",
    matchScore: 88,
    location: "Dallas, TX",
    industry: "Logistics",
    dealSize: "$3M - $6M",
    companySize: "100-250",
    postedDate: "6 days ago",
  },
];

const tabs = [
  { id: "active", label: "My Active Partnerships", count: 0 },
  { id: "intent", label: "My Partnership Intents", count: 0 },
  { id: "available", label: "Available Groups to Join", count: 0 },
  { id: "completed", label: "Completed Partnerships", count: 0 },
  { id: "declined", label: "Declined/Withdrawn/Canceled", count: 0 }
];

export default function Partnerships() {
  const metadata = pageMetadata.Partnerships;
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("active");

  // Filter partnerships based on active tab
  const filteredPartnerships = partnershipsData.filter(p => {
    if (activeTab === "declined") {
      return p.status === "declined" || p.status === "withdrawn" || p.status === "canceled";
    }
    return p.status === activeTab;
  });

  // Update tab counts
  const tabsWithCounts = tabs.map(tab => {
    let count;
    if (tab.id === "declined") {
      count = partnershipsData.filter(p => 
        p.status === "declined" || p.status === "withdrawn" || p.status === "canceled"
      ).length;
    } else {
      count = partnershipsData.filter(p => p.status === tab.id).length;
    }
    return { ...tab, count };
  });

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
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#000' }}>
              My Partnerships
            </h1>
            <p style={{ color: '#000' }}>
              Manage your active, pending, and completed partnerships
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabsWithCounts.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'shadow-lg'
                      : ''
                  }`}
                  style={
                    activeTab === tab.id
                      ? { background: '#D8A11F', color: '#fff' }
                      : { background: 'rgba(255, 255, 255, 0.8)', color: '#000', border: '1px solid rgba(0, 0, 0, 0.1)' }
                  }
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={
                      activeTab === tab.id
                        ? { background: 'rgba(255, 255, 255, 0.3)', color: '#fff' }
                        : { background: 'rgba(0, 0, 0, 0.1)', color: '#000' }
                    }>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            totalResults={filteredPartnerships.length}
          />

          {/* Partnerships Grid */}
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-6"}>
            {filteredPartnerships.length > 0 ? (
              filteredPartnerships.map((partnership, index) => (
                <PartnershipCard 
                  key={partnership.id} 
                  partnership={partnership} 
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-16">
                <p className="text-lg" style={{ color: '#000' }}>
                  No partnerships found in this category
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}