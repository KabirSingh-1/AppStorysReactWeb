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
    questionTextColor: '#FFFFFF', // Changed from #111111 to white for black header
    questionBgColor: '#000000',
    optionBgColor: '#FFFFFF',
    optionTextColor: '#2B2B2B',
    borderColor: '#E5E7EB',
    activeColor: '#10b981', // Success Green
    incorrectColor: '#ef4444', // Error Red
    labelBgColor: '#FFFFFF',
    labelTextColor: '#111111',
    labelBorderColor: '#111111',
  };

  const styling = (data as any).styling || {};
  const cardPadding = styling.padding ?? defaults.padding;
  const questionFontSize = styling.fontSize ? styling.fontSize + 6 : 22; // Larger default
  const optionFontSize = styling.optionFontSize || 17; // Larger default
  const optionRadius = styling.optionBorderRadius || 14;
  const borderColor = styling.borderColor || defaults.borderColor;
  const labelSize = Math.min(Math.max(Math.round(optionFontSize * 2.1), 18), 32);
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    padding: `${cardPadding}px`,
    paddingTop: 0, // Header will handle its own top padding
    boxShadow: styling.shadow || '0 10px 30px rgba(0,0,0,0.12)',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Ensure header doesn't bleed
    opacity: styling.opacity ?? 1,
  };

  const questionStyle: React.CSSProperties = {
    color: styling.questionTextColor || defaults.questionTextColor,
    backgroundColor: styling.questionBgColor || defaults.questionBgColor,
    fontWeight: '900',
    fontSize: `${questionFontSize}px`,
    lineHeight: 1.25,
    margin: `0 -${cardPadding}px 16px -${cardPadding}px`, // Flush edges
    textAlign: 'center',
    padding: `24px ${cardPadding}px`,
    borderTopLeftRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    borderTopRightRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    letterSpacing: '-0.01em',
  };

  const optionStyle: React.CSSProperties = {
    backgroundColor: styling.optionBgColor || defaults.optionBgColor,
    color: styling.optionTextColor || defaults.optionTextColor,
    padding: `${styling.optionPadding || Math.max(cardPadding * 0.7, 10)}px ${Math.max(cardPadding * 0.8, 12)}px`,
    borderRadius: `${optionRadius}px`,
    border: `1px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: `${Math.max(Math.round(labelSize * 0.45), 8)}px`,
    cursor: selectedOptionId ? 'default' : 'pointer',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
  };

  const labelStyle: React.CSSProperties = {
    width: `${labelSize}px`,
    height: `${labelSize}px`,
    minWidth: `${labelSize}px`,
    borderRadius: '50%',
    backgroundColor: styling.labelBgColor || defaults.labelBgColor,
    color: styling.labelTextColor || defaults.labelTextColor,
    border: `${Math.max(Math.round(labelSize * 0.08), 1)}px solid ${styling.labelBorderColor || defaults.labelBorderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: `${Math.max(Math.round(labelSize * 0.46), 10)}px`,
  };

  const bodyStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `0 0 ${styling.borderRadius ?? defaults.borderRadius}px ${styling.borderRadius ?? defaults.borderRadius}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: `${Math.max(cardPadding * 0.55, 8)}px`,
  };

  const handleOptionClick = (optionId: string) => {
    if (isEditing || selectedOptionId) return; // ignore multiple clicks
    setSelectedOptionId(optionId);
    onInteraction?.({
      type: 'quiz',
      quizId: data.id,
      optionId: optionId,
      stickerId: data.id
    });
  };

  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
  const options = Array.isArray(data.options) ? data.options : [];

  if (options.length === 0 && !isEditing) {
    console.warn('AppStorys: QuizSticker has no options!', data.id);
  }

  return (
    <div style={{ ...containerStyle, background: styling.backgroundColor || defaults.backgroundColor }}>
      {data.question && <h3 style={questionStyle}>{data.question}</h3>}
      <div style={{ ...bodyStyle, background: 'transparent' }}>
        {options.map((option, index) => {
          const label = (option as any).label || alphabet[index] || '•';
          const isSelected = option.id === selectedOptionId;
          const isCorrect = (option as any).isCorrect === true;

          let currentOptionStyle = { ...optionStyle };
          let currentLabelStyle = { ...labelStyle };

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
            >
              <div style={labelStyle} className="letter-circle">{label}</div>
              <span style={{ fontWeight: '600', fontSize: `${optionFontSize}px` }}>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
