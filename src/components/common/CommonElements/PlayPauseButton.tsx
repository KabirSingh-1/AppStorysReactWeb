import React, { useState } from 'react';

interface PlayPauseButtonProps {
  isPaused: boolean;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  size?: number;
}

export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ 
  isPaused, 
  onPress, 
  style, 
  size = 36 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
        border: isHovered ? '1px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: 0,
        outline: 'none',
        ...style,
      }}
    >
      {isPaused ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M5 3.867v16.266c0 .54.58.88 1.05.61l14.133-8.133c.46-.27.46-.94 0-1.21L6.05 3.257C5.58 2.987 5 3.327 5 3.867z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      )}
    </button>
  );
};

export default PlayPauseButton;
