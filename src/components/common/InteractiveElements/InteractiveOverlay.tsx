import React from 'react';
import { StickerData } from './types';
import { InteractiveItem } from './InteractiveItem';
import { parseBackground, getAnimationStyles } from '../../../utils/styleUtils';

interface InteractiveOverlayProps {
  content?: any; // Pass fully packed backend content structure
  onInteraction?: (data: any) => void;
  isEditing?: boolean;
}

const getEditorSource = (item: any, content: any): 'studio' | 'dashboard' => {
  const editorSource =
    item?.styling?.editorSource ||
    item?.styling?.meta?.editorSource ||
    item?.style?.editorSource ||
    content?.editorSource ||
    content?.meta?.editorSource;

  return editorSource === 'studio' || editorSource === 'editor' ? 'studio' : 'dashboard';
};

const normalizeOptions = (options: any, isCorrect?: string | boolean | null): any[] => {
  if (Array.isArray(options)) {
    return options.map((option, index) => {
      const optionId = option?.id || option?.key || option?.value || `option_${index + 1}`;
      const optionLabel = option?.label || option?.optionLabel;
      const optionText =
        typeof option === 'string'
          ? option
          : option?.text || option?.title || optionLabel || '';

      return {
        id: String(optionId),
        text: optionText,
        image: option?.image || option?.imageUrl || '',
        label: optionLabel,
        isCorrect: option?.isCorrect === true || String(optionId) === String(isCorrect),
      };
    });
  }

  if (options && typeof options === 'object') {
    return Object.entries(options).map(([key, value]) => {
      const optionValue = typeof value === 'string' ? { text: value } : ((value as any) || {});
      return {
        id: key,
        text: optionValue.text || optionValue.title || optionValue.label || '',
        image: optionValue.image || optionValue.imageUrl || '',
        label: optionValue.label,
        isCorrect: key === String(isCorrect),
      };
    });
  }

  return [];
};

const normalizeReactionEmojis = (data: any): string[] => {
  if (Array.isArray(data?.emojis)) {
    return data.emojis.map((emoji: any) => String(emoji));
  }

  return normalizeOptions(data?.options).map((option) => option.text).filter(Boolean);
};

const normalizeElementType = (type: any): string => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'quizz') return 'quiz';
  if (normalized === 'rate') return 'rating';
  return normalized;
};

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
  const interactions = content?.interactions || [];

  if (elements.length === 0 && images.length === 0 && texts.length === 0 && interactions.length === 0) return null;

  // 1. Map interactive elements
  const displayElements = elements.map((item: any): StickerData => {
    const custom = item.custom || {};
    const data = custom.data || {};
    const style = custom.style || {};
    const source = getEditorSource(item, content);

    // Safe coordinate conversion with bulletproof Number parsing
    const x_percent = item.x !== undefined && !isNaN(Number(item.x)) ? (Number(item.x) / canvaWidth) * 100 : 10;
    const y_percent = item.y !== undefined && !isNaN(Number(item.y)) ? (Number(item.y) / canvaHeight) * 100 : 15;
    const width_percent = item.width !== undefined && !isNaN(Number(item.width)) ? (Number(item.width) / canvaWidth) * 100 : 80;

    const baseData = {
      id: item.id || Math.random().toString(),
      type: custom.interactiveType || item.widgetType || item.type || 'unknown',
      x: x_percent,
      y: y_percent,
      width: width_percent,
      rotation: item.rotation ?? 0,
      z: item.z ?? item.position?.z ?? style.z ?? 10, // Higher default so they float on top inside displayItems list Node
      styling: {
        backgroundColor: parseBackground(style.background || style.containerBgColor || style.backgroundColor),
        borderRadius: (style.borderRadius !== undefined ? (style.borderRadius >= 100 ? 999 : style.borderRadius * scale_factor) : (style.radius !== undefined ? (style.radius >= 100 ? 999 : style.radius * scale_factor) : 0)),
        padding: (style.containerPadding !== undefined ? style.containerPadding : (style.padding !== undefined ? style.padding : 0)) * scale_factor,
        shadow: style.shadow,
        fontSize: style.questionFontSize ? style.questionFontSize * scale_factor : undefined,
        opacity: style.opacity ?? 1,
        animation: getAnimationStyles(style.animation),
      },
    };

    if (baseData.type === 'poll') {
      const normalizedOpts = normalizeOptions(data.options);
      return {
        ...baseData,
        type: 'poll',
        question: data.question || data.title || 'Poll Question',
        options: normalizedOpts,
        layout: data.layout || { type: 'vertical', columns: 1 },
        styling: {
          ...baseData.styling,
          headerColor: style.headerBgColor || style.background,
          headerTextColor: style.questionColor || style.questionTextColor || (style.question?.color),
          optionBgColor: style.optionBgColor || style.options?.background || '#1A1A1A',
          optionTextColor: style.optionTextColor || style.options?.textColor || '#ffffff',
          optionBorderRadius: style.optionBorderRadius !== undefined ? style.optionBorderRadius * scale_factor : (style.options?.radius !== undefined ? style.options?.radius * scale_factor : 0),
        },
      } as any;
    }

    if (baseData.type === 'quiz') {
      const colors = style.colors || {};
      const normalizedOpts = normalizeOptions(data.options, data.isCorrect);
      return {
        ...baseData,
        type: 'quiz',
        question: data.question || data.title || 'Quiz Question',
        options: normalizedOpts,
        showExplanation: data.showExplanation,
        url: data.url,
        styling: {
          ...baseData.styling,
          backgroundColor: style.background || style.containerBgColor || style.backgroundColor || 'transparent',
          questionTextColor: style.questionColor || colors.questionColor || style.question?.color || style.colors?.questionText || '#FF0000',
          questionBgColor: style.questionBgColor || colors.questionBackground || style.question?.background || style.colors?.questionBg || '#3BFF00',
          optionBgColor: style.optionBgColor || colors.optionBackground || style.options?.background || style.colors?.optionBg || '#C100FF',
          optionTextColor: style.optionTextColor || colors.optionTextColor || style.options?.textColor || style.colors?.optionText || '#ffffff',
          borderColor: style.borderColor || 'transparent',
          activeColor: style.correctColor || colors.correctColor || style.correctBorderColor || '#00D9FF',
          incorrectColor: style.incorrectColor || colors.incorrectColor || '#ef4444',
          optionBorderRadius: (style.optionRadius !== undefined ? (style.optionRadius >= 100 ? 999 : style.optionRadius * scale_factor) : (style.optionBorderRadius !== undefined ? (style.optionBorderRadius >= 100 ? 999 : style.optionBorderRadius * scale_factor) : 100)),
          optionFontSize: (style.optionFontSize ? style.optionFontSize : (style.typography?.optionSize ? style.typography?.optionSize : (style.options?.fontSize ? style.options?.fontSize : 16))) * scale_factor * 1.25,
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

    if (baseData.type === 'image_quiz' || baseData.type === 'imageQuiz' || (custom.interactiveType || '').toLowerCase() === 'media_quiz') {
      return {
        ...baseData,
        type: 'image_quiz',
        question: data.question || data.title || 'Image Quiz',
        options: normalizeOptions(data.options || []),
        styling: {
          ...baseData.styling,
          questionTextColor: style.questionColor,
          activeColor: style.correctColor || style.correctBorderColor,
          incorrectColor: style.incorrectColor,
          imageRadius: style.imageRadius ? style.imageRadius * scale_factor : undefined,
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
      const emojisArray = normalizeReactionEmojis(data);

      return {
        ...baseData,
        type: 'reaction',
        emojis: emojisArray.length > 0 ? emojisArray : ['😍', '👍'],
        source,
      } as any;
    }

    return baseData as any;
  });

  // 1b. Map interactions (new structure supported for story interaction types)
  const displayInteractions = (content?.interactions || []).map((item: any): StickerData => {
    const data = item.config || {};
    const style = item.styling || item.style || {}; // Map both structures
    const source = getEditorSource(item, content);

    const typeStr = normalizeElementType(item.interaction_type || item.type);

    // Support position and size structures framed sizing absolute layout setups
    const position = style.position || item.position || {};
    const size = style.size || item.size || {};

    // Support both direct dimensions and nested size/position structures scales framing
    const posX = position.x ?? item.x;
    const posY = position.y ?? item.y;
    const sizeW = size.width ?? item.width;
    const sizeH = size.height ?? item.height;

    // Fall back to defaults (10, 15, 80) if no dimension is provided or parsed to NaN
    const x_percent = posX !== undefined && !isNaN(Number(posX)) ? (Number(posX) / canvaWidth) * 100 : 10;
    const y_percent = posY !== undefined && !isNaN(Number(posY)) ? (Number(posY) / canvaHeight) * 100 : 15;
    const width_percent = sizeW !== undefined && !isNaN(Number(sizeW)) ? (Number(sizeW) / canvaWidth) * 100 : 80;
    const height_percent = sizeH !== undefined && !isNaN(Number(sizeH)) ? (Number(sizeH) / canvaHeight) * 100 : undefined;

    const baseData = {
      id: item.id || Math.random().toString(),
      type: typeStr,
      x: x_percent,
      y: y_percent,
      width: width_percent,
      height: height_percent,
      rotation: item.rotation ?? style.rotation ?? 0,
      z: item.z ?? item.position?.z ?? style.z ?? 10, // Higher default so they float on top inside displayItems list Node
      source,
      styling: {
        backgroundColor: parseBackground(style.background || style.containerBgColor || style.backgroundColor),
        borderRadius: (style.borderRadius !== undefined ? (style.borderRadius >= 100 ? 999 : style.borderRadius * scale_factor) : (style.radius !== undefined ? (style.radius >= 100 ? 999 : style.radius * scale_factor) : 0)),
        padding: (style.containerPadding !== undefined ? style.containerPadding : (style.padding !== undefined ? style.padding : 0)) * scale_factor,
        shadow: style.shadow,
        fontSize: style.questionSize ? style.questionSize * scale_factor : (style.questionFontSize ? style.questionFontSize * scale_factor : undefined),
        opacity: style.opacity ?? 1,
        animation: getAnimationStyles(style.animation),
      },
    };

    if (baseData.type === 'rating' || baseData.type === 'rate') {
      const colors = style.colors || {};
      return {
        ...baseData,
        type: 'rating',
        title: data.title || 'Do you like my space?',
        emoji: data.emoji || '😍',
        currentRating: data.currentRating,
        maxRating: data.maxRating,
        styling: {
          ...baseData.styling,
          sliderTrackColor: colors.sliderTrack || style.colors?.sliderTrack || style.colors?.sliderTrack,
          sliderFillColor: colors.sliderFill || style.colors?.sliderFill || style.sliderFill,
          emojiSize: style.emojiSize ? style.emojiSize * 0.45 : undefined,
          titleColor: colors.titleColor || style.colors?.titleColor || style.titleColor,
          titleFontSize: style.titleFontSize ? style.titleFontSize * 0.4 : undefined,
        },
      } as any;
    }

    if (baseData.type === 'poll') {
      const normalizedOpts = normalizeOptions(data.options);
      return {
        ...baseData,
        type: 'poll',
        question: data.question || data.title || 'Poll Question',
        options: normalizedOpts,
        layout: data.layout || { type: 'vertical', columns: 1 },
        styling: {
          ...baseData.styling,
          headerColor: style.headerBgColor || style.background,
          headerTextColor: style.questionColor || style.questionTextColor || (style.question?.color),
          optionBgColor: style.optionBgColor || style.options?.background || '#1A1A1A',
          optionTextColor: style.optionTextColor || style.options?.textColor || '#ffffff',
          optionBorderRadius: style.optionBorderRadius !== undefined ? style.optionBorderRadius * scale_factor : (style.options?.radius !== undefined ? style.options?.radius * scale_factor : 0),
        },
      } as any;
    }

    if (baseData.type === 'quiz') {
      const colors = style.colors || {};
      const normalizedOpts = normalizeOptions(data.options, data.isCorrect);
      return {
        ...baseData,
        type: 'quiz',
        question: data.question || data.title || 'Quiz Question',
        options: normalizedOpts,
        showExplanation: data.showExplanation,
        url: data.url,
        styling: {
          ...baseData.styling,
          backgroundColor: style.background || style.containerBgColor || style.backgroundColor || 'transparent',
          questionTextColor: style.questionColor || colors.questionColor || style.question?.color || style.colors?.questionText || '#FF0000',
          questionBgColor: style.questionBgColor || colors.questionBackground || style.question?.background || style.colors?.questionBg || '#3BFF00',
          optionBgColor: style.optionBgColor || colors.optionBackground || style.options?.background || style.colors?.optionBg || '#C100FF',
          optionTextColor: style.optionTextColor || colors.optionTextColor || style.options?.textColor || style.colors?.optionText || '#ffffff',
          borderColor: style.borderColor || 'transparent',
          activeColor: style.correctColor || colors.correctColor || style.correctBorderColor || '#00D9FF',
          incorrectColor: style.incorrectColor || colors.incorrectColor || '#ef4444',
          optionBorderRadius: (style.optionRadius !== undefined ? (style.optionRadius >= 100 ? 999 : style.optionRadius * scale_factor) : (style.optionBorderRadius !== undefined ? (style.optionBorderRadius >= 100 ? 999 : style.optionBorderRadius * scale_factor) : 100)),
          optionFontSize: (style.optionFontSize ? style.optionFontSize : (style.typography?.optionSize ? style.typography?.optionSize : (style.options?.fontSize ? style.options?.fontSize : 16))) * scale_factor * 1.25,
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
          promptColor: style.questionColor || style.promptColor || style.textColor,
          inputBgColor: style.inputBackground || style.inputBgColor,
        },
      } as any;
    }

    if (baseData.type === 'image_quiz' || baseData.type === 'imageQuiz' || typeStr === 'media_quiz') {
      return {
        ...baseData,
        type: 'image_quiz',
        question: data.question || data.title || 'Image Quiz',
        options: normalizeOptions(data.options || []),
        styling: {
          ...baseData.styling,
          questionTextColor: style.questionColor,
          activeColor: style.correctColor || style.correctBorderColor,
          incorrectColor: style.incorrectColor,
          imageRadius: style.imageRadius ? style.imageRadius * scale_factor : undefined,
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
      const emojisArray = normalizeReactionEmojis(data);

      return {
        ...baseData,
        type: 'reaction',
        emojis: emojisArray.length > 0 ? emojisArray : ['😍', '👍'],
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
  const displayItems = [...displayElements, ...displayInteractions, ...displayImages, ...displayText].sort((a: any, b: any) => (a.z ?? 0) - (b.z ?? 0));

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
      <style>{`
        @keyframes appstorys-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes appstorys-classic-in {
          0% { opacity: 0; transform: scale(0.7); }
          70% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appstorys-rotate-in {
          from { opacity: 0; transform: rotate(-20deg) scale(0.5); }
          to { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes appstorys-bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { opacity: 1; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {displayItems.map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        const typeStr = (item.type || '').toLowerCase();
        if (!typeStr) return null; // Ignore invalid element items

        return (
          <InteractiveItem
            key={item.id}
            data={item as StickerData}
            onInteraction={onInteraction}
            isEditing={isEditing}
          />
        );
      })}
    </div>
  );
};
