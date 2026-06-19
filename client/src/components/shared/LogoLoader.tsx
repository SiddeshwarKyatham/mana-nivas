import React from 'react';
import { motion } from 'framer-motion';
import logoUrl from '../../assets/logo.jpg';
import './LogoLoader.css';

interface LogoLoaderProps {
  message?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({ message = "Authenticating..." }) => {
  return (
    <div className="logo-loader-container">
      <div className="logo-loader-circle">
        <motion.div
          className="logo-loader-ring"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear",
          }}
        />
        <motion.div
          className="logo-loader-ring inner"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
        />
        <motion.img 
          src={logoUrl} 
          alt="Mana Nivas" 
          className="logo-loader-image"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        />
      </div>
      <motion.p 
        className="logo-loader-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LogoLoader;
