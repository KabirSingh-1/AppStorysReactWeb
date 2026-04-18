import React from 'react';
import { PollStickerData, StickerProps } from './types';

export const PollSticker: React.FC<StickerProps<PollStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const isHorizontal = data.layout?.type === 'horizontal';
  const defaults = {
    headerTextColor: '#000000',
    optionBgColor: '#1A1A1A',
    optionTextColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  };

  const styling = data.styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    overflow: 'hidden',
    boxShadow: styling.shadow || '0 12px 24px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
    width: '100%',
    opacity: styling.opacity ?? 1,
    padding: `${styling.padding ?? defaults.padding}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  };

  const questionStyle: React.CSSProperties = {
    color: styling.headerTextColor || defaults.headerTextColor,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: `${styling.fontSize ? styling.fontSize + 4 : 20}px`,
    lineHeight: '1.2',
    margin: '0',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const optionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: '4px',
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: '12px',
    overflow: 'hidden',
    padding: '2px',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: styling.optionBgColor || 'transparent',
    color: styling.optionTextColor || defaults.optionTextColor,
    padding: isHorizontal ? '14px 10px' : '16px 20px',
    fontSize: `${styling.fontSize ? styling.fontSize + 1 : 16}px`,
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    flex: 1,
    borderRight: isHorizontal ? '1px solid rgba(255,255,255,0.1)' : 'none',
    borderBottom: !isHorizontal ? '1px solid rgba(255,255,255,0.1)' : 'none',
  };

  const handleOptionClick = (optionId: string) => {
    if (isEditing) return;
    onInteraction?.({
      type: 'poll',
      pollId: data.id,
      optionId: optionId,
      stickerId: data.id
    });
  };

  const options = Array.isArray(data.options) ? data.options : [];

  return (
    <div style={containerStyle}>
      <h3 style={questionStyle}>{data.question || 'Ask A Question...'}</h3>
      <div style={optionsContainerStyle}>
        {options.map((option, index) => (
          <button
            key={option.id}
            style={{ 
              ...optionStyle, 
              borderRight: isHorizontal && index === options.length - 1 ? 'none' : optionStyle.borderRight,
              borderBottom: !isHorizontal && index === options.length - 1 ? 'none' : optionStyle.borderBottom
            }}
            onClick={() => handleOptionClick(option.id)}
            onMouseOver={(e) => {
              if (!isEditing) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
              if (!isEditing) e.currentTarget.style.backgroundColor = styling.optionBgColor || 'transparent';
            }}
          >
            {option.text}
            {option.percentage !== undefined && (
              <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px' }}>{option.percentage}%</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
