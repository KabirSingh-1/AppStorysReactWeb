import React from 'react';

export interface ShareButtonConfig {
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

interface ShareButtonProps {
  config: ShareButtonConfig | null;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ignoreSizeAndMargin?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ config, onPress, ignoreSizeAndMargin = false, style }) => {
  if (!config || config.enabled === false) {
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
      <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
          alt="share"
        />
      ) : (
        renderDefaultIcon()
      )}
    </button>
  );
};

export default ShareButton;