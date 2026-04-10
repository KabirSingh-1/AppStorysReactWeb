import React, { useEffect, useMemo, useState } from 'react';
import useCampaigns from '../../hooks/useCampaigns';
import useAppStorysStore from '../../core/store';
import trackEvent from '../../core/trackEvent';
import CrossButton from '../common/CommonElements/CrossButton';
import { CampaignSurvey, SurveyCampaignDetails, SurveySlide, SurveyTextStyle } from '../../types';

function asSpacingValue(value?: number): string | undefined {
  if (value == null) return undefined;
  return `${value}px`;
}

function applyFontFamily(fontFamily?: string): string | undefined {
  if (!fontFamily) return undefined;
  if (fontFamily.startsWith('http://') || fontFamily.startsWith('https://')) return undefined;
  return fontFamily;
}

function textStyleToCss(textStyle?: SurveyTextStyle): React.CSSProperties {
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

function marginToStyle(margin?: SurveyTextStyle['margin']): React.CSSProperties {
  return {
    marginTop: asSpacingValue(margin?.top),
    marginRight: asSpacingValue(margin?.right),
    marginBottom: asSpacingValue(margin?.bottom),
    marginLeft: asSpacingValue(margin?.left),
  };
}

function getCornerRadius(cornerRadius?: { topLeft?: number; topRight?: number; bottomRight?: number; bottomLeft?: number }): string {
  return `${cornerRadius?.topLeft ?? 12}px ${cornerRadius?.topRight ?? 12}px ${cornerRadius?.bottomRight ?? cornerRadius?.topRight ?? 12}px ${cornerRadius?.bottomLeft ?? cornerRadius?.topLeft ?? 12}px`;
}

function getAlignment(alignment?: string): React.CSSProperties['justifyContent'] {
  if (alignment === 'right') return 'flex-end';
  if (alignment === 'left') return 'flex-start';
  return 'center';
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = (hex || '').trim().replace('#', '');
  if (raw.length === 3) {
    const r = Number.parseInt(raw[0] + raw[0], 16);
    const g = Number.parseInt(raw[1] + raw[1], 16);
    const b = Number.parseInt(raw[2] + raw[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
  }

  if (raw.length === 6) {
    const r = Number.parseInt(raw.slice(0, 2), 16);
    const g = Number.parseInt(raw.slice(2, 4), 16);
    const b = Number.parseInt(raw.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
  }

  return `rgba(0, 0, 0, ${clamp01(alpha)})`;
}

function normalizeBackdropOpacity(opacity?: number): number {
  if (opacity == null) return 0.4;
  const value = Number(opacity);
  if (!Number.isFinite(value)) return 0.4;
  if (value > 1) return clamp01(value / 100);
  return clamp01(value);
}

function getOrderedSlides(details: SurveyCampaignDetails): SurveySlide[] {
  const slides = details.slides || [];
  return [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getOrderedOptions(slide?: SurveySlide): string[] {
  const options = slide?.options || {};
  const keys = Object.keys(options);

  const parseIndex = (key: string): number | undefined => {
    const match = /(\d+)/.exec(key);
    if (!match) return undefined;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  keys.sort((a, b) => {
    const ai = parseIndex(a);
    const bi = parseIndex(b);

    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    return a.localeCompare(b);
  });

  return keys
    .map((key) => options[key])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

function getBulletLabel(optionListStyle: string | undefined, index: number): string | null {
  if (!optionListStyle) return null;

  if (optionListStyle === 'alphabet') {
    const start = 'A'.codePointAt(0) ?? 65;
    return String.fromCodePoint(start + (index % 26));
  }

  if (optionListStyle === 'number') {
    return String(index + 1);
  }

  return null;
}

function asNonNegativeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return undefined;
}

function getBorderWidthFromTextStyle(textStyle?: SurveyTextStyle): number {
  return asNonNegativeNumber(textStyle?.borderwidth) ?? 1;
}

interface SurveyResponsesMap {
  [slideId: string]: {
    option?: string;
    comment?: string;
  };
}

interface SurveyFormContentProps {
  details: SurveyCampaignDetails;
  slide: SurveySlide;
  appearance?: SurveyCampaignDetails['styling'] extends { appearance?: infer A } ? A : any;
  selectedOption: string | null;
  comment: string;
  onSelectOption: (option: string) => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const SurveyFormContent: React.FC<SurveyFormContentProps> = ({
  details,
  slide,
  appearance,
  selectedOption,
  comment,
  onSelectOption,
  onCommentChange,
  onSubmit,
  canSubmit,
}) => {
  const styling = details.styling || {};
  const optionsStyle = styling.options || {};
  const cta = styling.cta;

  const options = useMemo(() => getOrderedOptions(slide), [slide]);
  const optionRowGap = optionsStyle.optionsSpacing ?? 8;
  const bulletGap = optionsStyle.bulletSpacing ?? 10;
  const optionHeight = optionsStyle.optionsHeight ?? 44;

  const ctaAlign = getAlignment(cta?.container?.alignment);

  return (
    <>
      <div style={marginToStyle(styling.title?.textStyle?.margin)}>
        <div
          style={{
            ...(textStyleToCss(styling.title?.textStyle)),
            color: styling.title?.textStyle?.color || '#111827',
            fontSize: styling.title?.textStyle?.fontSize || 20,
            lineHeight: 1.3,
            fontWeight: styling.title?.textStyle?.fontDecoration?.includes('bold') ? 'bold' : 700,
          }}
        >
          {slide.title || slide.question || details.name || 'Survey'}
        </div>
      </div>

      {(slide.subtitle || styling.subtitle?.textStyle) && (
        <div style={marginToStyle(styling.subtitle?.textStyle?.margin)}>
          <div
            style={{
              ...(textStyleToCss(styling.subtitle?.textStyle)),
              color: styling.subtitle?.textStyle?.color || '#6b7280',
              fontSize: styling.subtitle?.textStyle?.fontSize || 14,
              lineHeight: 1.35,
            }}
          >
            {slide.subtitle || ''}
          </div>
        </div>
      )}

      {options.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: optionRowGap,
          }}
        >
          {options.map((option, index) => {
            const isActive = selectedOption === option;
            const styleSource = isActive ? optionsStyle.selectedOptions : optionsStyle.nonSelectedOptions;
            const borderWidth = getBorderWidthFromTextStyle(styleSource?.textStyle);
            const bulletLabel = getBulletLabel(optionsStyle.optionListStyle, index);

            return (
              <button
                key={`${option}-${index}`}
                onClick={() => onSelectOption(option)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: optionHeight,
                  borderRadius: getCornerRadius(optionsStyle.cornerRadius),
                  border: `${borderWidth}px solid ${styleSource?.colors?.border || '#e5e7eb'}`,
                  background: styleSource?.colors?.background || '#ffffff',
                  color: styleSource?.colors?.text || '#111827',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: bulletGap,
                  paddingLeft: 14,
                  paddingRight: 14,
                  textAlign: 'left',
                  ...(textStyleToCss(styleSource?.textStyle)),
                }}
                aria-pressed={isActive}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px solid ${styleSource?.colors?.border || '#111827'}`,
                    background: '#ffffff',
                    flex: '0 0 auto',
                    fontSize: 11,
                    fontWeight: 700,
                    color: styleSource?.colors?.text || '#111827',
                  }}
                >
                  {isActive ? '✓' : (bulletLabel || '')}
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {slide.additionalComment?.enabled && (
        <textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder={slide.additionalComment?.placeholder || ''}
          style={{
            marginTop: 10,
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 72,
            resize: 'none',
            overflowY: 'auto',
            border: `${getBorderWidthFromTextStyle(optionsStyle.additionalComments?.textStyle)}px solid ${optionsStyle.additionalComments?.colors?.border || '#e5e7eb'}`,
            background: optionsStyle.additionalComments?.colors?.background || '#ffffff',
            color: optionsStyle.additionalComments?.colors?.text || '#111827',
            borderRadius: 10,
            padding: '12px',
            ...(textStyleToCss(optionsStyle.additionalComments?.textStyle)),
          }}
        />
      )}

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 12,
          paddingTop: 10,
          paddingBottom: 6,
          background: appearance?.backgroundColor || '#ffffff',
        }}
      >
        <div
          style={{
            marginTop: cta?.margin?.top ?? 0,
            marginBottom: cta?.margin?.bottom ?? 0,
            marginLeft: cta?.margin?.left ?? 0,
            marginRight: cta?.margin?.right ?? 0,
            display: 'flex',
            justifyContent: ctaAlign,
          }}
        >
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              width: cta?.container?.ctaFullWidth ? '100%' : (cta?.container?.ctaWidth ?? '100%'),
              height: cta?.container?.height ?? 44,
              border: `${cta?.container?.borderWidth ?? 0}px solid ${cta?.container?.borderColor || 'transparent'}`,
              background: cta?.container?.backgroundColor || '#111827',
              color: cta?.text?.color || '#ffffff',
              borderRadius: getCornerRadius(cta?.cornerRadius),
              fontFamily: applyFontFamily(cta?.text?.fontFamily),
              fontSize: cta?.text?.fontSize || 14,
              fontWeight: cta?.text?.fontDecoration?.includes('bold') ? 'bold' : 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.6,
              padding: '0 16px',
            }}
          >
            {slide.submitButtonText || 'Submit'}
          </button>
        </div>
      </div>
    </>
  );
};

interface SurveyThankYouContentProps {
  details: SurveyCampaignDetails;
  onDone: () => void;
}

const SurveyThankYouContent: React.FC<SurveyThankYouContentProps> = ({ details, onDone }) => {
  const styling = details.styling || {};
  const thankyouPage = styling.thankyouPage || {};

  const cta = thankyouPage.cta;
  const ctaAlign = getAlignment(cta?.container?.alignment);

  return (
    <>
      {details.thankYouImage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <img
            src={details.thankYouImage}
            alt="thank you"
            style={{
              width: thankyouPage.imageStyle?.width || 80,
              height: thankyouPage.imageStyle?.height || 80,
              objectFit: 'cover',
              borderRadius: 10,
            }}
          />
        </div>
      )}

      <div style={{ ...marginToStyle(thankyouPage.title?.textStyle?.margin) }}>
        <div
          style={{
            ...(textStyleToCss(thankyouPage.title?.textStyle)),
            color: thankyouPage.title?.textStyle?.color || '#111827',
            fontSize: thankyouPage.title?.textStyle?.fontSize || 20,
            lineHeight: 1.3,
            fontWeight: thankyouPage.title?.textStyle?.fontDecoration?.includes('bold') ? 'bold' : 700,
          }}
        >
          {details.thankYouTitle || 'Thank you'}
        </div>
      </div>

      <div style={{ ...marginToStyle(thankyouPage.subtitle?.textStyle?.margin) }}>
        <div
          style={{
            ...(textStyleToCss(thankyouPage.subtitle?.textStyle)),
            color: thankyouPage.subtitle?.textStyle?.color || '#6b7280',
            fontSize: thankyouPage.subtitle?.textStyle?.fontSize || 14,
            lineHeight: 1.35,
          }}
        >
          {details.thankYouText || ''}
        </div>
      </div>

      {(details.thankYouButtonText || cta) && (
        <div
          style={{
            marginTop: cta?.margin?.top ?? 14,
            marginBottom: cta?.margin?.bottom ?? 0,
            marginLeft: cta?.margin?.left ?? 0,
            marginRight: cta?.margin?.right ?? 0,
            display: 'flex',
            justifyContent: ctaAlign,
          }}
        >
          <button
            onClick={onDone}
            style={{
              width: cta?.container?.ctaFullWidth ? '100%' : (cta?.container?.ctaWidth ?? 'auto'),
              height: cta?.container?.height ?? 40,
              border: `${cta?.container?.borderWidth ?? 0}px solid ${cta?.container?.borderColor || 'transparent'}`,
              background: cta?.container?.backgroundColor || '#111827',
              color: cta?.text?.color || '#ffffff',
              borderRadius: getCornerRadius(cta?.cornerRadius),
              fontFamily: applyFontFamily(cta?.text?.fontFamily),
              fontSize: cta?.text?.fontSize || 14,
              fontWeight: cta?.text?.fontDecoration?.includes('bold') ? 'bold' : 600,
              cursor: 'pointer',
              padding: '0 16px',
            }}
          >
            {details.thankYouButtonText || 'Done'}
          </button>
        </div>
      )}
    </>
  );
};

export const Survey: React.FC = () => {
  const data = useCampaigns<CampaignSurvey>('SUR');
  const sdkVisible = useAppStorysStore((state: any) => state.isVisible);

  const [isDismissed, setIsDismissed] = useState(false);
  const [canDisplay, setCanDisplay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [responses, setResponses] = useState<SurveyResponsesMap>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!data) return;

    setIsDismissed(false);
    setCanDisplay(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setComment('');
    setResponses({});
    setIsSubmitted(false);

    const delay = data.details?.styling?.appearance?.displayDelay ?? 0;
    const timeoutId = globalThis.setTimeout(() => {
      setCanDisplay(true);
      void trackEvent('viewed', data.id);
    }, Math.max(0, delay) * 1000);

    return () => globalThis.clearTimeout(timeoutId);
  }, [data]);

  const slides = useMemo(() => (data ? getOrderedSlides(data.details) : []), [data]);
  const slide = slides[currentIndex];

  useEffect(() => {
    if (!slide) return;
    const existing = responses[slide.id];
    setSelectedOption(existing?.option ?? null);
    setComment(existing?.comment ?? '');
  }, [slide?.id]);

  if (!data || !sdkVisible || isDismissed || !canDisplay) return null;

  const details: SurveyCampaignDetails = data.details;
  const styling = details.styling || {};
  const appearance = styling.appearance || {};

  const backdropColor = appearance.backdropColor || '#000000';
  const backdropOpacity = normalizeBackdropOpacity(appearance.backdropOpacity);

  const handleSelectOption = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };

  const submitSurvey = async (finalResponses: SurveyResponsesMap, finalSlideId: string) => {
    const responsesArray = slides.map((s) => ({
      slide_id: s.id,
      order: s.order,
      title: s.title,
      question: s.question,
      selected_option: finalResponses[s.id]?.option,
      comment: finalResponses[s.id]?.comment,
    }));

    void trackEvent('survey captured', data.id, {
      campaign_type: 'SUR',
      survey_id: details.id,
      final_slide_id: finalSlideId,
      responses: responsesArray,
    });

    const shouldShowThankYou = styling.content?.isThankyouPage !== false;
    if (shouldShowThankYou) {
      setIsSubmitted(true);
    } else {
      setIsDismissed(true);
    }
  };

  const handleSubmitCurrent = async () => {
    if (!slide) return;
    if (!selectedOption) return;

    const nextResponses: SurveyResponsesMap = {
      ...responses,
      [slide.id]: {
        option: selectedOption,
        comment,
      },
    };

    setResponses(nextResponses);

    const rules = slide.logic || [];
    const matchedRule = rules.find((rule) =>
      (rule.selectOption || []).includes(selectedOption)
    );

    if (matchedRule?.redirectTo === 'thank-you') {
      await submitSurvey(nextResponses, slide.id);
      return;
    }

    const isLastSlide = currentIndex >= slides.length - 1;
    if (isLastSlide) {
      await submitSurvey(nextResponses, slide.id);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handleDone = () => {
    const config = details.thankYouButtonConfig;
    if (config?.enabled && config.action === 'redirect' && config.redirectUrl) {
      globalThis.open(config.redirectUrl, '_blank');
    }
    setIsDismissed(true);
  };

  if (!slide) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 12,
        pointerEvents: 'none',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: hexToRgba(backdropColor, backdropOpacity),
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 'min(420px, 92vw)',
          maxWidth: '92vw',
          minWidth: '320px',
          maxHeight: '80vh',
          overflow: 'hidden',
          backgroundColor: appearance.backgroundColor || '#ffffff',
          borderRadius: getCornerRadius(appearance.cornerRadius),
          boxSizing: 'border-box',
          paddingTop: 14,
          paddingRight: 16,
          paddingBottom: 10,
          paddingLeft: 16,
          pointerEvents: 'auto',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>
          {`
            .appstorys-survey-scroll {
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE/Edge */
            }
            .appstorys-survey-scroll::-webkit-scrollbar {
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
          className="appstorys-survey-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: 2,
          }}
        >
          {isSubmitted ? (
            <SurveyThankYouContent details={details} onDone={handleDone} />
          ) : (
            <SurveyFormContent
              details={details}
              slide={slide}
              appearance={appearance}
              selectedOption={selectedOption}
              comment={comment}
              onSelectOption={handleSelectOption}
              onCommentChange={setComment}
              onSubmit={handleSubmitCurrent}
              canSubmit={selectedOption != null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Survey;
