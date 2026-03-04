import React from 'react';
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import './contact.css';
import contactHero from '../assets/contact-hero.jpg';

const Contact = () => {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-image">
          <img src={contactHero} alt="Contact MANA NIVAS" />
        </div>
        <div className="contact-hero-content">
          <h1 className="contact-hero-headline">Contact Us</h1>
          <p className="contact-hero-subheadline">We're here to help and answer any questions you might have</p>
        </div>
      </section>

      <div className="contact-info-map-container">
        <div className="contact-info-wrapper">
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <div className="contact-info-icon" aria-hidden="true">
                <FaMapMarkerAlt />
              </div>
              <h3>Location</h3>
              <p>123 Luxury Avenue</p>
              <p>Mumbai, Maharashtra 400001</p>
              <p>India</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon" aria-hidden="true">
                <FaPhoneAlt />
              </div>
              <h3>Phone</h3>
              <p>+91 22 1234 5678</p>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon" aria-hidden="true">
                <FaEnvelope />
              </div>
              <h3>Email</h3>
              <p>info@mananivas.com</p>
              <p>reservations@mananivas.com</p>
            </div>
            <div className="contact-info-card">
              <div className="contact-info-icon" aria-hidden="true">
                <FaClock />
              </div>
              <h3>Hours</h3>
              <p>24/7 Front Desk</p>
              <p>Check-in: 2 PM</p>
              <p>Check-out: 12 PM</p>
            </div>
          </div>
        </div>

        <div className="map-wrapper">
          <h2>Find Us</h2>
          <div className="google-map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30442.972003555005!2d78.36153445395752!3d17.489770738532588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9364cc669965%3A0xc11f678425cfe7f5!2sMona%20Nivas!5e0!3m2!1sen!2sin!4v1748132970625!5m2!1sen!2sin"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MANA NIVAS Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
