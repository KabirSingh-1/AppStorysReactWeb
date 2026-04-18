import React, { useState } from 'react';
import { ImageQuizStickerData, StickerProps } from './types';

export const ImageQuizSticker: React.FC<StickerProps<ImageQuizStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const defaults = {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    questionTextColor: '#111111',
    optionBgColor: '#F7FAFC',
    optionTextColor: '#2D3748',
    borderColor: '#E2E8F0',
    activeColor: '#10B981', // Success Green
    incorrectColor: '#EF4444', // Error Red
  };

  const styling = (data as any).styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    padding: `${styling.padding ?? defaults.padding}px`,
    boxShadow: styling.shadow || '0 8px 24px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: styling.borderColor ? `1px solid ${styling.borderColor}` : 'none',
  };

  const questionStyle: React.CSSProperties = {
    color: styling.questionTextColor || defaults.questionTextColor,
    fontWeight: '800',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
    margin: '0 0 4px 0',
    textAlign: 'left',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    width: '100%',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: styling.optionBgColor || defaults.optionBgColor,
    color: styling.optionTextColor || defaults.optionTextColor,
    borderRadius: '16px',
    border: `2px solid ${styling.borderColor || defaults.borderColor}`,
    cursor: selectedOptionId ? 'default' : 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  };

  const handleOptionClick = (optionId: string) => {
    if (isEditing || selectedOptionId) return;
    setSelectedOptionId(optionId);
    onInteraction?.({
      type: 'image',
      quizId: data.id,
      optionId: optionId,
      stickerId: data.id
    });
  };

  const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23EDF2F7'/%3E%3Cpath d='M30 40 L40 30 L50 40 L60 30 L70 40 V60 H30 Z' fill='%23A0AEC0'/%3E%3Ccircle cx='40' cy='45' r='5' fill='%23FFFFFF'/%3E%3C/svg%3E";

  const options = Array.isArray(data.options) ? data.options : [];

  return (
    <div style={containerStyle}>
      {data.question && <h3 style={questionStyle}>{data.question}</h3>}
      <div style={gridStyle}>
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrect = (option as any).isCorrect === true;

          let currentOptionStyle = { ...optionStyle };
          if (selectedOptionId) {
            if (isCorrect) {
              currentOptionStyle.borderColor = styling.activeColor || defaults.activeColor;
              currentOptionStyle.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            } else if (isSelected) {
              currentOptionStyle.borderColor = styling.incorrectColor || defaults.incorrectColor;
              currentOptionStyle.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            }
          }

          return (
            <button
              key={option.id}
              style={currentOptionStyle}
              onClick={() => handleOptionClick(option.id)}
              disabled={!!selectedOptionId}
              onMouseOver={(e) => {
                if (!isEditing && !selectedOptionId) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                if (!isEditing && !selectedOptionId) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#EDF2F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                position: 'relative'
              }}>
                <img
                  src={option.image || placeholderImg}
                  alt={option.text}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {selectedOptionId && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCorrect ? defaults.activeColor : isSelected ? defaults.incorrectColor : '#A0AEC0',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {isCorrect ? '✓' : isSelected ? '✕' : ''}
                  </div>
                )}
              </div>
              <span style={{
                fontWeight: '600',
                fontSize: `${styling.optionFontSize || 13}px`,
                color: selectedOptionId && isCorrect ? defaults.activeColor : defaults.optionTextColor,
                width: '100%',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
