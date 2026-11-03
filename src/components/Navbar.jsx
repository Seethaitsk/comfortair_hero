'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { INITIAL_CONTACT } from '@/data/mockData';
import { getContact } from '@/services/api';

export default function Navbar() {
  const pathname = usePathname();
  const { openAppointment } = useModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phoneInfo, setPhoneInfo] = useState({
    phone: INITIAL_CONTACT.phone,
    phoneHref: INITIAL_CONTACT.phoneHref,
  });

  useEffect(() => {
    let isMounted = true;
    getContact()
      .then((res) => {
        if (!isMounted || !res?.data?.phone) return;
        setPhoneInfo({
          phone: res.data.phone,
          phoneHref: `tel:${res.data.phone.replace(/[^0-9+]/g, '')}`,
        });
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const navRef = React.useRef(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (navRef.current) {
        const h = Math.round(navRef.current.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--header-h', `${h}px`);
      }
    };

    updateHeaderHeight();

    let ro;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      ro = new ResizeObserver(() => updateHeaderHeight());
      ro.observe(navRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact Us', href: '/contact-us' },
  ];

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-xl navbar-hvac sticky-top ${
        isScrolled ? 'scrolled' : ''
      }`}
      id="mainNav"
    >
      <div className="container-xxl">
        <Link
          className="navbar-brand d-flex align-items-center me-0 me-xl-4 py-0"
          href="/"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src="/images/logo1.png"
            alt="Comfort Aircon - Authorized Carrier, Toshiba & Midea Dealer"
            className="navbar-logo-img"
          />
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none p-2"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="hvacNavbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <i className="fa-solid fa-bars-staggered fs-3 text-dark-navy"></i>
        </button>

        <div
          className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
          id="hvacNavbarNav"
        >
          <ul className="navbar-nav mx-auto mb-2 mb-xl-0 align-items-xl-center gap-xl-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <li className="nav-item" key={link.href}>
                  <Link
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center gap-2 pt-3 pt-xl-0">
            <a
              href={phoneInfo.phoneHref}
              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-bold d-none d-lg-inline-flex align-items-center gap-1"
              title={`Call Comfort Aircon (${phoneInfo.phone})`}
            >
              <i className="fa-solid fa-phone fs-6"></i> Call Us
            </a>

            <button
              type="button"
              className="btn btn-custom-primary shadow-sm"
              onClick={() => {
                setIsMenuOpen(false);
                openAppointment();
              }}
            >
              <i className="fa-solid fa-clipboard-check me-1"></i> Enquire Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
