'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';
import { INITIAL_CONTACT } from '@/data/mockData';
import { getContact, submitEnquiry } from '@/services/api';
import CustomSelect from '@/components/CustomSelect';

export default function ContactPage() {
  const { showToast } = useModal();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [contactDetails, setContactDetails] = useState(INITIAL_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch company contact details with fallback to INITIAL_CONTACT
  useEffect(() => {
    let isMounted = true;
    async function fetchContact() {
      try {
        const res = await getContact();
        if (isMounted && res?.data) {
          setContactDetails((prev) => ({
            ...prev,
            phone: res.data.phone || prev.phone,
            phoneHref: res.data.phone
              ? `tel:${res.data.phone.replace(/[^0-9+]/g, '')}`
              : prev.phoneHref,
            whatsapp: res.data.whatsapp || prev.whatsapp,
            whatsappHref: res.data.whatsapp
              ? `https://wa.me/${res.data.whatsapp.replace(/\D/g, '')}`
              : prev.whatsappHref,
            email: res.data.email || prev.email,
            address: res.data.address || prev.address,
            workingHours: res.data.working_hours || prev.workingHours,
            facebookUrl: res.data.facebook_url || prev.facebookUrl,
            instagramUrl: res.data.instagram_url || prev.instagramUrl,
            twitterUrl: res.data.twitter_url || prev.twitterUrl,
            youtubeUrl: res.data.youtube_url || prev.youtubeUrl,
          }));
        }
      } catch (err) {
        console.warn('Backend contact API unavailable, using static fallback:', err);
      }
    }
    fetchContact();
    return () => {
      isMounted = false;
    };
  }, []);

  const offsetX = isMobile ? 40 : 80;

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: shouldReduceMotion ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: shouldReduceMotion ? 0 : 0.15,
          staggerChildren: shouldReduceMotion ? 0 : 0.2,
        },
      },
    }),
    [shouldReduceMotion]
  );

  const cardVariants = useMemo(
    () => ({
      hidden: {
        opacity: shouldReduceMotion ? 1 : 0,
        x: shouldReduceMotion ? 0 : offsetX,
      },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.7,
          ease: 'easeOut',
        },
      },
    }),
    [shouldReduceMotion, offsetX]
  );

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    productInterested: '',
    location: '',
    otherLocation: '',
    message: '',
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const publishedProducts = [
    'Carrier Ester Neo 5-Star Inverter Split AC',
    'Carrier Superia 4-Way Inverter Cassette AC',
    'Carrier Concealed High-Static Ductable AC',
    'Carrier X-Power Commercial VRF System',
    'Carrier Durafresh 3-Star Inverter Split AC',
    'Toshiba Daiseikai 5-Star Japanese Inverter Split AC',
    'Toshiba SMMS-u Next-Gen Japanese VRF System',
    'Toshiba 4-Way Smart Inverter Cassette AC',
    'Toshiba Concealed Slim Inverter Ductable AC',
    'Toshiba Shorai Edge High-Efficiency Split AC',
  ];

  const serviceOptions = [
    'AC Installation',
    'Repair',
    'Service & Maintenance',
    'Gas Filling',
    'Cleaning & Troubleshooting',
    'Replacement',
    'Annual Maintenance',
    'Commercial AC Services',
    'Other',
  ];

  const locationOptions = ['Pondicherry', 'Villupuram', 'Cuddalore', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation matching FSD Section 6
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.service) {
      setErrorMessage('Please select a required service.');
      return;
    }

    if (!formData.location) {
      setErrorMessage('Please select your location.');
      return;
    }

    if (formData.location === 'Other' && !formData.otherLocation.trim()) {
      setErrorMessage('Please specify your other location name.');
      return;
    }

    const resolvedLocation =
      formData.location === 'Other'
        ? `Other (${formData.otherLocation.trim()})`
        : formData.location;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      mobile_number: cleanPhone,
      email: formData.email.trim() || undefined,
      service_required: formData.service,
      product_interested_in: formData.productInterested.trim() || undefined,
      location: resolvedLocation,
      message: formData.message.trim() || undefined,
    };

    try {
      const response = await submitEnquiry(payload);

      // Save lead to localStorage for Admin Enquiry Management fallback
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('comfort_aircon_enquiries');
          const list = stored ? JSON.parse(stored) : [];
          const newEnquiry = {
            id: `ENQ-${Date.now().toString().slice(-4)}`,
            name: formData.name.trim(),
            mobile: cleanPhone,
            email: formData.email.trim() || 'N/A',
            service: formData.service,
            productInterested: formData.productInterested || 'N/A',
            location: resolvedLocation,
            message: formData.message.trim() || 'No additional message provided.',
            status: 'New',
            createdAt: new Date().toISOString(),
          };
          list.unshift(newEnquiry);
          localStorage.setItem('comfort_aircon_enquiries', JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        } catch {
          // Ignore localStorage errors
        }
      }

      setSubmittedSuccess(true);
      showToast(
        response?.message ||
          `Enquiry submitted successfully! Our team will call you on ${cleanPhone} shortly.`
      );

      // Reset Form
      setFormData({
        name: '',
        phone: '',
        email: '',
        service: '',
        productInterested: '',
        location: '',
        otherLocation: '',
        message: '',
      });
    } catch (err) {
      if (err?.errors && typeof err.errors === 'object') {
        const errorList = Object.values(err.errors).flat();
        setErrorMessage(errorList.join(' ') || err.message);
      } else {
        setErrorMessage(err?.message || 'Failed to submit enquiry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. SUBPAGE HERO / BANNER */}
      <section className="subpage-hero">
        <div className="container-xxl">
          <ul className="subpage-breadcrumbs mb-3">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <i className="fa-solid fa-chevron-right fs-xs"></i>
            </li>
            <li className="active">Contact Us</li>
          </ul>

          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="subpage-title">
                We're Here to <span className="text-primary-blue">Help</span>
              </h1>
              <p className="subpage-lead">
                AC sales, installation, repair, and maintenance. Our experienced team is ready to help you choose the right air conditioning solution, request a quotation or schedule a service appointment for your home or business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 1: REQUEST HVAC SERVICE OR ASK A QUESTION (1ST REF IMAGE) */}
      <section className="contact-ref-section" id="enquiry-form">
        <div className="container-xxl">
          <div className="row g-4 align-items-start">
            {/* Left Column: Form Card (~60%) */}
            <div className="col-lg-7">
              <motion.div
                initial={shouldReduceMotion || isMobile ? false : { opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transitionEnd: {
                    transform: 'none',
                  },
                }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
                className="ref-form-motion-wrap"
              >
                <div className="ref-form-card">
                <div className="ref-eyebrow-tag">
                  <span className="ref-tag-dot"></span>
                  <span>Send a Message</span>
                </div>
                <h2 className="ref-card-title">
                  Request AC Service
                </h2>
                <p className="ref-card-lead">
                  Fill out the enquiry form below, and our team will contact you to assist with AC sales, installation, repair, servicing, or maintenance.
                </p>

                {submittedSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-3 p-3 rounded-3 mb-4" role="alert">
                    <i className="fa-solid fa-circle-check fs-3 text-success"></i>
                    <div>
                      <h6 className="alert-heading fw-bold mb-1">Thank you for reaching out!</h6>
                      <p className="mb-0 small">
                        Your request has been logged successfully. Our Carrier, Toshiba &amp; Midea technical support desk will call your mobile number shortly.
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 p-3 rounded-3 mb-4" role="alert">
                    <i className="fa-solid fa-triangle-exclamation text-danger"></i>
                    <span className="small fw-semibold">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Row 1: Full Name | Phone Number */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refFullName">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="refFullName"
                        className="form-control"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refPhone">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">+91</span>
                        <input
                          type="tel"
                          id="refPhone"
                          className="form-control"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email Address | Service Needed */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refEmail">
                        Email Address <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        id="refEmail"
                        className="form-control"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refService">
                        Service Needed <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        id="refService"
                        value={formData.service}
                        onChange={(val) => setFormData({ ...formData, service: val })}
                        options={serviceOptions}
                        placeholder="Select a service"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Service Location | Product Interested In */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refLocation">
                        Service Location <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        id="refLocation"
                        value={formData.location}
                        onChange={(val) => setFormData({ ...formData, location: val })}
                        options={locationOptions}
                        placeholder="Select location"
                        required
                      />
                      {formData.location === "Other" && (
                        <input
                          type="text"
                          className="form-control mt-2"
                          placeholder="Specify town (e.g., Tindivanam, Auroville)"
                          value={formData.otherLocation}
                          onChange={(e) =>
                            setFormData({ ...formData, otherLocation: e.target.value })
                          }
                          required
                        />
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="refProduct">
                        Product Interested In <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <CustomSelect
                        id="refProduct"
                        value={formData.productInterested}
                        onChange={(val) =>
                          setFormData({ ...formData, productInterested: val })
                        }
                        options={publishedProducts}
                        placeholder="Select product (Carrier / Toshiba / Midea)..."
                      />
                    </div>
                  </div>

                  {/* Row 4: Service Details (Textarea) */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label mb-0" htmlFor="refMessage">
                        Service Details <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <small className="text-muted">{formData.message.length}/500</small>
                    </div>
                    <textarea
                      id="refMessage"
                      className="form-control"
                      rows={4}
                      maxLength={500}
                      placeholder="Tell us what is happening with your heating, cooling, or airflow system..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button type="submit" className="ref-btn-submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Request</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              </motion.div>
            </div>

            {/* Right Column: Contact Cards (~40%) */}
            <div className="col-lg-5">
              <motion.div
                variants={containerVariants}
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                {/* Card 1: Visit Our Location */}
                <motion.div variants={cardVariants}>
                  <div className="ref-contact-card">
                    <div className="ref-contact-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="ref-contact-title">Visit Our Location</div>
                    <div className="ref-contact-highlight">Pudupalaiyam, Puducherry</div>
                    <p className="ref-contact-desc">
                      {contactDetails.address || 'No: 295, Thiruvalluvar Salai, Raja Nagar, Pudupalaiyam, Puducherry – 605013.'}
                    </p>
                  </div>
                </motion.div>

                {/* Card 2: Call Us */}
                <motion.div variants={cardVariants}>
                  <div className="ref-contact-card">
                    <div className="ref-contact-icon">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="ref-contact-title">Call Us</div>
                    <a href={contactDetails.phoneHref || INITIAL_CONTACT.phoneHref} className="ref-contact-highlight">
                      {contactDetails.phone || INITIAL_CONTACT.phone}
                    </a>
                    <p className="ref-contact-desc mt-1">
                      Talk with our team about scheduling repair, maintenance, or air conditioning service questions.
                    </p>
                  </div>
                </motion.div>

                {/* Card 3: Email Us */}
                <motion.div variants={cardVariants}>
                  <div className="ref-contact-card">
                    <div className="ref-contact-icon">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="ref-contact-title">Email Us</div>
                    <a href={`mailto:${contactDetails.email || INITIAL_CONTACT.email}`} className="ref-contact-highlight">
                      {contactDetails.email || INITIAL_CONTACT.email}
                    </a>
                    {contactDetails.secondaryEmail && (
                      <a href={`mailto:${contactDetails.secondaryEmail}`} className="ref-contact-highlight">
                        {contactDetails.secondaryEmail}
                      </a>
                    )}
                    <p className="ref-contact-desc mt-1">
                      Send your service request, project details, or general questions anytime.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: INTERACTIVE GOOGLE MAP LOCATION */}
      <section className="contact-hours-section overflow-hidden" id="location-hours" style={{ overflowX: 'hidden' }}>
        <div className="container-xxl">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: 'easeOut' }}
          >
            <div className="ref-map-card" style={{ minHeight: '460px', height: '460px' }}>
              {/* Floating Location Overlay Badge */}
              <motion.div
                className="ref-map-floating-box"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -offsetX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: 'easeOut', delay: shouldReduceMotion ? 0 : 0.3 }}
              >
                <div className="ref-map-title">Comfort Aircon Showroom</div>
                <div className="ref-map-address">
                  No: 295, Thiruvalluvar Salai, Raja Nagar, Pudupalaiyam, Puducherry – 605013
                </div>
                <a
                  href="https://www.google.com/maps/place/COMFORT+AIRCON+%7C+Hvac+Solutions+Provider+%7C+MEP+consultant/@11.9349443,79.8103655,19z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-map-btn"
                >
                  <i className="fa-solid fa-map-location-dot"></i>
                  <span>Open in Maps</span>
                  <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '0.72rem' }}></i>
                </a>
              </motion.div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.587548858422!2d79.8106980735886!3d11.933765888294278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1106ae5f7185dcdb%3A0x8b19cc10065d019e!2sCOMFORT%20AIRCON%20%7C%20Hvac%20Solutions%20Provider%20%7C%20MEP%20consultant!5e0!3m2!1sen!2sin!4v1793258188167!5m2!1sen!2sin"
                className="ref-map-iframe"
                style={{ minHeight: '460px', height: '100%', width: '100%', border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Comfort Aircon Puducherry Google Map Location"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
