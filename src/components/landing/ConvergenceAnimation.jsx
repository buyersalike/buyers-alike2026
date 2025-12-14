import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, Handshake, Lightbulb, Target } from "lucide-react";

const stakeholders = [
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    icon: Lightbulb,
    color: "#7C3AED",
    gradient: "from-purple-500 to-purple-600",
    position: { initial: { x: -160, y: -160 }, center: { x: 0, y: 0 } },
  },
  {
    id: "investor",
    label: "Investor",
    icon: TrendingUp,
    color: "#22C55E",
    gradient: "from-green-500 to-green-600",
    position: { initial: { x: 160, y: -160 }, center: { x: 0, y: 0 } },
  },
  {
    id: "partner",
    label: "Partner",
    icon: Handshake,
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    position: { initial: { x: -160, y: 160 }, center: { x: 0, y: 0 } },
  },
  {
    id: "expert",
    label: "Expert",
    icon: Users,
    color: "#EF4444",
    gradient: "from-red-500 to-red-600",
    position: { initial: { x: 160, y: 160 }, center: { x: 0, y: 0 } },
  },
];

const animationStages = [
  {
    stage: 0,
    title: "Diverse Perspectives",
    description: "Four different stakeholders, each with unique goals and expertise, operating independently.",
  },
  {
    stage: 1,
    title: "Discovering Opportunities",
    description: "Recognition that collaboration could unlock greater value than working alone.",
  },
  {
    stage: 2,
    title: "Building Connections",
    description: "Stakeholders begin to align their interests and move toward common ground.",
  },
  {
    stage: 3,
    title: "Goals Achieved Together",
    description: "United by a shared vision, they form powerful partnerships that drive success.",
  },
];

export default function ConvergenceAnimation() {
  const [stage, setStage] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => {
        if (prev >= 3) {
          // Reset animation
          setAnimationKey((k) => k + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getStakeholderPosition = (stakeholder) => {
    if (stage === 0) {
      return stakeholder.position.initial;
    } else if (stage === 3) {
      return stakeholder.position.center;
    } else {
      // Intermediate stages - move progressively toward center
      const progress = stage / 3;
      return {
        x: stakeholder.position.initial.x * (1 - progress),
        y: stakeholder.position.initial.y * (1 - progress),
      };
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-6">
      {/* Stage description panel - moved to top */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div
            className="backdrop-blur-xl rounded-2xl p-6 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <motion.h3
              className="text-xl lg:text-2xl font-bold text-white mb-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {animationStages[stage].title}
            </motion.h3>
            <p className="text-sm lg:text-base text-white/80 leading-relaxed">
              {animationStages[stage].description}
            </p>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {animationStages.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-1.5 rounded-full"
                  style={{
                    width: idx === stage ? "32px" : "8px",
                    background:
                      idx === stage
                        ? "linear-gradient(90deg, #3B82F6, #7C3AED)"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  animate={{
                    width: idx === stage ? "32px" : "8px",
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main animation container */}
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: '480px' }}>
        <div className="relative w-full max-w-xl" style={{ height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Center goal - always visible */}
          <motion.div
            key={`center-${animationKey}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stage === 3 ? 1.15 : 1,
              opacity: 1,
            }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{
                boxShadow:
                  stage === 3
                    ? [
                        "0 0 30px rgba(250, 204, 21, 0.4)",
                        "0 0 60px rgba(250, 204, 21, 0.6)",
                        "0 0 30px rgba(250, 204, 21, 0.4)",
                      ]
                    : "0 0 20px rgba(250, 204, 21, 0.3)",
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl"
            >
              <Target className="w-14 h-14 lg:w-16 lg:h-16 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-3 font-bold text-lg lg:text-xl text-white"
            >
              Shared Goal
            </motion.p>
          </motion.div>

          {/* Stakeholders */}
          {stakeholders.map((stakeholder, index) => {
            const position = getStakeholderPosition(stakeholder);
            
            return (
              <React.Fragment key={`${stakeholder.id}-${animationKey}`}>
                {/* Connection lines */}
                {stage >= 1 && (
                  <motion.svg
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: stage >= 2 ? 0.4 : 0.2 }}
                  >
                    <motion.line
                      x1="50%"
                      y1="50%"
                      x2={`calc(50% + ${position.x}px)`}
                      y2={`calc(50% + ${position.y}px)`}
                      stroke={stakeholder.color}
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </motion.svg>
                )}

                {/* Stakeholder node */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ x: stakeholder.position.initial.x, y: stakeholder.position.initial.y }}
                  animate={{
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`w-18 h-18 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${stakeholder.gradient} flex items-center justify-center shadow-xl relative`}
                    animate={{
                      boxShadow:
                        stage === 3
                          ? `0 10px 40px ${stakeholder.color}80`
                          : `0 5px 20px ${stakeholder.color}40`,
                    }}
                  >
                    <stakeholder.icon className="w-9 h-9 lg:w-10 lg:h-10 text-white" />
                    
                    {/* Pulsing ring effect */}
                    {stage >= 2 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ border: `2px solid ${stakeholder.color}` }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                    )}
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-2 font-semibold text-sm text-white"
                  >
                    {stakeholder.label}
                  </motion.p>
                </motion.div>
              </React.Fragment>
            );
          })}

          {/* Energy particles during convergence */}
          {stage >= 2 && stage < 3 && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 8) * 100,
                    y: Math.sin((i * Math.PI * 2) / 8) * 100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          )}

          {/* Success burst effect */}
          {stage === 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/30 blur-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}