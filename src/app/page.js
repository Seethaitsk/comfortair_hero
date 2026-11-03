'use client';

import React from 'react';
// import Hero from '@/components/Hero';
import AcScrollVideo from '@/components/AcScrollVideo';
import ServicesSection from '@/components/ServicesSection';
import ProductsSection from '@/components/ProductsSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import OurBrands from '@/components/OurBrands';
import ServiceAreasSection from '@/components/ServiceAreasSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function HomePage() {
  return (
    <>
      <AcScrollVideo />
      <ServicesSection />
      <ProductsSection />
      <WhyChooseUs />

      <ServiceAreasSection />
      <OurBrands />
      <TestimonialsSection />
    </>
  );
}

