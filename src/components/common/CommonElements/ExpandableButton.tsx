import React from 'react';
import { PipButtonConfig } from '../../Pip/types';

interface ExpandableButtonProps {
  config: PipButtonConfig;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ignoreSizeAndMargin?: boolean;
  enabled?: boolean;
  type: 'maximise' | 'minimise';
}

export const ExpandableButton: React.FC<ExpandableButtonProps> = ({
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

  const containerStyle: React.CSSProperties = {
    marginTop: ignoreSizeAndMargin ? 0 : (margin?.top ?? 0),
    marginBottom: ignoreSizeAndMargin ? 0 : (margin?.bottom ?? 0),
    marginLeft: ignoreSizeAndMargin ? 0 : (margin?.left ?? 0),
    marginRight: ignoreSizeAndMargin ? 0 : (margin?.right ?? 0),
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
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    borderStyle: color?.stroke ? 'solid' : 'none',
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
    if (type === 'maximise') {
      return (
        <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
          <polyline points="8,3 3,3 3,8" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="3" x2="9" y2="9" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <polyline points="16,21 21,21 21,16" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="15" y1="15" x2="21" y2="21" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
          <polyline points="9,9 3,9 3,3" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="9" x2="9" y2="3" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
          <polyline points="15,15 21,15 21,21" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="15" y1="21" x2="21" y2="15" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <button
      onClick={onPress}
      style={containerStyle}
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