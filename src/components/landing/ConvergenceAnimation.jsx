import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Handshake, Lightbulb, Target, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stakeholders = [
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    icon: Lightbulb,
    color: "#7C3AED",
    gradient: "from-purple-500 to-purple-600",
    initialX: -160,
    initialY: -160,
  },
  {
    id: "investor",
    label: "Investor",
    icon: TrendingUp,
    color: "#22C55E",
    gradient: "from-green-500 to-green-600",
    initialX: 160,
    initialY: -160,
  },
  {
    id: "partner",
    label: "Partner",
    icon: Handshake,
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    initialX: -160,
    initialY: 160,
  },
  {
    id: "expert",
    label: "Expert",
    icon: Users,
    color: "#EF4444",
    gradient: "from-red-500 to-red-600",
    initialX: 160,
    initialY: 160,
  },
];

const animationStages = [
  {
    title: "Diverse Perspectives",
    description: "Four different stakeholders, each with unique goals and expertise, operating independently.",
  },
  {
    title: "Discovering Opportunities",
    description: "Recognition that collaboration could unlock greater value than working alone.",
  },
  {
    title: "Building Connections",
    description: "Stakeholders begin to align their interests and move toward common ground.",
  },
  {
    title: "Goals Achieved Together",
    description: "United by a shared vision, they form powerful partnerships that drive success.",
  },
];

export default function ConvergenceAnimation() {
  const [stage, setStage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadingText, setFadingText] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setFadingText(true);
      setTimeout(() => {
        setStage((prev) => (prev >= 3 ? 0 : prev + 1));
        setFadingText(false);
      }, 300);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrevStage = () => {
    setIsPaused(true);
    setFadingText(true);
    setTimeout(() => {
      setStage((prev) => (prev > 0 ? prev - 1 : 3));
      setFadingText(false);
    }, 200);
  };

  const handleNextStage = () => {
    setIsPaused(true);
    setFadingText(true);
    setTimeout(() => {
      setStage((prev) => (prev < 3 ? prev + 1 : 0));
      setFadingText(false);
    }, 200);
  };

  const getPosition = (stakeholder) => {
    const progress = stage / 3;
    return {
      x: stakeholder.initialX * (1 - progress),
      y: stakeholder.initialY * (1 - progress),
    };
  };

  return (
    <div className="relative w-full flex flex-col gap-6">
      {/* Stage description panel */}
      <div
        className="w-full transition-opacity duration-300"
        style={{ opacity: fadingText ? 0 : 1 }}
      >
        <div
          className="backdrop-blur-xl rounded-2xl p-6 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
            {animationStages[stage].title}
          </h3>
          <p className="text-sm lg:text-base text-white/80 leading-relaxed">
            {animationStages[stage].description}
          </p>

          {/* Progress indicators and controls */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex justify-center gap-2">
              {animationStages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStage(idx);
                    setIsPaused(true);
                  }}
                  className="h-1.5 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300"
                  style={{
                    width: idx === stage ? "32px" : "8px",
                    background:
                      idx === stage
                        ? "linear-gradient(90deg, #3B82F6, #7C3AED)"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                />
              ))}
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevStage}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => setIsPaused(!isPaused)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                style={{ background: isPaused ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: '#fff' }}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>

              <Button
                onClick={handleNextStage}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {isPaused && (
              <p className="text-xs text-white/60 animate-fade-in-up">
                Paused • Use controls to navigate
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main animation container */}
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: '480px' }}>
        <div className="relative w-full max-w-xl" style={{ height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Center goal */}
          <div
            className="absolute top-1/2 left-1/2 z-10 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translate(-50%, -50%) scale(${stage === 3 ? 1.15 : 1})`,
            }}
          >
            <div
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl"
              style={{
                boxShadow: stage === 3
                  ? "0 0 60px rgba(250, 204, 21, 0.6)"
                  : "0 0 20px rgba(250, 204, 21, 0.3)",
                transition: "box-shadow 0.7s ease-in-out",
              }}
            >
              <Target className="w-14 h-14 lg:w-16 lg:h-16 text-white" />
            </div>
            <p className="text-center mt-3 font-bold text-lg lg:text-xl text-white">
              Shared Goal
            </p>
          </div>

          {/* Stakeholders */}
          {stakeholders.map((stakeholder, index) => {
            const position = getPosition(stakeholder);
            
            return (
              <div key={stakeholder.id}>
                {/* Connection lines */}
                {stage >= 1 && (
                  <svg
                    className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none transition-opacity duration-500"
                    style={{
                      transform: 'translate(-50%, -50%)',
                      opacity: stage >= 2 ? 0.4 : 0.2,
                    }}
                  >
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`${50 + (position.x / 5.6)}%`}
                      y2={`${50 + (position.y / 4.8)}%`}
                      stroke={stakeholder.color}
                      strokeWidth="2"
                      strokeDasharray="8 4"
                    />
                  </svg>
                )}

                {/* Stakeholder node */}
                <div
                  className="absolute top-1/2 left-1/2 cursor-pointer transition-all duration-700 ease-in-out"
                  style={{
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  }}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  <div
                    className={`w-18 h-18 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${stakeholder.gradient} flex items-center justify-center shadow-xl relative hover:scale-110 transition-transform duration-300`}
                    style={{
                      boxShadow: stage === 3
                        ? `0 10px 40px ${stakeholder.color}80`
                        : `0 5px 20px ${stakeholder.color}40`,
                      transition: "box-shadow 0.7s ease-in-out, transform 0.3s ease",
                    }}
                  >
                    {React.createElement(stakeholder.icon, { className: "w-9 h-9 lg:w-10 lg:h-10 text-white" })}
                    
                    {/* Pulsing ring effect */}
                    {stage >= 2 && (
                      <div
                        className="absolute inset-0 rounded-2xl animate-pulse"
                        style={{
                          border: `2px solid ${stakeholder.color}`,
                          opacity: 0.4,
                          animationDelay: `${index * 0.3}s`,
                        }}
                      />
                    )}
                  </div>
                  
                  <p className="text-center mt-2 font-semibold text-sm text-white">
                    {stakeholder.label}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Energy particles during convergence - CSS only */}
          {stage >= 2 && stage < 3 && (
            <>
              {Array.from({ length: 8 }, (_, i) => i).map((i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse-float"
                  style={{
                    transform: `translate(-50%, -50%) translate(${Math.cos((i * Math.PI * 2) / 8) * 100}px, ${Math.sin((i * Math.PI * 2) / 8) * 100}px)`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.5s',
                  }}
                />
              ))}
            </>
          )}

          {/* Success burst effect */}
          {stage === 3 && (
            <div
              className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/30 blur-2xl pointer-events-none animate-fade-in-up"
              style={{ transform: 'translate(-50%, -50%)' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}