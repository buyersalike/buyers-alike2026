import React from "react";

export default function StatCard({ icon: Icon, value, label, gradient, delay }) {
  return (
    <div
      className="flex items-center gap-4 glass-card glass-card-hover px-5 py-4 rounded-2xl animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-7 h-7" style={{ color: '#fff' }} />
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: '#E5EDFF' }}>
          {value}
        </p>
        <p className="text-sm font-medium" style={{ color: '#B6C4E0' }}>{label}</p>
      </div>
    </div>
  );
}