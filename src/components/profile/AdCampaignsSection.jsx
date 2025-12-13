import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import moment from "moment";

export default function AdCampaignsSection({ campaigns, pendingAdApps, isOwnProfile }) {
  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  const activeCampaigns = campaigns.filter(c => 
    c.status === 'approved' && (!c.expiry_date || new Date(c.expiry_date) > new Date())
  );
  const expiredCampaigns = campaigns.filter(c => 
    c.status === 'expired' || (c.expiry_date && new Date(c.expiry_date) <= new Date())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 rounded-2xl mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#E5EDFF' }}>
              Ad Campaigns
            </h3>
            <p className="text-sm" style={{ color: '#7A8BA6' }}>
              {activeCampaigns.length} active, {expiredCampaigns.length} expired
            </p>
          </div>
        </div>
        {isOwnProfile && (
          <Link to={createPageUrl('AdCampaigns')}>
            <Button className="rounded-lg flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}>
              Manage Campaigns
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Pending Applications Alert */}
      {pendingAdApps > 0 && (
        <div className="mb-4 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <Clock className="w-5 h-5 flex-shrink-0" style={{ color: '#F59E0B' }} />
          <div className="flex-1">
            <p className="font-semibold" style={{ color: '#F59E0B' }}>
              {pendingAdApps} Pending Application{pendingAdApps > 1 ? 's' : ''}
            </p>
            <p className="text-sm" style={{ color: '#FCD34D' }}>
              Your ad application{pendingAdApps > 1 ? 's are' : ' is'} awaiting approval
            </p>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#B6C4E0' }}>
            <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
            Active Campaigns
          </h4>
          <div className="space-y-2">
            {activeCampaigns.slice(0, 3).map(campaign => {
              const daysRemaining = campaign.expiry_date 
                ? moment(campaign.expiry_date).diff(moment(), 'days')
                : null;
              const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;

              return (
                <div 
                  key={campaign.id}
                  className="p-3 rounded-xl flex items-center justify-between" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <div className="flex-1">
                    <p className="font-semibold mb-1" style={{ color: '#E5EDFF' }}>
                      {campaign.business_name}
                    </p>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>
                      {campaign.package}
                    </p>
                  </div>
                  {daysRemaining !== null && (
                    <Badge className={isExpiringSoon ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}>
                      {daysRemaining} days left
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
          {activeCampaigns.length > 3 && (
            <p className="text-xs mt-2" style={{ color: '#7A8BA6' }}>
              +{activeCampaigns.length - 3} more active campaign{activeCampaigns.length - 3 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Expired Campaigns */}
      {expiredCampaigns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#B6C4E0' }}>
            <Clock className="w-4 h-4" style={{ color: '#7A8BA6' }} />
            Recently Expired
          </h4>
          <div className="space-y-2">
            {expiredCampaigns.slice(0, 2).map(campaign => (
              <div 
                key={campaign.id}
                className="p-3 rounded-xl flex items-center justify-between" 
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#B6C4E0' }}>
                    {campaign.business_name}
                  </p>
                  <p className="text-xs" style={{ color: '#7A8BA6' }}>
                    Expired {moment(campaign.expiry_date).fromNow()}
                  </p>
                </div>
                <Badge className="bg-gray-500/20 text-gray-300">
                  Expired
                </Badge>
              </div>
            ))}
          </div>
          {expiredCampaigns.length > 2 && (
            <p className="text-xs mt-2" style={{ color: '#7A8BA6' }}>
              +{expiredCampaigns.length - 2} more expired campaign{expiredCampaigns.length - 2 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {activeCampaigns.length === 0 && expiredCampaigns.length === 0 && pendingAdApps === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: '#7A8BA6' }} />
          <p style={{ color: '#B6C4E0' }}>No campaigns yet</p>
        </div>
      )}
    </motion.div>
  );
}