import React from "react";

export default function SectionDivider({ from = "#192234", to = "#F2F1F5", flip = false }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '80px', marginTop: '-1px', marginBottom: '-1px' }}>
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        style={flip ? { transform: 'scaleY(-1)' } : {}}
      >
        <path
          d="M0 0H1440V20C1440 20 1200 80 720 80C240 80 0 20 0 20V0Z"
          fill={from}
        />
        <path
          d="M0 80H1440V20C1440 20 1200 80 720 80C240 80 0 20 0 20V80Z"
          fill={to}
        />
      </svg>
    </div>
  );
}