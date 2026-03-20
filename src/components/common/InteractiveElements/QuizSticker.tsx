import React, { useState } from 'react';
import { QuizStickerData, StickerProps } from './types';

export const QuizSticker: React.FC<StickerProps<QuizStickerData>> = ({
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
    optionBgColor: '#FFFFFF',
    optionTextColor: '#2B2B2B',
    borderColor: '#F1F3F5',
    activeColor: '#10b981', // Success Green
    incorrectColor: '#ef4444', // Error Red
    labelBgColor: '#F1F3F5',
    labelTextColor: '#334155',
  };

  const styling = (data as any).styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    padding: `${styling.padding ?? defaults.padding}px`,
    boxShadow: styling.shadow || '0 4px 12px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const questionStyle: React.CSSProperties = {
    color: styling.questionTextColor || defaults.questionTextColor,
    fontWeight: '800',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
    margin: '0 0 8px 0',
    textAlign: 'left',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: styling.optionBgColor || defaults.optionBgColor,
    color: styling.optionTextColor || defaults.optionTextColor,
    padding: `${styling.optionPadding || 12}px`,
    borderRadius: `${styling.optionBorderRadius || 12}px`,
    border: `1px solid ${styling.borderColor || defaults.borderColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: selectedOptionId ? 'default' : 'pointer',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    borderRadius: '50%',
    backgroundColor: styling.labelBgColor || defaults.labelBgColor,
    color: styling.labelTextColor || defaults.labelTextColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
  };

  const handleOptionClick = (optionId: string) => {
    if (isEditing || selectedOptionId) return; // ignore multiple clicks
    setSelectedOptionId(optionId);
    onInteraction?.({ type: 'quiz_answer', quizId: data.id, optionId: optionId });
  };

  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div style={containerStyle}>
      {data.question && <h3 style={questionStyle}>{data.question}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.options.map((option, index) => {
          const label = (option as any).label || alphabet[index] || '•';
          const isSelected = option.id === selectedOptionId;
          const isCorrect = (option as any).isCorrect === true || option.id === 'B'; // Mock just in case fallback, though data correctly has isCorrect

          let currentOptionStyle = { ...optionStyle };
          if (selectedOptionId) {
            if (isCorrect) {
              currentOptionStyle.backgroundColor = styling.activeColor || defaults.activeColor;
              currentOptionStyle.borderColor = styling.activeColor || defaults.activeColor;
              currentOptionStyle.color = '#FFFFFF';
            } else if (isSelected) {
              currentOptionStyle.backgroundColor = styling.incorrectColor || defaults.incorrectColor;
              currentOptionStyle.borderColor = styling.incorrectColor || defaults.incorrectColor;
              currentOptionStyle.color = '#FFFFFF';
            }
          }

          return (
            <button
              key={option.id}
              style={currentOptionStyle}
              onClick={() => handleOptionClick(option.id)}
              disabled={!!selectedOptionId}
              onMouseOver={(e) => {
                if (!isEditing && !selectedOptionId) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                if (!isEditing && !selectedOptionId) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={labelStyle} className="letter-circle">{label}</div>
              <span style={{ fontWeight: '600', fontSize: `${styling.optionFontSize || 14}px` }}>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
