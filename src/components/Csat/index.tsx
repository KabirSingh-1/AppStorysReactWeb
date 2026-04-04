import React, { useEffect, useMemo, useState } from 'react';
import useCampaigns from '../../hooks/useCampaigns';
import useAppStorysStore from '../../core/store';
import trackEvent from '../../core/trackEvent';
import CrossButton from '../common/CommonElements/CrossButton';
import { CampaignCsat, CsatCampaignDetails, CsatSpacing, CsatTextStyle } from '../../types';

const FIVE_STAR_MAX = 5;
const LOW_RATING_THRESHOLD = 3;

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
  onSubmit: () => void;
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
  onSubmit,
}) => {
  const styling = details.styling || {};
  const feedbackPage = styling.feedbackPage || {};
  const ratingStyle = styling.rating || {};
  const initialFeedback = styling.initialFeedback || {};

  const selectedStarConfig = isHighRating ? ratingStyle.star?.high : ratingStyle.star?.low;
  const submitAlign = getAlignment(feedbackPage.submitButton?.cta?.container?.alignment);

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
        {Array.from({ length: FIVE_STAR_MAX }, (_, index) => {
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
          )}
        </>
      )}

      {feedbackPage.submitButton?.enabled !== false && (
        <div
          style={{
            marginTop: feedbackPage.submitButton?.cta?.margin?.top ?? 12,
            marginBottom: feedbackPage.submitButton?.cta?.margin?.bottom ?? 0,
            marginLeft: feedbackPage.submitButton?.cta?.margin?.left ?? 0,
            marginRight: feedbackPage.submitButton?.cta?.margin?.right ?? 0,
            display: 'flex',
            justifyContent: submitAlign,
            position: 'sticky',
            bottom: 0,
            zIndex: 5,
            paddingTop: 10,
            paddingBottom: 8,
            background: 'inherit',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <button
            onClick={onSubmit}
            disabled={rating < 1}
            style={{
              width: feedbackPage.submitButton?.cta?.container?.ctaFullWidth ? '100%' : feedbackPage.submitButton?.cta?.container?.ctaWidth || 'auto',
              height: feedbackPage.submitButton?.cta?.container?.height || 45,
              border: `${feedbackPage.submitButton?.cta?.container?.borderWidth ?? 0}px solid ${feedbackPage.submitButton?.cta?.container?.borderColor || 'transparent'}`,
              background: feedbackPage.submitButton?.cta?.container?.backgroundColor || '#111827',
              color: feedbackPage.submitButton?.cta?.text?.color || '#ffffff',
              borderRadius: getCornerRadius(feedbackPage.submitButton?.cta?.cornerRadius),
              fontFamily: applyFontFamily(feedbackPage.submitButton?.cta?.text?.fontFamily),
              fontSize: feedbackPage.submitButton?.cta?.text?.fontSize || 16,
              fontWeight: feedbackPage.submitButton?.cta?.text?.fontDecoration?.includes('bold') ? 'bold' : 500,
              cursor: rating < 1 ? 'not-allowed' : 'pointer',
              opacity: rating < 1 ? 0.6 : 1,
              padding: '0 16px',
            }}
          >
            {feedbackPage.submitButton?.text || 'Submit'}
          </button>
        </div>
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

  const isHighRating = rating > LOW_RATING_THRESHOLD;

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
          maxHeight: '75vh',
          overflowY: 'auto',
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
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Csat;
