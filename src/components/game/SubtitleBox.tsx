
'use client';

import React from 'react';

interface SubtitleBoxProps {
  text: string | null;
}

export function SubtitleBox({ text }: SubtitleBoxProps) {
  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '700px',
        padding: '15px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        textAlign: 'center',
        fontFamily: "'Georgia', 'Times New Roman', Times, serif",
        fontSize: '1.1rem',
        lineHeight: '1.5',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        zIndex: 100, // Ensure subtitles are on top
      }}
    >
      {text}
    </div>
  );
}
