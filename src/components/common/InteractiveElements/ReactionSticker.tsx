import React from 'react';
import { ReactionStickerData, StickerProps } from './types';

export const ReactionSticker: React.FC<StickerProps<ReactionStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const defaults = {
    emojis: ['😍', '👍'],
  };

  const emojis = Array.isArray(data.emojis) ? data.emojis : (Array.isArray(defaults.emojis) ? defaults.emojis : []);

  const handleReaction = (emoji: string) => {
    if (isEditing) return;
    onInteraction?.({
      type: 'reaction',
      reactionId: data.id,
      emoji: emoji,
      stickerId: data.id
    });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
  };

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    width: '64px',
    height: '64px',
    borderRadius: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    fontSize: '32px',
    cursor: isEditing ? 'default' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    border: 'none',
    outline: 'none',
    padding: 0,
    position: 'relative',
    zIndex: 1,
  };

  return (
    <div style={containerStyle}>
      {emojis.map((emoji, idx) => (
        <button
          key={idx}
          style={bubbleStyle}
          onClick={() => handleReaction(emoji)}
          onMouseOver={(e) => {
            if (!isEditing) e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)';
          }}
          onMouseOut={(e) => {
            if (!isEditing) e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
