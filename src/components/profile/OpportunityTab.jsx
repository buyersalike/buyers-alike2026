import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Briefcase, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OpportunityCard from "./OpportunityCard";
import CreateOpportunityDialog from "./CreateOpportunityDialog";

export default function OpportunityTab({ userEmail }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's approved interests
  const { data: userInterests = [] } = useQuery({
    queryKey: ['user-interests', userEmail],
    queryFn: () => base44.entities.Interest.filter({ user_email: userEmail, status: 'approved' }),
  });

  // Fetch all opportunities
  const { data: allOpportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.Opportunity.list(),
  });

  // Filter opportunities created by the user
  const myCreatedOpportunities = allOpportunities.filter(opp => opp.creator_email === userEmail);

  // Filter available opportunities based on user interests
  const availableOpportunities = allOpportunities.filter(opp => {
    // Don't show user's own opportunities in available
    if (opp.creator_email === userEmail) return false;
    
    // If opportunity has no related interests, show it to everyone
    if (!opp.related_interests || opp.related_interests.length === 0) return true;
    
    // Check if any of the opportunity's related interests match user's interests
    const userInterestNames = userInterests.map(i => i.interest_name);
    return opp.related_interests.some(interest => userInterestNames.includes(interest));
  });

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8" style={{ color: '#3B82F6' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>Opportunities</h2>
            <p className="text-sm" style={{ color: '#7A8BA6' }}>
              Discover and manage business opportunities
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="rounded-lg flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" />
          Create New Opportunity
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="glass-card p-2 rounded-2xl mb-6" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
          <TabsTrigger value="available" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
            Available Opportunities ({availableOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="created" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
            My Created Opportunities ({myCreatedOpportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {availableOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {availableOpportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A8BA6' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#E5EDFF' }}>
                No Available Opportunities
              </h3>
              <p style={{ color: '#7A8BA6' }}>
                Opportunities matching your interests will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="created">
          {myCreatedOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {myCreatedOpportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A8BA6' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#E5EDFF' }}>
                No Created Opportunities
              </h3>
              <p style={{ color: '#7A8BA6' }}>
                Click "Create New Opportunity" to add your first opportunity
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateOpportunityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        userEmail={userEmail}
      />
    </div>
  );
}