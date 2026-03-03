import React from 'react';
import './legal.css';

const Cookies = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-content">
          <h1>Cookie Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-section">
          <h2>1. What Are Cookies</h2>
          <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:</p>
          <ul>
            <li>Remembering your preferences</li>
            <li>Understanding how you use our website</li>
            <li>Improving our services</li>
            <li>Providing personalized content</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. Types of Cookies We Use</h2>
          <p>We use the following types of cookies:</p>
          <ul>
            <li>Essential cookies for website functionality</li>
            <li>Analytics cookies to understand user behavior</li>
            <li>Preference cookies to remember your settings</li>
            <li>Marketing cookies for personalized content</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Managing Cookies</h2>
          <p>You can control and manage cookies in various ways:</p>
          <ul>
            <li>Browser settings to block or delete cookies</li>
            <li>Cookie consent banner on our website</li>
            <li>Third-party opt-out tools</li>
            <li>Private browsing mode</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Cookie Duration</h2>
          <p>Our cookies are stored for different periods:</p>
          <ul>
            <li>Session cookies (deleted when you close your browser)</li>
            <li>Persistent cookies (remain until they expire)</li>
            <li>First-party cookies (set by our website)</li>
            <li>Third-party cookies (set by our partners)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Cookies; 