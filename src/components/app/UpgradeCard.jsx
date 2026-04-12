import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, Check, ArrowRight, Crown } from "lucide-react";

const FEATURES = [
  "Unlimited connections",
  "Verified profile badge",
  "Advanced search filters",
  "Direct messaging",
  "Analytics dashboard",
];

export default function UpgradeCard({ user }) {
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.subscription_plan !== "free" || user.role === "admin" || dismissed) return null;

  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        border: "1px solid rgba(216,161,31,0.25)",
      }}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-lg transition-all hover:bg-white/10 z-10"
      >
        <X className="w-4 h-4" style={{ color: "#7A8BA6" }} />
      </button>

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)" }}
          >
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1" style={{ color: "#E5EDFF" }}>
              You're on the Starter plan
            </h3>
            <p className="text-sm mb-4" style={{ color: "#7A8BA6" }}>
              Upgrade to Pro for the full BuyersAlike experience
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(216,161,31,0.2)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: "#D8A11F" }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#B6C4E0" }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)", color: "#fff" }}
              >
                <Sparkles className="w-4 h-4" /> Upgrade Now <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs font-medium px-3 py-2"
                style={{ color: "#7A8BA6" }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}