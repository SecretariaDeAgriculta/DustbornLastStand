
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  size?: number; // Diameter of the base
  knobSize?: number; // Diameter of the knob
  maxDistance?: number; // How far the knob can move from center (radius)
  fixedPosition?: { bottom: string; left: string } | { bottom: string; right: string } | { top: string; left: string } | { top: string; right: string };
  baseColor?: string;
  knobColor?: string;
  baseStyle?: React.CSSProperties;
  knobStyle?: React.CSSProperties;
}

export function VirtualJoystick({
  onMove,
  size = 120,
  knobSize = 50,
  maxDistance: customMaxDistance,
  fixedPosition = { bottom: '50px', left: '50px' },
  baseColor = 'rgba(128, 128, 128, 0.4)', // More transparent grey
  knobColor = 'rgba(160, 160, 160, 0.7)', // Slightly more opaque grey
  baseStyle: customBaseStyle,
  knobStyle: customKnobStyle,
}: VirtualJoystickProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 }); // Relative to center of base
  const baseRef = useRef<HTMLDivElement>(null);
  const [joystickCenter, setJoystickCenter] = useState<{ x: number, y: number } | null>(null);

  const maxDistance = customMaxDistance !== undefined ? customMaxDistance : (size - knobSize) / 2;


  useEffect(() => {
    const updateCenter = () => {
      if (baseRef.current) {
        const rect = baseRef.current.getBoundingClientRect();
        setJoystickCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    // Also call on orientation change for mobile
    window.addEventListener('orientationchange', updateCenter);
    return () => {
        window.removeEventListener('resize', updateCenter);
        window.removeEventListener('orientationchange', updateCenter);
    }
  }, []);

  const updateKnobAndDispatch = useCallback((touchX: number, touchY: number) => {
    if(!joystickCenter) return;
    let deltaX = touchX - joystickCenter.x;
    let deltaY = touchY - joystickCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let currentKnobX = deltaX;
    let currentKnobY = deltaY;

    if (distance > maxDistance) {
      currentKnobX = (deltaX / distance) * maxDistance;
      currentKnobY = (deltaY / distance) * maxDistance;
    }
    setKnobPosition({ x: currentKnobX, y: currentKnobY });
    
    const normalizedDx = maxDistance > 0 ? currentKnobX / maxDistance : 0;
    const normalizedDy = maxDistance > 0 ? currentKnobY / maxDistance : 0;
    onMove(normalizedDx, normalizedDy);
  }, [joystickCenter, maxDistance, onMove, setKnobPosition]);


  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent page scroll/zoom
    if (!joystickCenter) return;
    setIsDragging(true);
    const touch = event.touches[0];
    updateKnobAndDispatch(touch.clientX, touch.clientY);
  }, [joystickCenter, updateKnobAndDispatch, setIsDragging]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent page scroll/zoom
    if (!isDragging || !joystickCenter) return;
    const touch = event.touches[0];
    updateKnobAndDispatch(touch.clientX, touch.clientY);
  }, [isDragging, joystickCenter, updateKnobAndDispatch]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove, setIsDragging, setKnobPosition]);

  const baseStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: baseColor,
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none', 
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent', // Remove tap highlight on iOS
    zIndex: 1000, // Ensure it's above game elements but potentially below modals
    ...fixedPosition,
    ...customBaseStyle,
  };

  const knobStyles: React.CSSProperties = {
    width: `${knobSize}px`,
    height: `${knobSize}px`,
    borderRadius: '50%',
    backgroundColor: knobColor,
    position: 'absolute', // Relative to base
    transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
    boxShadow: '0 0 8px rgba(0,0,0,0.4)',
    pointerEvents: 'none', // Knob itself should not intercept touch events meant for the base
    ...customKnobStyle,
  };

  return (
    <div
      ref={baseRef}
      style={baseStyles}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd} // Handle interruption like call or system UI
    >
      <div style={knobStyles} />
    </div>
  );
}
