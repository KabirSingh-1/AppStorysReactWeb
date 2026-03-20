import React from 'react';
import { PipButtonConfig } from '../../Pip/types';

interface SoundButtonProps {
  config: PipButtonConfig | null;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ignoreSizeAndMargin?: boolean;
  enabled?: boolean;
  type: 'mute' | 'unmute';
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  config,
  onPress,
  ignoreSizeAndMargin = false,
  enabled,
  style,
  type,
}) => {
  if (!config || !enabled) {
    return null;
  }

  const {
    size: backendSize = 18,
    margin,
    color,
    image,
    selectedStyle,
  } = config;

  const size = ignoreSizeAndMargin ? 40 : backendSize;

  // Safe margin access with correct defaults
  const marginTop = ignoreSizeAndMargin ? 0 : (margin?.top ?? 0);
  const marginBottom = ignoreSizeAndMargin ? 0 : (margin?.bottom ?? 0);
  const marginLeft = ignoreSizeAndMargin ? 0 : (margin?.left ?? 0);
  const marginRight = ignoreSizeAndMargin ? 0 : (margin?.right ?? 0);

  const containerStyle: React.CSSProperties = {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    width: size,
    height: size,
    backgroundColor: color?.fill || 'transparent',
    borderColor: color?.stroke || 'transparent',
    borderWidth: size * 0.05,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000000,
    display: 'flex',
    ...(ignoreSizeAndMargin
      ? {}
      : {
        marginTop: config.margin?.top ?? 0,
        marginRight: config.margin?.right ?? 0,
        marginBottom: config.margin?.bottom ?? 0,
        marginLeft: config.margin?.left ?? 0,
      }),
    ...style,
  };

  const renderDefaultIcon = () => {
    const stroke = color?.cross || '#ffffff';
    if (type === 'mute') {
      return (
        <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
          <polygon points="4,10 8,10 13,6 13,18 8,14 4,14" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="16" y1="8" x2="21" y2="16" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="21" y1="8" x2="16" y2="16" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
          <polygon points="4,10 8,10 13,6 13,18 8,14 4,14" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M16 10 Q18 12 16 14" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18 8 Q22 12 18 16" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <button
      onClick={onPress}
      style={{
        ...containerStyle,
        border: containerStyle.borderColor ? `${containerStyle.borderWidth}px solid ${containerStyle.borderColor as string}` : 'none',
        padding: 0,
        cursor: 'pointer',
        outline: 'none',
      }}
      title={selectedStyle || ''}
    >
      {image && image.trim() !== '' ? (
        <img
          src={image}
          style={{ width: size, height: size, objectFit: 'contain' }}
          alt={type}
        />
      ) : (
        renderDefaultIcon()
      )}
    </button>
  );
};