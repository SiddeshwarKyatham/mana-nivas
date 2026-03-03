import React, { useState } from 'react';
import './faq.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What are your check-in and check-out times?',
      answer: 'Check-in time is 2:00 PM, and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability.'
    },
    {
      question: 'Do you offer airport transportation?',
      answer: 'Yes, we provide airport transportation services. Please contact our concierge to arrange pickup or drop-off at Mumbai International Airport.'
    },
    {
      question: 'What dining options are available?',
      answer: 'We offer multiple dining venues including our signature restaurant, poolside bar, and in-room dining service. Each venue provides unique culinary experiences.'
    },
    {
      question: 'Is parking available?',
      answer: 'Yes, we provide complimentary valet parking for all hotel guests. Self-parking is also available in our secure parking facility.'
    },
    {
      question: 'What spa services do you offer?',
      answer: 'Our spa offers a wide range of treatments including massages, facials, body treatments, and traditional wellness therapies. Advance booking is recommended.'
    },
    {
      question: 'Do you have a swimming pool?',
      answer: 'Yes, we have an outdoor swimming pool with a sundeck. The pool is open daily from 7:00 AM to 8:00 PM.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about your stay at MANA NIVAS</p>
        </div>
      </section>

      <section className="faq-content">
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FAQ; 