import React from 'react';
import { PollStickerData, StickerProps } from './types';

export const PollSticker: React.FC<StickerProps<PollStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const defaults = {
    headerColor: '#FF8844',
    headerTextColor: '#FFFFFF',
    optionBgColor: '#EBEBEB',
    optionTextColor: '#333333',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
  };

  const styling = data.styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    overflow: 'hidden',
    boxShadow: styling.shadow || '0 8px 16px rgba(0,0,0,0.12)',
    boxSizing: 'border-box',
    width: '100%',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: styling.headerColor || defaults.headerColor,
    color: styling.headerTextColor || defaults.headerTextColor,
    padding: `${styling.padding ?? defaults.padding}px`,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
  };

  const contentStyle: React.CSSProperties = {
    padding: `${styling.padding ?? defaults.padding}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: styling.optionBgColor || defaults.optionBgColor,
    color: styling.optionTextColor || defaults.optionTextColor,
    padding: '12px 16px',
    borderRadius: `${styling.optionBorderRadius ?? 10}px`,
    fontSize: `${styling.fontSize || 14}px`,
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.2s',
  };

  const handleOptionClick = (optionId: string) => {
    if (isEditing) return; // ignore during editing
    onInteraction?.({ type: 'poll_vote', pollId: data.id, optionId: optionId });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>{data.question || 'Ask A Question...'}</div>
      <div style={contentStyle}>
        {data.options.map((option) => (
          <button
            key={option.id}
            style={optionStyle}
            onClick={() => handleOptionClick(option.id)}
            onMouseOver={(e) => {
              if (!isEditing) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
              if (!isEditing) e.currentTarget.style.backgroundColor = styling.optionBgColor || defaults.optionBgColor;
            }}
          >
            <span>{option.text}</span>
            {option.percentage !== undefined && (
              <span style={{ fontSize: '11px', opacity: 0.6 }}>{option.percentage}%</span>
            )}
          </button>
        ))}
        {isEditing && (
          <div style={{ ...optionStyle, border: '1px dashed #CCC', backgroundColor: 'transparent', justifyContent: 'center', color: '#888' }}>
            Add another option...
          </div>
        )}
      </div>
    </div>
  );
};
