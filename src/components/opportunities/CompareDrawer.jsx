import React, { useState } from "react";
import { useCompare } from "./CompareContext";
import { X, ChevronUp, ChevronDown, DollarSign, Calendar, Users, Phone, Mail, Globe, CheckCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [expanded, setExpanded] = useState(false);

  if (compareList.length === 0) return null;

  const rows = [
    { label: "Type", key: (o) => o.type || o.category || "—" },
    { label: "Investment", key: (o) => o.investment || "Contact for details" },
    { label: "Posted", key: (o) => o.postedDate || "—" },
    { label: "Partners", key: (o) => o.partners || "—" },
    { label: "Liquid Capital", key: (o) => o.liquidCapital || "—" },
    { label: "Franchise Fee", key: (o) => o.franchiseFee || "—" },
    { label: "Total Investment", key: (o) => o.totalInvestment || "—" },
    { label: "Contact Email", key: (o) => o.contact?.email || "—" },
    { label: "Contact Phone", key: (o) => o.contact?.phone || "—" },
  ];

  // Detect differences across compare list
  const isDifferent = (rowFn) => {
    const values = compareList.map(rowFn);
    return new Set(values).size > 1;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl transition-all duration-300"
      style={{ background: '#fff', borderTop: '2px solid #D8A11F' }}
    >
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 cursor-pointer"
        style={{ background: '#D8A11F' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-sm">
            Compare Opportunities ({compareList.length}/3)
          </span>
          <div className="flex gap-2">
            {compareList.map(o => (
              <span key={o.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                {o.title.length > 20 ? o.title.slice(0, 20) + '…' : o.title}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); clearCompare(); }}
            className="text-xs text-white underline"
          >
            Clear All
          </button>
          {expanded ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronUp className="w-5 h-5 text-white" />}
        </div>
      </div>

      {/* Expanded Comparison Table */}
      {expanded && (
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th className="text-left p-4 text-sm font-semibold w-32" style={{ color: '#666', background: '#f9fafb' }}>Field</th>
                {compareList.map(o => (
                  <th key={o.id} className="p-4 text-left" style={{ background: '#f9fafb' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold mb-1 inline-block" style={{ background: '#D8A11F', color: '#fff' }}>
                          {o.type || o.category}
                        </span>
                        <p className="text-sm font-semibold line-clamp-2" style={{ color: '#000' }}>{o.title}</p>
                      </div>
                      <button onClick={() => removeFromCompare(o.id)} className="flex-shrink-0 mt-1">
                        <X className="w-4 h-4" style={{ color: '#999' }} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const diff = isDifferent(row.key);
                return (
                  <tr key={row.label} style={{ borderBottom: '1px solid #f3f4f6', background: diff ? '#fffbeb' : '#fff' }}>
                    <td className="p-4 text-xs font-semibold" style={{ color: '#666' }}>
                      <div className="flex items-center gap-1">
                        {diff ? <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#D8A11F' }} /> : <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#22C55E' }} />}
                        {row.label}
                      </div>
                    </td>
                    {compareList.map(o => (
                      <td key={o.id} className="p-4 text-sm" style={{ color: '#000' }}>
                        {row.key(o)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 flex items-center gap-4 text-xs" style={{ borderTop: '1px solid #e5e7eb', color: '#666' }}>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#22C55E' }} />
              Same value
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#D8A11F' }} />
              Different value
            </div>
          </div>
        </div>
      )}
    </div>
  );
}