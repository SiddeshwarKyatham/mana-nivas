import React from 'react';
import './legal.css';

const Terms = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using MANA NIVAS's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </div>

        <div className="legal-section">
          <h2>2. Use of Services</h2>
          <p>Our services are intended for personal, non-commercial use. You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
          <ul>
            <li>You must be at least 18 years old to make reservations</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You agree to provide accurate and complete information</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Reservations and Cancellations</h2>
          <p>Our reservation and cancellation policies are as follows:</p>
          <ul>
            <li>Reservations require a valid credit card</li>
            <li>Cancellations must be made 48 hours before check-in</li>
            <li>No-shows will be charged for one night's stay</li>
            <li>Special rates may have different cancellation policies</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Property Rules</h2>
          <p>To ensure a pleasant stay for all guests, we ask that you follow these rules:</p>
          <ul>
            <li>No smoking in rooms or public areas</li>
            <li>Quiet hours from 10 PM to 7 AM</li>
            <li>No pets allowed (except service animals)</li>
            <li>Maximum occupancy limits must be respected</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Liability</h2>
          <p>MANA NIVAS is not liable for:</p>
          <ul>
            <li>Loss or damage to personal belongings</li>
            <li>Injuries sustained on the property</li>
            <li>Service interruptions or technical issues</li>
            <li>Acts of nature or force majeure</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Terms; 