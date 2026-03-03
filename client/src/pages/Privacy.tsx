import React from 'react';
import './legal.css';

const Privacy = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Payment and billing information</li>
            <li>Reservation and stay preferences</li>
            <li>Communication preferences</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your reservations and payments</li>
            <li>Provide personalized services and experiences</li>
            <li>Communicate with you about your stay</li>
            <li>Send you marketing communications (with your consent)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Payment processors for secure transactions</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Privacy; 