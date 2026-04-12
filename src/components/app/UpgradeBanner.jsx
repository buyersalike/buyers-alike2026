import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function UpgradeBanner({ user }) {
  const isPaid = user?.subscription_plan === "professional" || user?.subscription_plan === "enterprise";
  if (!user || isPaid || user.role === "admin") return null;

  return (
    <div
      className="mx-2 mb-4 p-3 rounded-xl relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(216,161,31,0.15) 0%, rgba(124,58,237,0.12) 100%)",
        border: "1px solid rgba(216,161,31,0.3)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(216,161,31,0.2)" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#D8A11F" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold mb-0.5" style={{ color: "#E5EDFF" }}>
            Upgrade to Pro
          </p>
          <p className="text-[11px] leading-tight" style={{ color: "#B6C4E0" }}>
            Unlimited connections, verified badge & more
          </p>
          <Link
            to="/#pricing"
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
            style={{ background: "#D8A11F", color: "#fff" }}
          >
            View Plans <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}