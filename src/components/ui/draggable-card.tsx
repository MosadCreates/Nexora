'use client'
import React, { useRef, useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DraggableCardContainerProps {
  className?: string
  children: React.ReactNode
}

export const DraggableCardContainer = ({
  className,
  children
}: DraggableCardContainerProps) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>{children}</div>
  )
}

interface DraggableCardBodyProps {
  className?: string
  children: React.ReactNode
  onDoubleClick?: () => void
  dragMode?: 'stack' | 'timeline'
  initialPosition?: { x: number; y: number }
}

export const DraggableCardBody = ({
  className,
  children,
  onDoubleClick,
  dragMode = 'stack',
  initialPosition = { x: 0, y: 0 }
}: DraggableCardBodyProps) => {
  const controls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)

  const handleDoubleClick = () => {
    if (!isDragging && onDoubleClick) {
      onDoubleClick()
    }
  }

  return (
    <motion.div
      drag={dragMode === 'timeline' ? 'x' : true}
      dragControls={controls}
      dragListener={true}
      dragMomentum={dragMode === 'timeline'}
      dragElastic={dragMode === 'stack' ? 0.2 : 0.1}
      dragConstraints={dragMode === 'stack' ? false : { top: 0, bottom: 0 }}
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      initial={initialPosition}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 100)
      }}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'cursor-grab active:cursor-grabbing bg-white/5 dark:bg-[#111111]/80 backdrop-blur-xl p-0 rounded-2xl shadow-2xl border border-white/10 overflow-hidden',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        touchAction: dragMode === 'timeline' ? 'pan-y' : 'none'
      }}
    >
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-20" />
      {children}
    </motion.div>
  )
}
