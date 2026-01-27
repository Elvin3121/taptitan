"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Hand } from 'lucide-react';

interface DraggableTargetProps {
  coords: { x: number; y: number };
  setCoords: (coords: { x: number; y: number }) => void;
  isRunning: boolean;
}

const DraggableTarget: React.FC<DraggableTargetProps> = ({ coords, setCoords, isRunning }) => {
  const [isDragging, setIsDragging] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isRunning || !targetRef.current) return;
    
    const rect = targetRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
    
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  }, [isRunning]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      setCoords({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      });
    });
  }, [isDragging, setCoords]);

  const handleDragEnd = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, []);

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };
  
  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div
      ref={targetRef}
      className={cn(
        "fixed z-50 flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 border-2 border-dashed border-primary",
        !isDragging && "transition-all duration-150",
        {
          "cursor-grab": !isRunning && !isDragging,
          "cursor-grabbing": isDragging,
          "cursor-not-allowed": isRunning,
          "scale-125 bg-primary/50": isDragging,
        }
      )}
      style={{
        left: `0px`,
        top: `0px`,
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0) translate(-50%, -50%)`,
        touchAction: 'none'
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <Hand className={cn("w-6 h-6 text-primary-foreground transition-opacity pointer-events-none", isRunning ? "opacity-50" : "opacity-100")} />
    </div>
  );
};

export default DraggableTarget;
