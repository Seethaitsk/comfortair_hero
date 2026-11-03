'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModal } from '@/context/ModalContext';

gsap.registerPlugin(ScrollTrigger);

// Captions timed to start after the hero content fades out (~progress 0.18 / ~2.75s)
const CAPTIONS = [
  { start: 3.2, end: 6.8, html: 'Advanced technology for optimal cooling efficiency' },
  { start: 7.2, end: 11.0, html: 'Unleash the power of <span>precision</span> engineering' },
  { start: 12.0, end: 15.25, html: 'Comfort, engineered.' },
];

export default function AcScrollVideo() {
  const { openAppointment } = useModal();
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const scrollIndRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let target = 0;
    let current = 0;
    let raf;
    let activeIndex = -1;
    let trigger;

    const show = (i) => {
      if (i === activeIndex) return;
      if (activeIndex >= 0 && textRefs.current[activeIndex]) {
        gsap.to(textRefs.current[activeIndex], { opacity: 0, y: 24, duration: 0.25 });
      }
      if (i >= 0 && textRefs.current[i]) {
        // Guarantee hero is completely invisible whenever any caption appears
        if (heroRef.current) {
          heroRef.current.style.opacity = '0';
          heroRef.current.style.visibility = 'hidden';
          heroRef.current.style.pointerEvents = 'none';
        }
        gsap.fromTo(textRefs.current[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 });
      }
      activeIndex = i;
    };

    const setup = () => {
      trigger = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top top+=74',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = self.progress;
          target = progress * (video.duration || 15.234);

          // Captions index
          const i = CAPTIONS.findIndex((c) => target >= c.start && target <= c.end);
          show(i);

          // Hero content transition:
          // Fully visible at resting state (progress <= 0.002)
          // Dissolves between progress 0.002 and 0.035
          // GUARANTEED completely hidden before video bracket slides in (~0.5s / progress ~0.035) and whenever captions show
          if (heroRef.current) {
            if (i >= 0 || progress >= 0.035) {
              heroRef.current.style.opacity = '0';
              heroRef.current.style.visibility = 'hidden';
              heroRef.current.style.pointerEvents = 'none';
            } else if (progress <= 0.002) {
              heroRef.current.style.opacity = '1';
              heroRef.current.style.visibility = 'visible';
              heroRef.current.style.pointerEvents = 'auto';
              heroRef.current.style.transform = 'translate3d(0, -50%, 0)';
            } else {
              const t = (progress - 0.002) / (0.035 - 0.002);
              const heroAlpha = Math.max(0, 1 - t);
              heroRef.current.style.opacity = String(heroAlpha);
              heroRef.current.style.visibility = heroAlpha > 0.01 ? 'visible' : 'hidden';
              heroRef.current.style.pointerEvents = heroAlpha > 0.05 ? 'auto' : 'none';
              heroRef.current.style.transform = `translate3d(0, calc(-50% - ${35 * t}px), 0)`;
            }
          }

          // Scroll indicator fades out immediately on user scroll
          if (scrollIndRef.current) {
            const indAlpha = Math.max(0, 1 - progress / 0.02);
            scrollIndRef.current.style.opacity = String(indAlpha);
            scrollIndRef.current.style.pointerEvents = indAlpha > 0.02 ? 'auto' : 'none';
          }
        },
      });

      const tick = () => {
        current += (target - current) * 0.12;
        if (Math.abs(target - current) > 0.01) {
          video.currentTime = current;
        }
        raf = requestAnimationFrame(tick);
      };
      tick();

      // Recalculate ScrollTrigger metrics
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener('loadedmetadata', setup, { once: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      if (trigger) trigger.kill();
    };
  }, []);

  return (
    <section ref={wrapRef} className="ca-assembly-wrap" id="home">
      {/* Priority preload for hero video poster (LCP element) */}
      <link rel="preload" as="image" href="/videos/ac-poster.webp" fetchPriority="high" />

      <div className="ca-assembly-stage">
        {/* Layer 0: Scrubbable Video with fallback poster */}
        <video
          ref={videoRef}
          className="ca-assembly-video"
          muted
          playsInline
          preload="auto"
          poster="/videos/ac-poster.webp"
          src="/videos/ac-scrub.mp4"
        />

        {/* Layer 1: Readability Overlay (dark navy gradient + bottom shade) */}
        <div className="ca-assembly-overlay" aria-hidden="true" />
        <div className="ca-assembly-shade" aria-hidden="true" />

        {/* Layer 2: Hero Content block (centered on the left side) */}
        <div ref={heroRef} className="ca-assembly-hero-align">
          <div className="ca-assembly-hero">
            {/* Eyebrow Pill */}
            <div className="ca-assembly-badge">
              <span className="ca-assembly-badge-dot" aria-hidden="true" />
              <span>Authorized Carrier, Toshiba &amp; Midea AC Dealership</span>
            </div>

            {/* Headline - Single real <h1> on the homepage */}
            <h1 className="ca-assembly-title">
              Complete Air <br />
              <span className="ca-assembly-title-gradient">Conditioning Solutions</span>
            </h1>

            {/* Paragraph */}
            <p className="ca-assembly-desc">
              Get professional AC installation, repair, and maintenance from our experienced team. We work with major AC brands to deliver reliable performance, efficient cooling, and customer satisfaction.
            </p>

            {/* Action Buttons */}
            <div className="ca-assembly-cta-group">
              <button
                type="button"
                className="ca-assembly-btn ca-assembly-btn-primary"
                onClick={() => openAppointment()}
              >
                <i className="fa-regular fa-calendar-check" aria-hidden="true" />
                <span>Book a Service</span>
              </button>
              <a
                href="#services"
                className="ca-assembly-btn ca-assembly-btn-secondary"
              >
                <span>Explore Our Services</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator (bobbing with CSS, fades out on scroll) */}
        <div ref={scrollIndRef} className="ca-assembly-scroll-hint" aria-hidden="true">
          <span className="ca-assembly-mouse">
            <span className="ca-assembly-mouse-wheel" />
          </span>
          <span className="ca-assembly-scroll-text">Scroll</span>
        </div>

        {/* Layer 3: Captions */}
        {CAPTIONS.map((c, i) => (
          <h2
            key={i}
            ref={(el) => (textRefs.current[i] = el)}
            className="ca-assembly-text"
            dangerouslySetInnerHTML={{ __html: c.html }}
          />
        ))}
      </div>
    </section>
  );
}
