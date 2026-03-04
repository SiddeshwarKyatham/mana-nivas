import React from 'react';
import './spa.css';
import spaHero from '../assets/spa-hero.jpg';
import treatmentAyurvedaMassage from '../assets/treatment-ayurveda-massage.jpg';
import treatmentAromaTherapy from '../assets/treatment-aroma-therapy.jpg';
import treatmentReflexology from '../assets/treatment-reflexology.jpg';
import spaRoom from '../assets/spa-room.jpg';
import candlelitSpa from '../assets/candlelit-spa.jpg';
import oilTherapy from '../assets/oil-therapy.jpg';
import spaLounge from '../assets/spa-lounge.jpg';
import steamRoom from '../assets/steam-room.jpg';

const Spa = () => {
  return (
    <div className="spa-page">
      {/* Hero Banner */}
      <section className="spa-hero" >
        <div className="spa-hero-image">
          <img src={spaHero} alt="Luxury Spa Experience" loading="eager" fetchPriority="high" decoding="async" />
        </div>
        <div className="spa-hero-content">
          <h1 className="spa-hero-headline">Rejuvenate Your Senses</h1>
          <p className="spa-hero-subheadline">Experience tranquility and wellness at our luxury spa.</p>
        </div>
      </section>

      {/* Treatments Grid */}
      <section className="spa-treatments-section">
        <h2 className="spa-section-title">Our Treatments</h2>
        <div className="spa-treatments-grid">
          <div className="treatment-card">
            <div className="treatment-image">
              <img src={treatmentAyurvedaMassage} alt="Ayurveda Massage" loading="lazy" decoding="async" />
            </div>
            <div className="treatment-info">
              <h3>Ayurveda Massage</h3>
              <p>Traditional oil massage for deep relaxation.</p>
              <span>60 min - INR 2500</span>
            </div>
          </div>
          <div className="treatment-card">
            <div className="treatment-image">
              <img src={treatmentAromaTherapy} alt="Aroma Therapy" loading="lazy" decoding="async" />
            </div>
            <div className="treatment-info">
              <h3>Aroma Therapy</h3>
              <p>Essential oils to soothe mind and body.</p>
              <span>45 min - INR 1800</span>
            </div>
          </div>
          <div className="treatment-card">
            <div className="treatment-image">
              <img src={treatmentReflexology} alt="Reflexology" loading="lazy" decoding="async" />
            </div>
            <div className="treatment-info">
              <h3>Reflexology</h3>
              <p>Foot therapy to restore balance and energy.</p>
              <span>30 min - INR 1200</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ambiance Gallery */}
      <section className="spa-ambiance-section">
        <h2 className="spa-section-title">Ambiance Gallery</h2>
        <div className="spa-ambiance-gallery">
          <div className="ambiance-card">
            <div className="ambiance-image">
              <img src={spaRoom} alt="Traditional South Indian Spa Room" loading="lazy" decoding="async" />
            </div>
            <div className="ambiance-info">
              <h3>Traditional South Indian Spa Room</h3>
              <p>Luxurious spa room with teak wood accents, soft ivory curtains, warm golden lighting, floating flower bowls, and sandalwood incense. Glass wall panels with tropical plants outside, plush massage table with gold and plum towels, serene atmosphere.</p>
            </div>
          </div>
          <div className="ambiance-card">
            <div className="ambiance-image">
              <img src={candlelitSpa} alt="Candlelit Spa Ambience" loading="lazy" decoding="async" />
            </div>
            <div className="ambiance-info">
              <h3>Candlelit Spa Ambience</h3>
              <p>A spa room lit by dozens of flickering candles, scattered marigold petals, antique brass decor, and soft mist in the air. Glass shelves with essential oils, minimalist glassmorphic background, relaxing and ethereal vibe.</p>
            </div>
          </div>
          <div className="ambiance-card">
            <div className="ambiance-image">
              <img src={oilTherapy} alt="Ayurvedic Oil Therapy Setup" loading="lazy" decoding="async" />
            </div>
            <div className="ambiance-info">
              <h3>Ayurvedic Oil Therapy Setup</h3>
              <p>Top-down view of a spa setup with herbal oils in bronze containers, rolled towels, banana leaves, dried herbs, and stone textures. Delicate flower petals sprinkled around, warm neutral tones, luxury natural wellness style.</p>
            </div>
          </div>
          <div className="ambiance-card">
            <div className="ambiance-image">
              <img src={spaLounge} alt="Spa Lounge Waiting Area" loading="lazy" decoding="async" />
            </div>
            <div className="ambiance-info">
              <h3>Spa Lounge Waiting Area</h3>
              <p>Elegant spa lounge with cushioned rattan chairs, gold and plum throw pillows, soft instrumental music, incense in the background. Subtle glass dividers, hanging indoor plants, and a fruit-infused water station. Light bokeh effect.</p>
            </div>
          </div>
          <div className="ambiance-card">
            <div className="ambiance-image">
              <img src={steamRoom} alt="Steam Room / Herbal Bath Scene" loading="lazy" decoding="async" />
            </div>
            <div className="ambiance-info">
              <h3>Steam Room / Herbal Bath Scene</h3>
              <p>A steamy luxury herbal bath with rose petals floating on water, wooden walls, brass fixtures, aromatic herbs on the side, and subtle glass textures in the steam. Calming South Indian architecture with soft shadows.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Spa; 
