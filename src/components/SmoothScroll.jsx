'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useModal } from '@/context/ModalContext';

/**
 * SmoothScroll:
 * Site-wide Lenis smooth (inertia) scrolling for mouse wheel and trackpad.
 * - Touch devices keep native scrolling (Lenis default) for natural mobile feel.
 * - In-page anchor links (#services, /#areas) glide smoothly and respect the
 *   html scroll-padding-top, so targets land below the sticky navbar.
 * - Scrolling is paused while the appointment/spec modals are open, and wheel
 *   events inside a modal scroll the modal natively instead of the page.
 * - Users with prefers-reduced-motion get native scrolling (Lenis default).
 * Lenis drives real window scrolling, so the CSS scroll-driven section
 * animations and the sticky navbar keep working unchanged.
 */
export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const { appointmentState, specState } = useModal();
  const isModalOpen = appointmentState.isOpen || specState.isOpen;

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 1,
      anchors: true,
      stopInertiaOnNavigate: true,
      prevent: (node) =>
        Boolean(
          node?.classList?.contains('modal') ||
          node?.closest?.('.modal') ||
          node?.closest?.('.custom-select-dropdown') ||
          node?.closest?.('[data-lenis-prevent]')
        ),
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (isModalOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isModalOpen]);

  return null;
}
