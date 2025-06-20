
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CutsceneSlide } from '@/data/openingCutscene';
import './CutscenePlayer.css'; // Import the CSS file

interface CutscenePlayerProps {
  slides: CutsceneSlide[];
  onComplete: () => void;
}

export function CutscenePlayer({ slides, onComplete }: CutscenePlayerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const handleNextSlide = useCallback(() => {
    if (fadeOut) return; // Prevent advancing if already fading out

    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prevIndex => prevIndex + 1);
    } else {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500); // Match fade-out duration, ensures fade completes before callback
    }
  }, [currentSlideIndex, slides.length, onComplete, fadeOut]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Prevent space from scrolling page
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleNextSlide]);

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    return null; 
  }

  return (
    <div
      className={`cutscene-player ${fadeOut ? 'opacity-0 transition-opacity duration-500' : 'opacity-100'}`}
      onClick={handleNextSlide}
      role="button"
      tabIndex={0}
      aria-label="Avançar cutscene"
    >
      {currentSlide.image && (
        <div className="cutscene-image-wrapper">
          <Image
            key={currentSlideIndex} 
            src={currentSlide.image}
            alt={`Cutscene image ${currentSlideIndex + 1}`}
            layout="fill"
            objectFit="cover"
            className="cutscene-image"
            priority={currentSlideIndex === 0} 
            data-ai-hint="western landscape story"
          />
        </div>
      )}
      <div className="narrator-box">
        <p>{currentSlide.text}</p>
      </div>
    </div>
  );
}
