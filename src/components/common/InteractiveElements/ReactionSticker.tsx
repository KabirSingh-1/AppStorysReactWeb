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

  const emojis = data.emojis || defaults.emojis;

  const handleReaction = (emoji: string) => {
    if (isEditing) return;
    onInteraction?.({ type: 'reaction_click', reactionId: data.id, emoji: emoji });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '8px',
  };

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    border: '1px solid #F0F0F0',
    fontSize: '22px',
    cursor: isEditing ? 'default' : 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    background: 'white',
    borderWidth: 0,
    outline: 'none',
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
