import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function UpgradeBanner({ user }) {
  const isPaid = user?.subscription_plan === "professional" || user?.subscription_plan === "enterprise";
  if (!user || isPaid || user.role === "admin") return null;

  return (
    <Link
      to="/#pricing"
      className="block mb-4 p-3 rounded-xl relative overflow-hidden transition-all hover:opacity-90"
      style={{
        background: "linear-gradient(135deg, rgba(216,161,31,0.15) 0%, rgba(124,58,237,0.12) 100%)",
        border: "1px solid rgba(216,161,31,0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(216,161,31,0.2)" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#D8A11F" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-snug" style={{ color: "#E5EDFF" }}>
            Upgrade to Pro
          </p>
          <p className="text-[10px] leading-snug mt-0.5 truncate" style={{ color: "#B6C4E0" }}>
            Unlock all features
          </p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "#D8A11F" }} />
      </div>
    </Link>
  );
}