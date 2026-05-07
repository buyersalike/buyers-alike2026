import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart3, Table as TableIcon, Users } from "lucide-react";
import CreatePartnershipDialog from "@/components/partnerships/CreatePartnershipDialog";
import PartnershipDetailsDialog from "@/components/partnerships/PartnershipDetailsDialog";
import PartnershipDashboard from "@/components/partnerships/PartnershipDashboard";
import GroupStagesView from "@/components/partnerships/GroupStagesView";
import PartnershipStageProgress from "@/components/partnerships/PartnershipStageProgress";

const stageColors = {
  outreach: { bg: '#FEF3C7', text: '#92400E' },
  negotiation: { bg: '#FEF3C7', text: '#92400E' },
  agreement: { bg: '#DBEAFE', text: '#1E40AF' },
  active: { bg: '#D1FAE5', text: '#065F46' },
  renewal: { bg: '#FED7AA', text: '#9A3412' },
  termination: { bg: '#FEE2E2', text: '#991B1B' },
  completed: { bg: '#E5E7EB', text: '#374151' }
};

export default function LifecycleTab() {
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [subTab, setSubTab] = useState("dashboard");

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ['partnerships'],
    queryFn: () => base44.entities.Partnership.list('-created_date')
  });

  const handlePartnershipClick = (partnership) => {
    setSelectedPartnership(partnership);
    setDetailsOpen(true);
  };

  return (
    <div>
      {/* Sub-tabs and action */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setSubTab("dashboard")}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={subTab === "dashboard"
              ? { background: '#D8A11F', color: '#fff' }
              : { background: 'rgba(255, 255, 255, 0.8)', color: '#000', border: '1px solid rgba(0, 0, 0, 0.1)' }
            }
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => setSubTab("all")}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={subTab === "all"
              ? { background: '#D8A11F', color: '#fff' }
              : { background: 'rgba(255, 255, 255, 0.8)', color: '#000', border: '1px solid rgba(0, 0, 0, 0.1)' }
            }
          >
            <TableIcon className="w-4 h-4 mr-2" />
            All Partnerships
          </Button>
          <Button
            onClick={() => setSubTab("groups")}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={subTab === "groups"
              ? { background: '#D8A11F', color: '#fff' }
              : { background: 'rgba(255, 255, 255, 0.8)', color: '#000', border: '1px solid rgba(0, 0, 0, 0.1)' }
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Group Stages
          </Button>
        </div>
        <CreatePartnershipDialog />
      </div>

      {/* Dashboard sub-tab */}
      {subTab === "dashboard" && <PartnershipDashboard />}

      {/* Group Stages sub-tab */}
      {subTab === "groups" && <GroupStagesView />}

      {/* All Partnerships sub-tab */}
      {subTab === "all" && (
        <>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D8A11F' }} />
              <p style={{ color: '#666' }}>Loading partnerships...</p>
            </div>
          ) : partnerships.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
              <p className="text-lg font-semibold" style={{ color: '#000' }}>No partnerships yet</p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>Create your first one to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnerships.map((partnership) => {
                const stageColor = stageColors[partnership.stage] || stageColors.outreach;
                return (
                  <div
                    key={partnership.id}
                    onClick={() => handlePartnershipClick(partnership)}
                    className="p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg" style={{ color: '#000' }}>
                        {partnership.title}
                      </h3>
                      <Badge className="capitalize" style={{ background: stageColor.bg, color: stageColor.text }}>
                        {partnership.stage}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <p style={{ color: '#000' }}>
                        <span className="font-medium">Partner:</span> {partnership.partner_name}
                      </p>
                      {partnership.industry && (
                        <p style={{ color: '#666' }}>
                          <span className="font-medium" style={{ color: '#000' }}>Industry:</span> {partnership.industry}
                        </p>
                      )}
                      {partnership.deal_size && (
                        <p style={{ color: '#666' }}>
                          <span className="font-medium" style={{ color: '#000' }}>Deal Size:</span> {partnership.deal_size}
                        </p>
                      )}
                      {partnership.start_date && (
                        <p style={{ color: '#666' }}>
                          <span className="font-medium" style={{ color: '#000' }}>Started:</span> {format(new Date(partnership.start_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <PartnershipStageProgress stage={partnership.stage} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedPartnership && (
        <PartnershipDetailsDialog
          partnership={selectedPartnership}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
}