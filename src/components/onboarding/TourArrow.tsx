import React from 'react'
import { motion } from 'framer-motion'

export const TourArrow = ({ direction }: { direction: 'up' | 'down' | 'left' | 'right' }) => {
  const paths = {
    down: "M12 2 L12 18 M6 12 L12 18 L18 12", // pointing down
    up: "M12 18 L12 2 M6 8 L12 2 L18 8",       // pointing up
    left: "M18 12 L2 12 M8 6 L2 12 L8 18",     // pointing left
    right: "M2 12 L18 12 M12 6 L18 12 L12 18", // pointing right
  }

  return (
    <motion.svg
      width="48" height="48" viewBox="0 0 24 24"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        // Bounce animation on the arrow
        y: direction === 'down' ? [0, 6, 0] : 
           direction === 'up' ? [0, -6, 0] : 0,
        x: direction === 'right' ? [0, 6, 0] :
           direction === 'left' ? [0, -6, 0] : 0,
      }}
      transition={{ 
        y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
        x: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
      }}
    >
      <motion.path
        d={paths[direction]}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  )
}
