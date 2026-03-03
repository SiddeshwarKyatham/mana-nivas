import React from 'react';
import './about.css';
import aboutHero from '../assets/about-hero.jpg';
import aboutHistory from '../assets/about-history.jpg';
import aboutTeam from '../assets/about-team.jpg';
import aboutAmenities from '../assets/about-amenities.jpg';
import aboutAwards from '../assets/about-awards.jpg';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero" style={{ marginTop: '80px' }}>
        <div className="about-hero-image">
          <img src={aboutHero} alt="MANA NIVAS Hotel Exterior" />
        </div>
        <div className="about-hero-content">
          <h1 className="about-hero-headline">Our Story</h1>
          <p className="about-hero-subheadline">A legacy of luxury and hospitality since 1995</p>
        </div>
      </section>

      {/* History Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-image">
            <img src={aboutHistory} alt="MANA NIVAS History" />
          </div>
          <div className="about-text">
            <h2>Our History</h2>
            <p>Founded in 1995, MANA NIVAS has been a beacon of luxury and hospitality in the heart of the city. What started as a small family-run establishment has grown into one of the most prestigious hotels in the region.</p>
            <p>Our journey has been marked by continuous innovation while staying true to our core values of exceptional service and authentic experiences.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section alt-bg">
        <div className="about-content">
          <div className="about-text">
            <h2>Our Team</h2>
            <p>Our dedicated team of professionals brings together decades of experience in hospitality. From our skilled chefs to our attentive staff, every member is committed to creating memorable experiences for our guests.</p>
            <p>We believe in continuous training and development to maintain the highest standards of service excellence.</p>
          </div>
          <div className="about-image">
            <img src={aboutTeam} alt="MANA NIVAS Team" />
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-image">
            <img src={aboutAmenities} alt="MANA NIVAS Amenities" />
          </div>
          <div className="about-text">
            <h2>World-Class Amenities</h2>
            <p>MANA NIVAS offers an array of premium amenities designed to enhance your stay. From our state-of-the-art spa to our fine dining restaurants, every facility is crafted to provide the ultimate luxury experience.</p>
            <ul className="amenities-list">
              <li>Luxury Spa & Wellness Center</li>
              <li>Fine Dining Restaurants</li>
              <li>Swimming Pool</li>
              <li>Fitness Center</li>
              <li>Conference Facilities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="about-section alt-bg">
        <div className="about-content">
          <div className="about-text">
            <h2>Awards & Recognition</h2>
            <p>Our commitment to excellence has been recognized with numerous prestigious awards in the hospitality industry. These accolades reflect our dedication to providing exceptional service and memorable experiences.</p>
            <div className="awards-grid">
              <div className="award-item">
                <h3>Best Luxury Hotel 2023</h3>
                <p>Hospitality Excellence Awards</p>
              </div>
              <div className="award-item">
                <h3>5-Star Rating</h3>
                <p>International Hotel Association</p>
              </div>
              <div className="award-item">
                <h3>Excellence in Service</h3>
                <p>Tourism Board Recognition</p>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src={aboutAwards} alt="MANA NIVAS Awards" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 