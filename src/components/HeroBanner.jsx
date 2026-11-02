'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useModal } from '@/context/ModalContext';
import './HeroBanner.css';

/**
 * Helper clamping and mapping functions
 */
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const mapRange = (v, inMin, inMax, outMin, outMax) => {
  const t = clamp((v - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
};

/**
 * HeroBanner Component for Comfort Aircon
 * 
 * Scroll Assembly Architecture:
 * - Pinned scroll track (280vh) with sticky 100vh viewport
 * - Step 01 (0.00-0.28): Heavy-Duty Galvanized Chassis & Pure Copper Evaporator Coil
 * - Step 02 (0.28-0.56): High-Output Blower Rotor, Inverter Motor & PM 2.5 Filters
 * - Step 03 (0.56-0.78): Precision Front Aerodynamic Casing & Hidden Smart LED Display (18°C)
 * - Step 04 (0.78-0.98): Motorized Louver Opens, Full 3D Cyan Airflow Erupts, Chips Float In
 * - Step 05 (0.98-1.00+): Assembly Complete, naturally unpins and continues into next section
 */
export default function HeroBanner() {
  // Safe useModal connection
  let openAppointment = () => {};
  try {
    const modal = useModal();
    if (modal && modal.openAppointment) {
      openAppointment = modal.openAppointment;
    }
  } catch (e) {
    // Graceful fallback for preview / standalone environment
  }

  // Accessibility: Respect reduced motion preference
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress Tracking across the 280vh track
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(shouldReduceMotion ? 1 : 0);
  const [activeStep, setActiveStep] = useState(shouldReduceMotion ? 4 : 1);
  const [hasSnapped, setHasSnapped] = useState(false);

  const handleScroll = useCallback(() => {
    if (shouldReduceMotion || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackHeight = trackRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollDistance = trackHeight - windowHeight;

    if (scrollDistance <= 0) return;

    // Calculate progress (0.0 at top of track, 1.0 when track completes)
    const rawProgress = -rect.top / scrollDistance;
    const p = clamp(rawProgress, 0, 1);
    setScrollProgress(p);

    // Active Step Mapping
    if (p < 0.28) {
      setActiveStep(1);
    } else if (p < 0.56) {
      setActiveStep(2);
    } else if (p < 0.78) {
      setActiveStep(3);
    } else {
      setActiveStep(4);
    }

    // Magnetic snap pulse when casing locks in
    if (p >= 0.70 && !hasSnapped) {
      setHasSnapped(true);
    } else if (p < 0.65 && hasSnapped) {
      setHasSnapped(false);
    }
  }, [shouldReduceMotion, hasSnapped]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Jump to specific step via pill click
  const jumpToStep = (stepNumber) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const trackHeight = trackRef.current.offsetHeight;
    const scrollDistance = trackHeight - window.innerHeight;

    const targets = {
      1: 0.08,
      2: 0.38,
      3: 0.66,
      4: 0.90,
    };
    const targetP = targets[stepNumber] || 0;
    const targetY = trackTop + targetP * scrollDistance;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  // Desktop Mouse Parallax across the entire hero area (subtle +/-4deg Y, +/-1.5deg X)
  const sectionRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 992 && !window.matchMedia('(pointer: coarse)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxRotateY = useTransform(smoothMouseX, [-1, 1], [-3.5, 3.5]);
  const parallaxRotateX = useTransform(smoothMouseY, [-1, 1], [1.2, -1.2]);

  const handleMouseMove = (e) => {
    if (!isDesktop || shouldReduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(Math.max(-1, Math.min(1, x)));
    mouseY.set(Math.max(-1, Math.min(1, y)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Text container entrance variants
  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // Effective progress (always 1.0 for reduced motion)
  const p = shouldReduceMotion ? 1 : scrollProgress;

  // Component transforms driven by scroll progress:
  // STEP 1: Chassis & Copper Coils
  const chassisOpacity = shouldReduceMotion ? 0 : clamp(mapRange(p, 0.0, 0.14, 0.4, 1.0));
  const coilX = shouldReduceMotion ? 0 : mapRange(p, 0.05, 0.25, -60, 0);
  const coilOpacity = shouldReduceMotion ? 0 : clamp(mapRange(p, 0.05, 0.22, 0, 1.0));

  // STEP 2: Blower Fan & PM 2.5 Filter
  const blowerX = shouldReduceMotion ? 0 : mapRange(p, 0.25, 0.45, 60, 0);
  const blowerOpacity = shouldReduceMotion ? 0 : clamp(mapRange(p, 0.25, 0.42, 0, 1.0));
  const filterY = shouldReduceMotion ? 0 : mapRange(p, 0.35, 0.54, -40, 0);
  const filterOpacity = shouldReduceMotion ? 0 : clamp(mapRange(p, 0.35, 0.50, 0, 1.0));

  // STEP 3: Outer Aerodynamic Casing & Hidden LED Display
  const casingX = shouldReduceMotion ? 0 : mapRange(p, 0.52, 0.72, 45, 0);
  const casingZ = shouldReduceMotion ? 0 : mapRange(p, 0.52, 0.72, 80, 0);
  const casingScale = shouldReduceMotion ? 1 : mapRange(p, 0.52, 0.72, 1.06, 1.0);
  const casingOpacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.50, 0.68, 0, 1.0));
  const tempOpacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.68, 0.76, 0, 1.0));

  // Fade out internal blueprint layer completely as the outer casing locks in (0.58 -> 0.72)
  const internalLayerOpacity = shouldReduceMotion ? 0 : clamp(mapRange(p, 0.58, 0.72, 1.0, 0.0));

  // STEP 4: 3D Cyan Airflow & Feature Chips
  const airflowOpacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.74, 0.86, 0, 1.0));
  const airflowScale = shouldReduceMotion ? 1 : mapRange(p, 0.74, 0.88, 0.92, 1.0);
  const chip1Opacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.78, 0.86, 0, 1.0));
  const chip2Opacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.82, 0.89, 0, 1.0));
  const chip3Opacity = shouldReduceMotion ? 1 : clamp(mapRange(p, 0.85, 0.92, 0, 1.0));

  return (
    <div className="ca-hero-scroll-track" ref={trackRef} id="home">
      <div className="ca-hero-sticky-viewport">
        <section
          className="ca-hero-section position-relative overflow-hidden"
          ref={sectionRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* =========================================================
              LAYER 0: Deep Navy Background & Ambient Glow Orbs
              ========================================================= */}
          <div className="ca-hero-texture" aria-hidden="true" />
          <div className="ca-hero-glow-topleft" aria-hidden="true" />
          <div className="ca-hero-glow-product" aria-hidden="true" />
          <div className="ca-hero-glow-cyan" aria-hidden="true" />

          {/* =========================================================
              LAYER 1: Full-Bleed Animated Visual Layer (No Isolation)
              ========================================================= */}
          <div className="ca-hero-bg-visual" aria-hidden="true">
            {/* Cool-air drifting particles */}
            <div className="ca-hero-particles-layer">
              <span className="ca-hero-particle ca-hero-p1" />
              <span className="ca-hero-particle ca-hero-p2" />
              <span className="ca-hero-particle ca-hero-p3" />
              <span className="ca-hero-particle ca-hero-p4" />
              <span className="ca-hero-particle ca-hero-p5" />
              <span className="ca-hero-particle ca-hero-p6" />
            </div>

            {/* Anchored AC Stage (Right-aligned, wide bleed) */}
            <div className="ca-hero-bg-stage">
              <motion.div
                className="ca-hero-product-card"
                style={{
                  rotateX: shouldReduceMotion ? 0 : parallaxRotateX,
                  rotateY: shouldReduceMotion ? 0 : parallaxRotateY,
                }}
              >
                {/* Gentle continuous float */}
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: [0, -8, 0],
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? {}
                      : {
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                  }
                >
                  {/* Sibling underglow to gently lift black toward navy */}
                  <div className="ca-hero-ac-underglow" />

                  {/* AC Assembly Frame */}
                  <div className="ca-hero-ac-wrap">
                    <div className="ca-hero-assembly-frame">
                      {/* SVG Vector Layer: Chassis, Copper Coils, Blower Fan, PM2.5 Mesh */}
                      <div className="ca-hero-part-layer" style={{ opacity: internalLayerOpacity }}>
                        <svg
                          viewBox="0 0 1376 768"
                          className="ca-hero-assembly-svg"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="caChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#1E293B" />
                              <stop offset="50%" stopColor="#0F172A" />
                              <stop offset="100%" stopColor="#111E38" />
                            </linearGradient>
                            <linearGradient id="caCopperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#FDE68A" />
                              <stop offset="25%" stopColor="#F59E0B" />
                              <stop offset="70%" stopColor="#D97706" />
                              <stop offset="100%" stopColor="#78350F" />
                            </linearGradient>
                            <linearGradient id="caFinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#1E3A8A" />
                              <stop offset="50%" stopColor="#2563EB" />
                              <stop offset="100%" stopColor="#1D4ED8" />
                            </linearGradient>
                            <linearGradient id="caMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
                              <stop offset="100%" stopColor="rgba(14, 165, 233, 0.15)" />
                            </linearGradient>
                            <pattern id="caFinPattern" width="8" height="16" patternUnits="userSpaceOnUse">
                              <line x1="2" y1="0" x2="2" y2="16" stroke="#38BDF8" strokeWidth="1" opacity="0.45" />
                              <line x1="6" y1="0" x2="6" y2="16" stroke="#1E40AF" strokeWidth="1" opacity="0.65" />
                            </pattern>
                            <pattern id="caFilterPattern" width="12" height="12" patternUnits="userSpaceOnUse">
                              <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="none" stroke="#22D3EE" strokeWidth="0.8" opacity="0.35" />
                            </pattern>
                          </defs>

                          {/* STEP 1: Galvanized Steel Mounting Chassis & Base Plate */}
                          <g
                            className="ca-part-group ca-part-chassis"
                            style={{ opacity: chassisOpacity }}
                          >
                            <rect x="320" y="72" width="748" height="308" rx="16" fill="url(#caChassisGrad)" stroke="#334155" strokeWidth="2" />
                            <rect x="332" y="84" width="724" height="284" rx="12" fill="none" stroke="rgba(34, 211, 238, 0.25)" strokeDasharray="6 4" />
                            <line x1="320" y1="226" x2="1068" y2="226" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
                            <line x1="694" y1="72" x2="694" y2="380" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
                            <circle cx="360" cy="110" r="8" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                            <line x1="356" y1="110" x2="364" y2="110" stroke="#CBD5E1" strokeWidth="2" />
                            <circle cx="1028" cy="110" r="8" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                            <line x1="1024" y1="110" x2="1032" y2="110" stroke="#CBD5E1" strokeWidth="2" />
                            <circle cx="360" cy="342" r="8" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                            <line x1="356" y1="342" x2="364" y2="342" stroke="#CBD5E1" strokeWidth="2" />
                            <circle cx="1028" cy="342" r="8" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                            <line x1="1024" y1="110" x2="1032" y2="110" stroke="#CBD5E1" strokeWidth="2" />
                            <rect x="348" y="326" width="90" height="34" rx="6" fill="#0F172A" stroke="#0284C7" strokeWidth="1.5" />
                            <circle cx="372" cy="343" r="9" fill="url(#caCopperGrad)" />
                            <circle cx="412" cy="343" r="12" fill="url(#caCopperGrad)" />
                            <text x="350" y="110" fill="#38BDF8" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="700" letterSpacing="1.5">CHASSIS // GALVANIZED STEEL</text>
                          </g>

                          {/* STEP 1: Evaporator Heat Exchanger & Copper Grooved Coils */}
                          <g
                            className="ca-part-group ca-part-coil"
                            style={{
                              transform: `translateX(${coilX}px)`,
                              opacity: coilOpacity,
                            }}
                          >
                            <rect x="352" y="98" width="640" height="190" rx="8" fill="url(#caFinGrad)" opacity="0.9" />
                            <rect x="352" y="98" width="640" height="190" rx="8" fill="url(#caFinPattern)" />
                            <path d="M 352 115 C 330 115 330 145 352 145" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 352 165 C 330 165 330 195 352 195" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 352 215 C 330 215 330 245 352 245" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 352 260 C 335 260 335 280 352 280" fill="none" stroke="url(#caCopperGrad)" strokeWidth="10" strokeLinecap="round" />
                            <path d="M 992 135 C 1014 135 1014 165 992 165" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 992 185 C 1014 185 1014 215 992 215" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <path d="M 992 235 C 1014 235 1014 265 992 265" fill="none" stroke="url(#caCopperGrad)" strokeWidth="12" strokeLinecap="round" />
                            <rect x="780" y="110" width="200" height="26" rx="6" fill="rgba(4, 11, 31, 0.85)" stroke="#F59E0B" strokeWidth="1" />
                            <text x="792" y="127" fill="#FCD34D" fontFamily="'DM Sans', sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="1">100% INNER-GROOVED COPPER</text>
                          </g>

                          {/* STEP 2: Cross-Flow Blower Fan & Inverter Motor */}
                          <g
                            className="ca-part-group ca-part-blower"
                            style={{
                              transform: `translateX(${blowerX}px)`,
                              opacity: blowerOpacity,
                            }}
                          >
                            <rect x="360" y="296" width="580" height="52" rx="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                            <g opacity="0.6" stroke="#38BDF8" strokeWidth="1.5">
                              <line x1="380" y1="300" x2="395" y2="344" />
                              <line x1="410" y1="300" x2="425" y2="344" />
                              <line x1="440" y1="300" x2="455" y2="344" />
                              <line x1="470" y1="300" x2="485" y2="344" />
                              <line x1="500" y1="300" x2="515" y2="344" />
                              <line x1="530" y1="300" x2="545" y2="344" />
                              <line x1="560" y1="300" x2="575" y2="344" />
                              <line x1="590" y1="300" x2="605" y2="344" />
                              <line x1="620" y1="300" x2="635" y2="344" />
                              <line x1="650" y1="300" x2="665" y2="344" />
                              <line x1="680" y1="300" x2="695" y2="344" />
                              <line x1="710" y1="300" x2="725" y2="344" />
                              <line x1="740" y1="300" x2="755" y2="344" />
                              <line x1="770" y1="300" x2="785" y2="344" />
                              <line x1="800" y1="300" x2="815" y2="344" />
                              <line x1="830" y1="300" x2="845" y2="344" />
                              <line x1="860" y1="300" x2="875" y2="344" />
                              <line x1="890" y1="300" x2="905" y2="344" />
                              <line x1="920" y1="300" x2="935" y2="344" />
                            </g>
                            <rect x="948" y="288" width="85" height="66" rx="8" fill="#0F172A" stroke="#22D3EE" strokeWidth="1.5" />
                            <circle cx="990" cy="321" r="18" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
                            <circle cx="990" cy="321" r="7" fill="#22D3EE" />
                            <text x="956" y="368" fill="#22D3EE" fontFamily="'DM Sans', sans-serif" fontSize="9" fontWeight="700" letterSpacing="1">DC INVERTER</text>
                          </g>

                          {/* STEP 2: Dual PM 2.5 Nano-Silver Filtration Screens */}
                          <g
                            className="ca-part-group ca-part-filter"
                            style={{
                              transform: `translateY(${filterY}px)`,
                              opacity: filterOpacity,
                            }}
                          >
                            <rect x="360" y="94" width="295" height="184" rx="8" fill="url(#caMeshGrad)" stroke="#06B6D4" strokeWidth="1.5" />
                            <rect x="360" y="94" width="295" height="184" rx="8" fill="url(#caFilterPattern)" />
                            <rect x="665" y="94" width="295" height="184" rx="8" fill="url(#caMeshGrad)" stroke="#06B6D4" strokeWidth="1.5" />
                            <rect x="665" y="94" width="295" height="184" rx="8" fill="url(#caFilterPattern)" />
                            <rect x="470" y="88" width="75" height="12" rx="4" fill="#22D3EE" />
                            <rect x="775" y="88" width="75" height="12" rx="4" fill="#22D3EE" />
                            <text x="380" y="120" fill="#FFFFFF" fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="1">PM 2.5 NANO-SILVER MESH</text>
                          </g>
                        </svg>
                      </div>

                      {/* STEP 3: Front White Aerodynamic Casing & LED Display */}
                      <div
                        className="ca-hero-part-casing"
                        style={{
                          transform: `translateX(${casingX}px) translateZ(${casingZ}px) scale(${casingScale})`,
                          opacity: casingOpacity,
                        }}
                      >
                        <img
                          src="/images/hero-ac-body.png"
                          alt="Comfort Aircon Carrier & Toshiba Split AC Front Casing"
                          width={1376}
                          height={768}
                          className="ca-hero-casing-img"
                          draggable="false"
                        />

                        {/* Authentic Seamless Inverter LED Display */}
                        <div
                          className="ca-hero-temp-display"
                          style={{ opacity: tempOpacity }}
                        >
                          <span>21</span>
                          <span className="ca-hero-temp-unit">°</span>
                          <span className="ca-hero-temp-label">AUTO</span>
                        </div>
                      </div>

                      {/* Magnetic Assembly Snap Flash Pulse */}
                      {hasSnapped && <div className="ca-hero-snap-flash" />}

                      {/* STEP 4: Motorized Louver Cyan Airflow Burst */}
                      <div
                        className="ca-hero-part-airflow"
                        style={{
                          opacity: airflowOpacity,
                          transform: `scale(${airflowScale})`,
                        }}
                      >
                        <img
                          src="/images/hero-ac-airflow.png"
                          alt="Cool Airflow Waves"
                          width={1376}
                          height={768}
                          className="ca-hero-airflow-img"
                          draggable="false"
                        />

                        {/* Pure CSS Animated Airflow Streaks */}
                        <div className="ca-hero-airflow-container">
                          <span className="ca-hero-airflow-streak ca-hero-streak-1" />
                          <span className="ca-hero-airflow-streak ca-hero-streak-2" />
                          <span className="ca-hero-airflow-streak ca-hero-streak-3" />
                          <span className="ca-hero-airflow-streak ca-hero-streak-4" />
                        </div>
                      </div>
                    </div>

                    {/* STEP 4: Feature Chips (Kept inside viewport by >= 24px) */}
                    <div className="ca-hero-chips-wrap">
                      <div
                        className="ca-hero-chip ca-hero-chip-1"
                        style={{
                          opacity: chip1Opacity,
                          transform: `scale(${chip1Opacity})`,
                        }}
                      >
                        <span className="ca-hero-chip-icon">
                          <i className="fa-solid fa-microchip" aria-hidden="true" />
                        </span>
                        <span>Inverter Technology</span>
                      </div>

                      <div
                        className="ca-hero-chip ca-hero-chip-2"
                        style={{
                          opacity: chip2Opacity,
                          transform: `scale(${chip2Opacity})`,
                        }}
                      >
                        <span className="ca-hero-chip-icon">
                          <i className="fa-solid fa-leaf" aria-hidden="true" />
                        </span>
                        <span>Energy Efficient</span>
                      </div>

                      <div
                        className="ca-hero-chip ca-hero-chip-3"
                        style={{
                          opacity: chip3Opacity,
                          transform: `scale(${chip3Opacity})`,
                        }}
                      >
                        <span className="ca-hero-chip-icon">
                          <i className="fa-solid fa-snowflake" aria-hidden="true" />
                        </span>
                        <span>Powerful Cooling</span>
                      </div>
                    </div>

                    {/* Sibling Ground Shadow */}
                    <div className="ca-hero-bottom-shadow" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* =========================================================
              LAYER 2: Readability Gradient Overlay
              ========================================================= */}
          <div className="ca-hero-readability-overlay" aria-hidden="true" />

          {/* =========================================================
              LAYER 3: Foreground Content (Text, Buttons, Trust Chips)
              ========================================================= */}
          <div className="ca-hero-foreground">
            <div className="container-xxl">
              <motion.div
                className="ca-hero-content"
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Eyebrow Pill */}
                <motion.div variants={textItemVariants}>
                  <div className="ca-hero-eyebrow">
                    <span className="ca-hero-cyan-dot" />
                    <span>Authorized Carrier &amp; Toshiba Partner</span>
                  </div>
                </motion.div>

                {/* Step-by-Step Interactive Assembly Pills */}
                <motion.div variants={textItemVariants}>
                  <div className="ca-hero-step-bar" role="tablist" aria-label="AC Assembly Steps">
                    <button
                      type="button"
                      className={`ca-hero-step-pill ${activeStep === 1 ? 'active' : ''}`}
                      onClick={() => jumpToStep(1)}
                      title="Step 1: Mounting Chassis & Copper Coils"
                    >
                      <span className="ca-hero-step-dot" />
                      <span>01 Chassis &amp; Coil</span>
                    </button>

                    <button
                      type="button"
                      className={`ca-hero-step-pill ${activeStep === 2 ? 'active' : ''}`}
                      onClick={() => jumpToStep(2)}
                      title="Step 2: Inverter Motor & PM 2.5 Filters"
                    >
                      <span className="ca-hero-step-dot" />
                      <span>02 Motor &amp; Filter</span>
                    </button>

                    <button
                      type="button"
                      className={`ca-hero-step-pill ${activeStep === 3 ? 'active' : ''}`}
                      onClick={() => jumpToStep(3)}
                      title="Step 3: Aerodynamic Front Casing & Display"
                    >
                      <span className="ca-hero-step-dot" />
                      <span>03 Casing &amp; Display</span>
                    </button>

                    <button
                      type="button"
                      className={`ca-hero-step-pill ${activeStep === 4 ? 'active' : ''}`}
                      onClick={() => jumpToStep(4)}
                      title="Step 4: Full 3D Airflow Blast"
                    >
                      <span className="ca-hero-step-dot" />
                      <span>04 3D Airflow</span>
                    </button>
                  </div>

                  {/* Progress Line */}
                  <div className="ca-hero-progress-line-wrap" aria-hidden="true">
                    <div
                      className="ca-hero-progress-line-fill"
                      style={{ width: `${Math.round(p * 100)}%` }}
                    />
                  </div>
                </motion.div>

                {/* Main Headline */}
                <motion.h1 className="ca-hero-title" variants={textItemVariants}>
                  Complete Air <br />
                  <span className="ca-hero-gradient-text">Conditioning Solutions</span>
                </motion.h1>

                {/* Supporting Paragraph */}
                <motion.p className="ca-hero-desc" variants={textItemVariants}>
                  Get professional AC installation, repair, and maintenance from our experienced team.
                  We work with major AC brands to deliver reliable performance, efficient cooling,
                  and customer satisfaction.
                </motion.p>

                {/* Action Buttons (CTA Group) */}
                <motion.div className="ca-hero-cta-group" variants={textItemVariants}>
                  <button
                    type="button"
                    className="ca-hero-btn-primary"
                    onClick={() => openAppointment()}
                  >
                    <i className="fa-regular fa-calendar-check fs-6" aria-hidden="true" />
                    <span>Book a Service</span>
                  </button>

                  <a href="#services" className="ca-hero-btn-secondary">
                    <span>Explore Our Services</span>
                    <i className="fa-solid fa-arrow-right fs-7" aria-hidden="true" />
                  </a>
                </motion.div>

                {/* Trust Row (Glass Chips) */}
                <motion.div className="ca-hero-trust-row" variants={textItemVariants}>
                  <div className="ca-hero-trust-chip">
                    <i className="fa-solid fa-award ca-hero-trust-icon" aria-hidden="true" />
                    <span>10+ Years Experience</span>
                  </div>

                  <div className="ca-hero-trust-chip">
                    <i className="fa-solid fa-shield-halved ca-hero-trust-icon" aria-hidden="true" />
                    <span>Genuine Warranty</span>
                  </div>

                  <div className="ca-hero-trust-chip">
                    <i className="fa-solid fa-bolt-lightning ca-hero-trust-icon" aria-hidden="true" />
                    <span>Fast Installation</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Smooth Bottom Gradient Fade / Divider to Next Section */}
          <div className="ca-hero-bottom-divider" aria-hidden="true" />
        </section>
      </div>
    </div>
  );
}
