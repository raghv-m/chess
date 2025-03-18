import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-16 h-16 border-4 border-gray-300 rounded-full"
        style={{
          borderTopColor: '#6366f1',
          borderRightColor: '#6366f1'
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <p className="text-white text-lg">Loading game...</p>
    </div>
  );
};

export default LoadingSpinner; 