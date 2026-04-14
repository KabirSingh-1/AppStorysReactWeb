import React, { useEffect, useMemo, useState } from 'react';
import useCampaigns from '../../hooks/useCampaigns';
import useAppStorysStore from '../../core/store';
import trackEvent from '../../core/trackEvent';
import CrossButton from '../common/CommonElements/CrossButton';
import { CampaignCsat, CsatCampaignDetails, CsatSpacing, CsatTextStyle } from '../../types';

const FIVE_STAR_MAX = 5;
const LOW_RATING_CUTOFF = 3;

function asSpacingValue(value?: number): string | undefined {
  if (value == null) return undefined;
  return `${value}px`;
}

function spacingToStyle(spacing?: CsatSpacing): React.CSSProperties {
  return {
    marginTop: asSpacingValue(spacing?.top),
    marginRight: asSpacingValue(spacing?.right),
    marginBottom: asSpacingValue(spacing?.bottom),
    marginLeft: asSpacingValue(spacing?.left),
  };
}

function applyFontFamily(fontFamily?: string): string | undefined {
  if (!fontFamily) return undefined;
  if (fontFamily.startsWith('http://') || fontFamily.startsWith('https://')) return undefined;
  return fontFamily;
}

function textStyleToCss(textStyle?: CsatTextStyle): React.CSSProperties {
  if (!textStyle) return {};

  return {
    color: textStyle.color,
    fontSize: textStyle.fontSize,
    fontFamily: applyFontFamily(textStyle.fontFamily),
    textAlign: textStyle.textAlign as React.CSSProperties['textAlign'],
    fontWeight: textStyle.fontDecoration?.includes('bold') ? 'bold' : undefined,
    fontStyle: textStyle.fontDecoration?.includes('italic') ? 'italic' : undefined,
    textDecoration: textStyle.fontDecoration?.includes('underline') ? 'underline' : undefined,
  };
}

function getCornerRadius(cornerRadius?: { topLeft?: number; topRight?: number; bottomRight?: number; bottomLeft?: number }): string {
  return `${cornerRadius?.topLeft ?? 8}px ${cornerRadius?.topRight ?? 8}px ${cornerRadius?.bottomRight ?? 8}px ${cornerRadius?.bottomLeft ?? 8}px`;
}

function getAlignment(alignment?: string): React.CSSProperties['justifyContent'] {
  if (alignment === 'right') return 'flex-end';
  if (alignment === 'left') return 'flex-start';
  return 'center';
}

function getRatingType(details: CsatCampaignDetails): 'star' | 'number' | 'emoji' {
  const ratingType = details.styling?.rating?.ratingType;
  if (ratingType === 'number' || ratingType === 'emoji' || ratingType === 'star') return ratingType;
  return 'star';
}

function getEmojiChoices(details: CsatCampaignDetails): string[] {
  const configured = details.styling?.rating?.emoji as unknown;

  if (Array.isArray(configured)) {
    return configured.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (configured && typeof configured === 'object') {
    const values = Object.values(configured as Record<string, unknown>)
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    if (values.length > 0) return values;
  }

  if (typeof configured === 'string' && configured.trim()) {
    if (configured.includes(',')) {
      const split = configured.split(',').map((item) => item.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return [configured];
  }

  return ['😠', '😕', '😐', '🙂', '😍'];
}

function getNumberChoices(details: CsatCampaignDetails): number[] {
  // Force a 5-point numeric scale (1–5) regardless of backend config.
  // This matches the requested UI and avoids rendering 0–10 style scales.
  return Array.from({ length: 5 }, (_, index) => index + 1);
}

function asNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return undefined;
}

function getNumberRatingGap(details: CsatCampaignDetails): number {
  const rating = (details.styling?.rating as Record<string, unknown> | undefined) || undefined;
  const directCandidates = [
    rating?.['numberSpacing'],
    rating?.['numberGap'],
    rating?.['number_spacing'],
    rating?.['number_gap'],
    rating?.['spacingBetweenNumbers'],
    rating?.['spaceBetweenNumbers'],
    rating?.['numberOptionsSpacing'],
  ];

  for (const candidate of directCandidates) {
    const maybe = asNonNegativeNumber(candidate);
    if (maybe != null) return maybe;
  }

  const numberConfig = rating?.['number'];
  if (numberConfig && typeof numberConfig === 'object') {
    const obj = numberConfig as Record<string, unknown>;
    const nestedCandidates = [obj['spacing'], obj['gap'], obj['optionsSpacing'], obj['numberSpacing'], obj['numberGap']];
    for (const candidate of nestedCandidates) {
      const maybe = asNonNegativeNumber(candidate);
      if (maybe != null) return maybe;
    }
  }

  return 8;
}

function getRatingMax(details: CsatCampaignDetails): number {
  const ratingType = getRatingType(details);

  if (ratingType === 'emoji') return Math.max(1, getEmojiChoices(details).length);
  if (ratingType === 'number') {
    const choices = getNumberChoices(details);
    return Math.max(1, choices.length);
  }

  return FIVE_STAR_MAX;
}

const StarIcon: React.FC<{ fill: string; stroke: string }> = ({ fill, stroke }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <path
      d="M12 2.25l2.91 5.89 6.5.95-4.7 4.58 1.11 6.46L12 17.03 6.18 20.13l1.11-6.46-4.7-4.58 6.5-.95L12 2.25z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

interface FormContentProps {
  details: CsatCampaignDetails;
  appearance?: { backgroundColor?: string };
  rating: number;
  selectedOptions: string[];
  comments: string;
  isHighRating: boolean;
  feedbackOptions: string[];
  onRate: (value: number) => void;
  onToggleOption: (option: string) => void;
  onCommentChange: (value: string) => void;
  onInlineSubmit: () => void;
  canSubmit: boolean;
}

const CsatFormContent: React.FC<FormContentProps> = ({
  details,
  appearance,
  rating,
  selectedOptions,
  comments,
  isHighRating,
  feedbackOptions,
  onRate,
  onToggleOption,
  onCommentChange,
  onInlineSubmit,
  canSubmit,
}) => {
  const styling = details.styling || {};
  const feedbackPage = styling.feedbackPage || {};
  const ratingStyle = styling.rating || {};
  const initialFeedback = styling.initialFeedback || {};
  const submitCta = feedbackPage.submitButton?.cta;
  const ratingType = getRatingType(details);
  const numberChoices = ratingType === 'number' ? getNumberChoices(details) : [];
  const emojiChoices = ratingType === 'emoji' ? getEmojiChoices(details) : [];

  const numberGap = ratingType === 'number' ? getNumberRatingGap(details) : 8;

  const selectedStarConfig = isHighRating ? ratingStyle.star?.high : ratingStyle.star?.low;

  return (
    <>
      <div style={spacingToStyle(initialFeedback.title?.margin)}>
        <div
          style={{
            ...(textStyleToCss(initialFeedback.title?.textStyle)),
            color: initialFeedback.title?.textStyle?.color || '#101828',
            fontSize: initialFeedback.title?.textStyle?.fontSize || 20,
            lineHeight: 1.3,
          }}
        >
          {details.title || 'How was your experience?'}
        </div>
      </div>

      <div style={spacingToStyle(initialFeedback.subtitle?.margin)}>
        <div
          style={{
            ...(textStyleToCss(initialFeedback.subtitle?.textStyle)),
            color: initialFeedback.subtitle?.textStyle?.color || '#4b5563',
            fontSize: initialFeedback.subtitle?.textStyle?.fontSize || 14,
            lineHeight: 1.4,
          }}
        >
          {details.description_text || 'Your feedback helps us improve your experience.'}
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: ratingType === 'number' ? numberGap : 8, flexWrap: 'wrap' }}>
        {ratingType === 'star' && Array.from({ length: FIVE_STAR_MAX }, (_, index) => {
          const value = index + 1;
          const isSelected = value <= rating;
          const starContainerStyle = isSelected
            ? selectedStarConfig?.stylingContainer
            : ratingStyle.star?.unselected?.stylingContainer;
          const starStyle = isSelected
            ? selectedStarConfig?.stylingStar
            : ratingStyle.star?.unselected?.stylingStar;

          return (
            <button
              key={value}
              onClick={() => onRate(value)}
              style={{
                border: `${starContainerStyle?.borderWidth ?? 1}px solid ${starContainerStyle?.border || '#d1d5db'}`,
                background: starContainerStyle?.background || '#ffffff',
                borderRadius: 10,
                width: 44,
                height: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Rate ${value} out of ${FIVE_STAR_MAX}`}
            >
              <StarIcon
                fill={starStyle?.background || (isSelected ? '#f59e0b' : '#e5e7eb')}
                stroke={starStyle?.border || (isSelected ? '#d97706' : '#9ca3af')}
              />
            </button>
          );
        })}

        {ratingType === 'number' && numberChoices.map((value, index) => {
          const selected = value === rating;
          return (
            <button
              key={`${value}-${index}`}
              onClick={() => onRate(value)}
              style={{
                border: `1px solid ${selected ? '#1d4ed8' : '#d1d5db'}`,
                background: selected ? '#dbeafe' : '#ffffff',
                color: selected ? '#1d4ed8' : '#111827',
                borderRadius: 8,
                minWidth: 36,
                height: 36,
                padding: '0 10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              aria-label={`Rate ${value}`}
            >
              {value}
            </button>
          );
        })}

        {ratingType === 'emoji' && emojiChoices.map((emoji, index) => {
          const value = index + 1;
          const selected = value === rating;
          return (
            <button
              key={`${emoji}-${index}`}
              onClick={() => onRate(value)}
              style={{
                border: `1px solid ${selected ? '#1d4ed8' : '#d1d5db'}`,
                background: selected ? '#dbeafe' : '#ffffff',
                borderRadius: '999px',
                width: 44,
                height: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 22,
              }}
              aria-label={`Emoji rating ${index + 1}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <div style={{ marginTop: 6, textAlign: 'center', color: '#374151', fontSize: 14 }}>
          {isHighRating ? (details.highStarText || ratingStyle.highRatingSubtitle) : (details.lowStarText || ratingStyle.lowRatingSubtitle)}
        </div>
      )}

      {rating > 0 && rating <= LOW_RATING_CUTOFF && (
        <>
          {feedbackOptions.length > 0 && (
            <div
              style={{
                ...spacingToStyle(feedbackPage.options?.margin),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: feedbackPage.options?.optionsSpacing ?? 8,
                width: '100%',
              }}
            >
              {feedbackOptions.map((option) => {
                const isActive = selectedOptions.includes(option);
                const styleSource = isActive ? feedbackPage.options?.selectedOptions : feedbackPage.options?.nonSelectedOptions;

                return (
                  <button
                    key={option}
                    onClick={() => onToggleOption(option)}
                    style={{
                      border: `${styleSource?.borderWidth ?? 1}px solid ${styleSource?.colors?.border || '#d1d5db'}`,
                      background: styleSource?.colors?.background || '#f9fafb',
                      color: styleSource?.colors?.text || '#111827',
                      width: '100%',
                      height: feedbackPage.options?.optionsHeight || 38,
                      borderRadius: getCornerRadius(feedbackPage.options?.cornerRadius),
                      padding: '0 14px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      ...(textStyleToCss(styleSource?.textStyle)),
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          <textarea
            value={comments}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder={feedbackPage.additionalComments?.placeholder || 'Tell us what we can improve'}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 56,
              height: 56,
              maxHeight: 64,
              marginTop: 8,
              resize: 'none',
              overflowY: 'auto',
              border: `${feedbackPage.additionalComments?.borderWidth ?? 1}px solid ${feedbackPage.additionalComments?.colors?.border || '#d1d5db'}`,
              background: feedbackPage.additionalComments?.colors?.background || '#ffffff',
              color: feedbackPage.additionalComments?.colors?.text || '#111827',
              borderRadius: 8,
              padding: '12px',
              ...(textStyleToCss(feedbackPage.additionalComments?.textStyle)),
            }}
          />

          <div
            style={{
              position: 'sticky',
              bottom: 0,
              marginTop: 8,
              paddingTop: 6,
              paddingBottom: 6,
              background: appearance?.backgroundColor || '#2f6ef5',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => onInlineSubmit()}
              disabled={!canSubmit}
              style={{
                width: Math.max(140, Math.min(asNonNegativeNumber(submitCta?.container?.ctaWidth) ?? 180, 220)),
                maxWidth: '100%',
                minHeight: 30,
                height: Math.max(30, Math.min(Number(submitCta?.container?.height) || 34, 34)),
                border: `${submitCta?.container?.borderWidth ?? 1}px solid ${submitCta?.container?.borderColor || '#ff7a00'}`,
                background: submitCta?.container?.backgroundColor || '#ff2bc2',
                color: submitCta?.text?.color || '#ffffff',
                borderRadius: getCornerRadius(submitCta?.cornerRadius),
                fontFamily: applyFontFamily(submitCta?.text?.fontFamily),
                fontSize: Math.min(Number(submitCta?.text?.fontSize) || 14, 14),
                fontWeight: submitCta?.text?.fontDecoration?.includes('bold') ? 'bold' : 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.65,
                padding: '0 12px',
              }}
            >
              {feedbackPage.submitButton?.text || 'Submit'}
            </button>
          </div>
        </>
      )}

    </>
  );
};

interface ThankYouContentProps {
  details: CsatCampaignDetails;
  isHighRating: boolean;
  onDone: () => void;
}

const CsatThankYouContent: React.FC<ThankYouContentProps> = ({ details, isHighRating, onDone }) => {
  const styling = details.styling || {};
  const thankyouPage = styling.thankyouPage || {};
  const ratingStyle = styling.rating || {};
  const doneAlign = getAlignment(thankyouPage.doneButton?.cta?.container?.alignment);

  return (
    <>
      {details.thankyouImage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <img
            src={details.thankyouImage}
            alt="thank you"
            style={{
              width: thankyouPage.imageStyle?.width || 80,
              height: thankyouPage.imageStyle?.height || 80,
              objectFit: 'cover',
              borderRadius: 8,
            }}
          />
        </div>
      )}

      <div style={{ ...spacingToStyle(thankyouPage.title?.margin), textAlign: 'center' }}>
        <div
          style={{
            ...(textStyleToCss(thankyouPage.title?.textStyle)),
            color: thankyouPage.title?.textStyle?.color || '#111827',
            fontSize: thankyouPage.title?.textStyle?.fontSize || 20,
            fontWeight: thankyouPage.title?.textStyle?.fontDecoration?.includes('bold') ? 'bold' : 600,
          }}
        >
          {details.thankyouText || (isHighRating ? ratingStyle.highRatingTitle : ratingStyle.lowRatingTitle) || 'Thank you for your feedback'}
        </div>
      </div>

      <div style={{ ...spacingToStyle(thankyouPage.subtitle?.margin), textAlign: 'center' }}>
        <div
          style={{
            ...(textStyleToCss(thankyouPage.subtitle?.textStyle)),
            color: thankyouPage.subtitle?.textStyle?.color || '#4b5563',
            fontSize: thankyouPage.subtitle?.textStyle?.fontSize || 14,
          }}
        >
          {details.thankyouDescription || (isHighRating ? ratingStyle.highRatingSubtitle : ratingStyle.lowRatingSubtitle) || 'We appreciate your time.'}
        </div>
      </div>

      <div
        style={{
          marginTop: thankyouPage.doneButton?.cta?.margin?.top ?? 14,
          marginBottom: thankyouPage.doneButton?.cta?.margin?.bottom ?? 0,
          marginLeft: thankyouPage.doneButton?.cta?.margin?.left ?? 0,
          marginRight: thankyouPage.doneButton?.cta?.margin?.right ?? 0,
          display: 'flex',
          justifyContent: doneAlign,
        }}
      >
        <button
          onClick={onDone}
          style={{
            width: thankyouPage.doneButton?.cta?.container?.ctaFullWidth ? '100%' : thankyouPage.doneButton?.cta?.container?.ctaWidth || 'auto',
            height: thankyouPage.doneButton?.cta?.container?.height || 45,
            border: `${thankyouPage.doneButton?.cta?.container?.borderWidth ?? 0}px solid ${thankyouPage.doneButton?.cta?.container?.borderColor || 'transparent'}`,
            background: thankyouPage.doneButton?.cta?.container?.backgroundColor || '#111827',
            color: thankyouPage.doneButton?.cta?.text?.color || '#ffffff',
            borderRadius: getCornerRadius(thankyouPage.doneButton?.cta?.cornerRadius),
            fontFamily: applyFontFamily(thankyouPage.doneButton?.cta?.text?.fontFamily),
            fontSize: thankyouPage.doneButton?.cta?.text?.fontSize || 16,
            fontWeight: thankyouPage.doneButton?.cta?.text?.fontDecoration?.includes('bold') ? 'bold' : 500,
            cursor: 'pointer',
            padding: '0 16px',
          }}
        >
          {thankyouPage.doneButton?.text || (isHighRating ? 'Rate Now' : 'Done')}
        </button>
      </div>
    </>
  );
};

export const Csat: React.FC = () => {
  const data = useCampaigns<CampaignCsat>('CSAT');
  const sdkVisible = useAppStorysStore((state: any) => state.isVisible);

  const [isDismissed, setIsDismissed] = useState(false);
  const [canDisplay, setCanDisplay] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsDismissed(false);
    setCanDisplay(false);
    setRating(0);
    setSelectedOptions([]);
    setComments('');
    setIsSubmitted(false);

    const delay = data.details?.styling?.appearance?.displayDelay ?? 0;
    const timeoutId = globalThis.setTimeout(() => {
      setCanDisplay(true);
      void trackEvent('viewed', data.id);
    }, Math.max(0, delay) * 1000);

    return () => globalThis.clearTimeout(timeoutId);
  }, [data]);

  const feedbackOptions = useMemo(() => {
    const source = data?.details?.feedback_option || {};
    return Object.keys(source)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => source[key])
      .filter(Boolean);
  }, [data]);

  if (!data || !sdkVisible || isDismissed || !canDisplay) return null;

  const details = data.details;
  const styling = details.styling || {};
  const appearance = styling.appearance || {};

  const isHighRating = rating > LOW_RATING_CUTOFF;

  const configuredWidth = Number(details.width ?? 80);
  const compactCardWidth = Math.max(660, Math.min(1080, configuredWidth * 10));

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
  };

  const handleSubmit = async (override?: { rating?: number; options?: string[]; comments?: string }) => {
    const ratingValue = override?.rating ?? rating;
    if (ratingValue < 1) return;
    setIsSubmitted(true);

    void trackEvent('csat captured', data.id, {
      rating: ratingValue,
      options: override?.options ?? selectedOptions,
      comments: override?.comments ?? comments,
      campaign_type: 'CSAT',
    });
  };

  const handleRate = (value: number) => {
    setRating(value);

    if (value > LOW_RATING_CUTOFF) {
      setSelectedOptions([]);
      setComments('');
      void handleSubmit({ rating: value, options: [], comments: '' });
    }
  };

  const handleDone = () => {
    if (isHighRating && details.link) {
      globalThis.open(details.link, '_blank');
    }
    setIsDismissed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingBottom: '10px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `min(${compactCardWidth}px, 96vw)`,
          maxWidth: '96vw',
          minWidth: '320px',
          minHeight: '220px',
          maxHeight: '55vh',
          overflow: 'hidden',
          backgroundColor: appearance.backgroundColor || '#2f6ef5',
          borderRadius: `${appearance.borderRadius ?? 12}px`,
          boxSizing: 'border-box',
          paddingTop: '8px',
          paddingRight: asSpacingValue(appearance.padding?.right) || '12px',
          paddingBottom: '4px',
          paddingLeft: asSpacingValue(appearance.padding?.left) || '12px',
          marginTop: asSpacingValue(appearance.margin?.top),
          marginRight: asSpacingValue(appearance.margin?.right),
          marginBottom: asSpacingValue(appearance.margin?.bottom),
          marginLeft: asSpacingValue(appearance.margin?.left),
          pointerEvents: 'auto',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>
          {`
            .appstorys-csat-scroll {
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE/Edge */
            }
            .appstorys-csat-scroll::-webkit-scrollbar {
              width: 0;
              height: 0;
              display: none; /* Chrome/Safari */
            }
          `}
        </style>

        {styling.crossButton?.enabled && (
          <CrossButton
            config={styling.crossButton}
            onPress={() => setIsDismissed(true)}
            style={{
              top: styling.crossButton?.margin?.top ?? 10,
              right: styling.crossButton?.margin?.right ?? 10,
            }}
          />
        )}

        <div
          className="appstorys-csat-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingBottom: 4,
          }}
        >
          {isSubmitted ? (
            <CsatThankYouContent
              details={details}
              isHighRating={isHighRating}
              onDone={handleDone}
            />
          ) : (
            <CsatFormContent
              details={details}
              rating={rating}
              selectedOptions={selectedOptions}
              comments={comments}
              isHighRating={isHighRating}
              feedbackOptions={feedbackOptions}
              onRate={handleRate}
              onToggleOption={handleToggleOption}
              onCommentChange={setComments}
              onInlineSubmit={handleSubmit}
              canSubmit={rating >= 1}
              appearance={appearance}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Csat;
