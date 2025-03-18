import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg"
    >
      <p>{message}</p>
    </motion.div>
  );
};

export default ErrorMessage; 