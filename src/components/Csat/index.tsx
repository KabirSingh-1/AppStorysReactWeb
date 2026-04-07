import React, { useEffect, useMemo, useState } from 'react';
import useCampaigns from '../../hooks/useCampaigns';
import useAppStorysStore from '../../core/store';
import trackEvent from '../../core/trackEvent';
import CrossButton from '../common/CommonElements/CrossButton';
import { CampaignCsat, CsatCampaignDetails, CsatSpacing, CsatTextStyle } from '../../types';

const FIVE_STAR_MAX = 5;

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
  const configured = details.styling?.rating?.number as unknown;

  if (typeof configured === 'number' && Number.isFinite(configured) && configured > 0) {
    if (configured === 10) {
      return Array.from({ length: 11 }, (_, index) => index);
    }
    return Array.from({ length: Math.floor(configured) }, (_, index) => index + 1);
  }

  if (configured && typeof configured === 'object') {
    const min = Number((configured as Record<string, unknown>).min);
    const max = Number((configured as Record<string, unknown>).max);

    if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
      const start = Math.floor(min);
      const end = Math.floor(max);
      return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }
  }

  return Array.from({ length: 11 }, (_, index) => index);
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

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
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
        <div style={{ marginTop: 10, textAlign: 'center', color: '#374151', fontSize: 14 }}>
          {isHighRating ? (details.highStarText || ratingStyle.highRatingSubtitle) : (details.lowStarText || ratingStyle.lowRatingSubtitle)}
        </div>
      )}

      {rating > 0 && (
        <>
          {feedbackOptions.length > 0 && (
            <div style={{ ...spacingToStyle(feedbackPage.options?.margin), display: 'flex', flexWrap: 'wrap', gap: feedbackPage.options?.optionsSpacing ?? 8 }}>
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
                      height: feedbackPage.options?.optionsHeight || 42,
                      borderRadius: getCornerRadius(feedbackPage.options?.cornerRadius),
                      padding: '0 12px',
                      cursor: 'pointer',
                      ...(textStyleToCss(styleSource?.textStyle)),
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {feedbackPage.additionalComments?.enabled && (
            <>
              <textarea
                value={comments}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder={feedbackPage.additionalComments?.placeholder || 'Tell us what we can improve'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  minHeight: 94,
                  height: 94,
                  maxHeight: 120,
                  marginTop: 12,
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

              <button
                onClick={onInlineSubmit}
                disabled={!canSubmit}
                style={{
                  marginTop: 10,
                  width: '100%',
                  height: submitCta?.container?.height || 45,
                  border: `${submitCta?.container?.borderWidth ?? 0}px solid ${submitCta?.container?.borderColor || 'transparent'}`,
                  background: submitCta?.container?.backgroundColor || '#111827',
                  color: submitCta?.text?.color || '#ffffff',
                  borderRadius: getCornerRadius(submitCta?.cornerRadius),
                  fontFamily: applyFontFamily(submitCta?.text?.fontFamily),
                  fontSize: submitCta?.text?.fontSize || 16,
                  fontWeight: submitCta?.text?.fontDecoration?.includes('bold') ? 'bold' : 500,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  opacity: canSubmit ? 1 : 0.6,
                }}
              >
                {feedbackPage.submitButton?.text || 'Submit'}
              </button>
            </>
          )}
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
  const feedbackPage = styling.feedbackPage || {};
  const submitCta = feedbackPage.submitButton?.cta;
  const submitAlign = getAlignment(submitCta?.container?.alignment);
  const submitEnabled = feedbackPage.submitButton?.enabled !== false;
  const rawSubmitHeight = Number(submitCta?.container?.height);
  const submitHeight = Number.isFinite(rawSubmitHeight) && rawSubmitHeight > 0 ? rawSubmitHeight : 45;
  const submitFooterSpace = submitHeight + 28;

  const ratingMax = getRatingMax(details);
  const lowRatingThreshold = Math.max(1, Math.ceil(ratingMax * 0.6));
  const isHighRating = rating > lowRatingThreshold;

  const cardWidthPercent = Math.max(50, Math.min(100, details.width ?? 80));

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
  };

  const handleSubmit = async () => {
    if (rating < 1) return;
    setIsSubmitted(true);

    void trackEvent('csat captured', data.id, {
      rating,
      options: selectedOptions,
      comments,
      campaign_type: 'CSAT',
    });
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
          width: `min(1100px, ${cardWidthPercent}vw)`,
          maxWidth: '100%',
          minWidth: '280px',
          minHeight: '240px',
          maxHeight: '75vh',
          overflow: 'hidden',
          backgroundColor: appearance.backgroundColor || '#2f6ef5',
          borderRadius: `${appearance.borderRadius ?? 12}px`,
          boxSizing: 'border-box',
          paddingTop: asSpacingValue(appearance.padding?.top) || '18px',
          paddingRight: asSpacingValue(appearance.padding?.right) || '12px',
          paddingBottom: asSpacingValue(appearance.padding?.bottom) || '18px',
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
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingBottom: !isSubmitted && submitEnabled ? submitFooterSpace : 8,
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
              onRate={setRating}
              onToggleOption={handleToggleOption}
              onCommentChange={setComments}
              onInlineSubmit={handleSubmit}
              canSubmit={rating >= 1}
            />
          )}
        </div>

        {!isSubmitted && submitEnabled && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              marginTop: submitCta?.margin?.top ?? 12,
              marginBottom: submitCta?.margin?.bottom ?? 0,
              marginLeft: submitCta?.margin?.left ?? 0,
              marginRight: submitCta?.margin?.right ?? 0,
              display: 'flex',
              justifyContent: submitAlign,
              paddingTop: 10,
              paddingBottom: 8,
              backgroundColor: appearance.backgroundColor || '#2f6ef5',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              zIndex: 3,
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={rating < 1}
              style={{
                width: submitCta?.container?.ctaFullWidth ? '100%' : submitCta?.container?.ctaWidth || 'auto',
                height: submitHeight,
                border: `${submitCta?.container?.borderWidth ?? 0}px solid ${submitCta?.container?.borderColor || 'transparent'}`,
                background: submitCta?.container?.backgroundColor || '#111827',
                color: submitCta?.text?.color || '#ffffff',
                borderRadius: getCornerRadius(submitCta?.cornerRadius),
                fontFamily: applyFontFamily(submitCta?.text?.fontFamily),
                fontSize: submitCta?.text?.fontSize || 16,
                fontWeight: submitCta?.text?.fontDecoration?.includes('bold') ? 'bold' : 500,
                cursor: rating < 1 ? 'not-allowed' : 'pointer',
                opacity: rating < 1 ? 0.6 : 1,
                padding: '0 16px',
              }}
            >
              {feedbackPage.submitButton?.text || 'Submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Csat;
