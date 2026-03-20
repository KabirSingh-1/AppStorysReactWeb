import React from 'react';
import { StickerData } from './types';
import { InteractiveItem } from './InteractiveItem';

interface InteractiveOverlayProps {
  content?: any; // Pass fully packed backend content structure
  onInteraction?: (data: any) => void;
  isEditing?: boolean;
}

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
  content = {},
  onInteraction,
  isEditing = false,
}) => {
  const canva = content?.canva || { height: 1920, width: 1080 };
  const canvaWidth = canva?.width || 1080;
  const canvaHeight = canva?.height || 1920;
  const scale_factor = 0.352; // standard width desktop factor scaling 380/1080

  const elements = content?.elements || [];
  const images = content?.image || [];
  const texts = content?.text || [];

  if (elements.length === 0 && images.length === 0 && texts.length === 0) return null;

  // 1. Map interactive elements
  const displayElements = elements.map((item: any): StickerData => {
    const custom = item.custom || {};
    const data = custom.data || {};
    const style = custom.style || {};

    const x_percent = (item.x / canvaWidth) * 100;
    const y_percent = (item.y / canvaHeight) * 100;
    const width_percent = (item.width / canvaWidth) * 100;

    const baseData = {
      id: item.id || Math.random().toString(),
      type: custom.interactiveType || item.widgetType || 'unknown',
      x: x_percent,
      y: y_percent,
      width: width_percent,
      rotation: item.rotation ?? 0,
      styling: {
        backgroundColor: style.containerBgColor,
        borderRadius: style.containerBorderRadius ? style.containerBorderRadius * scale_factor : undefined,
        padding: style.containerPadding ? style.containerPadding * scale_factor : undefined,
        shadow: style.shadow,
        fontSize: style.questionFontSize ? style.questionFontSize * scale_factor : undefined,
      },
    };

    if (baseData.type === 'poll') {
      return {
        ...baseData,
        type: 'poll',
        question: data.question || data.title || 'Poll Question',
        options: data.options || [],
        styling: {
          ...baseData.styling,
          headerColor: style.headerBgColor,
          headerTextColor: style.questionColor,
          optionBgColor: style.optionBgColor,
          optionTextColor: style.optionTextColor,
          optionBorderRadius: style.optionBorderRadius ? style.optionBorderRadius * scale_factor : undefined,
        },
      } as any;
    }

    if (baseData.type === 'quiz') {
      return {
        ...baseData,
        type: 'quiz',
        question: data.question || data.title || 'Quiz Question',
        options: data.options || [],
        styling: {
          ...baseData.styling,
          questionTextColor: style.questionColor,
          optionBgColor: style.optionBgColor,
          optionTextColor: style.optionTextColor,
          borderColor: style.borderColor,
          activeColor: style.correctColor,
          incorrectColor: style.incorrectColor,
          optionBorderRadius: style.optionBorderRadius ? style.optionBorderRadius * scale_factor : undefined,
          optionFontSize: style.optionFontSize ? style.optionFontSize * scale_factor : undefined,
        },
      } as any;
    }

    if (baseData.type === 'rating') {
      return {
        ...baseData,
        type: 'rating',
        title: data.title || 'Do you like my space?',
        emoji: data.emoji || '😍',
        currentRating: data.currentRating,
        maxRating: data.maxRating,
        styling: {
          ...baseData.styling,
          sliderTrackColor: style.colors?.sliderTrack || style.sliderTrack,
          sliderFillColor: style.colors?.sliderFill || style.sliderFill,
          emojiSize: style.emojiSize ? style.emojiSize * 0.45 : undefined,
          titleColor: style.colors?.titleColor || style.titleColor,
          titleFontSize: style.titleFontSize ? style.titleFontSize * 0.4 : undefined,
        },
      } as any;
    }

    if (baseData.type === 'question' || baseData.type === 'ask_question') {
      return {
        ...baseData,
        type: 'question',
        question: data.question || data.title || 'Ask me a question',
        placeholder: data.placeholder || 'Type something...',
        styling: {
          ...baseData.styling,
          promptColor: style.questionColor || style.textColor,
          inputBgColor: style.inputBgColor,
        },
      } as any;
    }

    if (baseData.type === 'image_quiz' || baseData.type === 'imageQuiz') {
      return {
        ...baseData,
        type: 'image_quiz',
        question: data.question || data.title || 'Image Quiz',
        options: (data.options || []).map((o: any) => ({
          id: o.id || Math.random().toString(),
          text: o.text || o.title || '',
          image: o.image || o.imageUrl || '',
          isCorrect: o.isCorrect === true
        })),
        styling: {
          ...baseData.styling,
          questionTextColor: style.questionColor,
          activeColor: style.correctColor,
          incorrectColor: style.incorrectColor,
        },
      } as any;
    }

    if (baseData.type === 'countdown') {
      return {
        ...baseData,
        type: 'countdown',
        title: data.title || 'Ends in...',
        targetDate: data.targetDate || data.endDate || new Date(Date.now() + 86400000).toISOString(),
        styling: {
          ...baseData.styling,
          borderColor: style.borderColor,
        },
      } as any;
    }

    if (baseData.type === 'promo_code' || baseData.type === 'promoCode') {
      return {
        ...baseData,
        type: 'promo_code',
        code: data.code || 'CODE20',
        styling: {
          ...baseData.styling,
          borderColor: style.borderColor,
        },
      } as any;
    }

    if (baseData.type === 'reaction' || baseData.type === 'emoji_reaction') {
      return {
        ...baseData,
        type: 'reaction',
        emojis: data.emojis || ['😍', '👍'],
      } as any;
    }

    return baseData as any;
  });

  // 2. Map static images
  const displayImages = images.map((img: any) => {
    const position = img.position || img.postion || { x: 0, y: 0 };
    return {
      id: img.id || Math.random().toString(),
      type: 'image',
      x: (position.x / canvaWidth) * 100,
      y: (position.y / canvaHeight) * 100,
      width: (img.width / canvaWidth) * 100,
      height: img.height ? (img.height / canvaHeight) * 100 : undefined,
      url: img.link || img.url,
      z: img.z ?? 0,
    };
  });

  // 3. Map static text
  const displayText = texts.map((txt: any) => {
    const position = txt.position || { x: 0, y: 0 };
    const font = txt.font || {};
    return {
      id: txt.id || Math.random().toString(),
      type: 'text',
      x: (position.x / canvaWidth) * 100,
      y: (position.y / canvaHeight) * 100,
      width: txt.size?.width ? (txt.size.width / canvaWidth) * 100 : undefined,
      text: txt.value,
      z: txt.z ?? 1,
      styling: {
        color: txt.color || '#000000',
        fontSize: font.fontSize ? font.fontSize * scale_factor : undefined,
        fontFamily: font.fontFamily,
        fontStyle: font.fontStyle,
        fontWeight: font.fontWeight,
      },
    };
  });

  // Combine & Sort by Z index index layer mappings stack
  const displayItems = [...displayElements, ...displayImages, ...displayText].sort((a: any, b: any) => (a.z ?? 0) - (b.z ?? 0));

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  return (
    <div style={overlayStyle}>
      {displayItems.map((item: any) => (
        <InteractiveItem
          key={item.id}
          data={item as StickerData}
          onInteraction={onInteraction}
          isEditing={isEditing}
        />
      ))}
    </div>
  );
};
