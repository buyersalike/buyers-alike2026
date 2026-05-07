import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const stageOrder = [
  "outreach",
  "negotiation",
  "agreement",
  "active",
  "renewal",
  "completed"
];

const stageLabels = {
  outreach: "Outreach",
  negotiation: "Negotiation",
  agreement: "Agreement",
  active: "Active",
  renewal: "Renewal",
  completed: "Completed"
};

export default function PartnershipStageProgress({ stage }) {
  const currentIdx = stageOrder.indexOf(stage);
  const progress = currentIdx >= 0 ? ((currentIdx + 1) / stageOrder.length) * 100 : 0;

  const progressLabel = stage === 'completed' ? 'Completed' :
    stage === 'renewal' ? 'Renewal Phase' :
    stage === 'active' ? 'Active Partnership' :
    stage === 'agreement' ? 'Agreement Phase' :
    stage === 'negotiation' ? 'Negotiation Phase' :
    stage === 'termination' ? 'Termination' :
    'Getting Started';

  return (
    <div className="pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D8A11F' }}>
          {progressLabel}
        </span>
        <span className="text-xs font-bold" style={{ color: '#14B8A6' }}>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #3B82F6, #14B8A6)' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {stageOrder.map((s, idx) => {
          const isComplete = currentIdx >= idx;
          return (
            <div key={s} className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} />
              ) : (
                <Circle className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />
              )}
              <span className={`text-xs ${isComplete ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {stageLabels[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}