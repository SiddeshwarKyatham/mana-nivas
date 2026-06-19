import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import hero1 from '../../assets/hero1.jpg';
import hero2 from '../../assets/hero2.jpg';
import hero3 from '../../assets/hero3.jpg';
import hero4 from '../../assets/hero4.jpg';
import hero5 from '../../assets/hero5.jpg';
import './HeroSlider.css';

const heroImages = [hero1, hero2, hero3, hero4, hero5];
const heroCaptions = [
  {
    headline: 'Find Your Peace by the Sea',
    subheadline: 'Unwind in luxury with stunning city views and premium amenities.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Timeless Heritage, Modern Comfort',
    subheadline: 'Experience the best of both worlds in our beautifully restored hotel.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Where Elegance Meets Comfort',
    subheadline: 'Experience ultimate relaxation and wellness treatments.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'Dine Above the Horizon',
    subheadline: 'Enjoy breathtaking sunsets and curated local cuisine',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
  {
    headline: 'A Spiritual Touch to Your Stay',
    subheadline: 'Reconnect with nature and heritage in every step.',
    cta: 'Book Now',
    ctaLink: '/rooms',
  },
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto slide
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Slower, more elegant transition (6s)
    return () => clearTimeout(timer);
  }, [current, autoPlay]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setAutoPlay(false);
  };
  
  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setAutoPlay(false);
  };
  
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroImages.length);
    setAutoPlay(false);
  };

  return (
    <section className="hero-section">
      <AnimatePresence initial={false}>
        <motion.img
          key={current}
          src={heroImages[current]}
          alt={`Hotel hero ${current + 1}`}
          className="hero-image"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <div className="hero-overlay" />
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="hero-headline">
              {heroCaptions[current].headline}
            </h1>
            <p className="hero-subheadline">
              {heroCaptions[current].subheadline}
            </p>
            <Link
              to={heroCaptions[current].ctaLink}
              className="hero-cta"
            >
              <span>{heroCaptions[current].cta}</span>
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <button
        onClick={prevSlide}
        className="hero-nav-button hero-nav-prev"
        aria-label="Previous Slide"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="hero-nav-button hero-nav-next"
        aria-label="Next Slide"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      
      <div className="hero-dots">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`hero-dot ${current === idx ? 'active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
