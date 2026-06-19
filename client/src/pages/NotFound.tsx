import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => (
  <div style={{
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-primary)',
  }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(6rem, 15vw, 10rem)',
        fontWeight: 700,
        color: 'var(--gold)',
        lineHeight: 1,
        opacity: 0.3,
        marginBottom: '1rem',
      }}>404</div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        color: 'var(--charcoal)',
        marginBottom: '0.75rem',
      }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
          color: '#fff',
          padding: '0.8rem 2rem',
          borderRadius: '999px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
