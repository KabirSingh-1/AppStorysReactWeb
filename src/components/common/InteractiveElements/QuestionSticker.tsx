import React from 'react';
import { QuestionStickerData, StickerProps } from './types';

export const QuestionSticker: React.FC<StickerProps<QuestionStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const defaults = {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    promptColor: '#111111',
    inputBgColor: '#FFFFFF',
    borderColor: '#EFEFEF',
    textColor: '#333333',
    placeholderColor: '#A0AEC0',
  };

  const styling = data.styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    padding: `${styling.padding ?? defaults.padding}px`,
    boxShadow: styling.shadow || '0 8px 24px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    border: `1px solid ${styling.borderColor || '#F0F0F0'}`,
  };

  const questionStyle: React.CSSProperties = {
    color: styling.promptColor || defaults.promptColor,
    fontWeight: '700',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
    textAlign: 'center',
    marginBottom: '2px',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: styling.inputBgColor || defaults.inputBgColor,
    border: `1px solid ${styling.borderColor || defaults.borderColor}`,
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    boxSizing: 'border-box',
    color: styling.inputTextColor || defaults.textColor,
    fontSize: `${styling.fontSize || 14}px`,
    outline: 'none',
    textAlign: 'center',
    cursor: isEditing ? 'default' : 'text',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) return;
    onInteraction?.({
      type: 'question',
      questionId: data.id,
      value: e.target.value,
      stickerId: data.id
    });
  };

  return (
    <div style={containerStyle}>
      <div style={questionStyle}>{data.question || 'Ask me a question'}</div>
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type="text"
          placeholder={data.placeholder || 'Type something...'}
          style={inputStyle}
          disabled={isEditing}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
