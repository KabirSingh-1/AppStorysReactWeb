import React from 'react';

export interface CrossButtonConfig {
  color: {
    cross: string;
    fill: string;
    stroke: string;
  };
  enabled: boolean;
  image: string;
  margin: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  selectedStyle?: string;
  size: number;
}

interface CrossButtonProps {
  config?: CrossButtonConfig | null;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ignoreSizeAndMargin?: boolean;
}

const CrossButton: React.FC<CrossButtonProps> = ({ config, onPress, style, ignoreSizeAndMargin = false }) => {
  if (!config || !config.enabled) {
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
    position: 'absolute',
    display: 'flex',
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    borderStyle: color?.stroke ? 'solid' : 'none',
    ...style,
  };

  const renderDefaultIcon = () => {
    const stroke = color?.cross || '#ffffff';
    return (
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <line x1="6" y1="6" x2="18" y2="18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="18" y1="6" x2="6" y2="18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
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
          alt="close"
        />
      ) : (
        renderDefaultIcon()
      )}
    </button>
  );
};

export default CrossButton;