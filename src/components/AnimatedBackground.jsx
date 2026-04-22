// components/AnimatedBackground.jsx
import React from "react";
import { Box } from "@mui/material";

/**
 * Animated Background Component
 * Reusable animated background with floating shapes
 * Can be imported and used in any page/component
 */
const AnimatedBackground = ({ 
  children, 
  shapeColors = null,
  shapeSizes = null,
  animationSpeed = null,
  opacity = 0.65,
  blurAmount = 55,
  zIndex = 0,
  pointerEvents = "none"
}) => {
  // Default shape colors
  const defaultColors = ["#6c63ff", "#ff7eb3", "#00e5ff", "#ffd46b", "#9dffb0"];
  
  // Default shape sizes (width/height in px)
  const defaultSizes = [320, 260, 200, 180, 150];
  
  // Default animation speeds (in seconds)
  const defaultSpeeds = [7, 9, 11, 13, 8];
  
  const colors = shapeColors || defaultColors;
  const sizes = shapeSizes || defaultSizes;
  const speeds = animationSpeed || defaultSpeeds;

  // Custom animations
  const getAnimation = (index) => {
    const animations = [
      `float1 ${speeds[0]}s infinite`,
      `float2 ${speeds[1]}s infinite`,
      `float3 ${speeds[2]}s infinite`,
      `float4 ${speeds[3]}s infinite`,
      `float5 ${speeds[4]}s infinite`
    ];
    return animations[index];
  };

  const getKeyframes = () => `
    @keyframes float1 {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-30px) translateX(10px); }
      100% { transform: translateY(0) translateX(0); }
    }
    @keyframes float2 {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(25px) translateX(-15px); }
      100% { transform: translateY(0) translateX(0); }
    }
    @keyframes float3 {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-25px) translateY(10px); }
      100% { transform: translateX(0) translateY(0); }
    }
    @keyframes float4 {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(5deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes float5 {
      0% { transform: rotate(0deg) translateX(0); }
      50% { transform: rotate(8deg) translateX(-10px); }
      100% { transform: rotate(0deg) translateX(0); }
    }
  `;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: zIndex,
        pointerEvents: pointerEvents,
        overflow: "hidden",
      }}
    >
      <style>{getKeyframes()}</style>
      
      {/* Shape 1 */}
      <Box
        className="shape shape1"
        sx={{
          position: "absolute",
          width: sizes[0],
          height: sizes[0],
          borderRadius: "50%",
          background: colors[0],
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          top: "4%",
          left: "6%",
          animation: getAnimation(0),
        }}
      />
      
      {/* Shape 2 */}
      <Box
        className="shape shape2"
        sx={{
          position: "absolute",
          width: sizes[1],
          height: sizes[1],
          borderRadius: "50%",
          background: colors[1],
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          bottom: "10%",
          right: "10%",
          animation: getAnimation(1),
        }}
      />
      
      {/* Shape 3 */}
      <Box
        className="shape shape3"
        sx={{
          position: "absolute",
          width: sizes[2],
          height: sizes[2],
          borderRadius: "50%",
          background: colors[2],
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          bottom: "15%",
          left: "12%",
          animation: getAnimation(2),
        }}
      />
      
      {/* Shape 4 */}
      <Box
        className="shape shape4"
        sx={{
          position: "absolute",
          width: sizes[3],
          height: sizes[3],
          borderRadius: "50%",
          background: colors[3],
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          top: "25%",
          right: "18%",
          animation: getAnimation(3),
        }}
      />
      
      {/* Shape 5 */}
      <Box
        className="shape shape5"
        sx={{
          position: "absolute",
          width: sizes[4],
          height: sizes[4],
          borderRadius: "50%",
          background: colors[4],
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          top: "60%",
          left: "5%",
          animation: getAnimation(4),
        }}
      />
      
      {/* Optional children (content overlay) */}
      {children}
    </Box>
  );
};

export default AnimatedBackground;