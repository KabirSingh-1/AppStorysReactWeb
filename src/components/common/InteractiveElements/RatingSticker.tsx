import React, { useState, useRef, useEffect } from 'react';
import { RatingStickerData, StickerProps } from './types';

export const RatingSticker: React.FC<StickerProps<RatingStickerData>> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const maxRating = data.maxRating || 5;
  const currentRating = data.currentRating ?? Math.floor(maxRating / 2);
  const [val, setVal] = useState(currentRating);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const defaults = {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 24,
    titleColor: '#000000',
    titleFontSize: 24,
    sliderTrackColor: '#F3F4F6',
    sliderFillColor: '#F97316',
    emojiSize: 42,
  };

  const styling = data.styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: styling.backgroundColor || defaults.backgroundColor,
    borderRadius: `${styling.borderRadius ?? defaults.borderRadius}px`,
    padding: `${styling.padding ?? defaults.padding}px`,
    boxShadow: styling.shadow || '0 12px 30px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    cursor: 'default',
    opacity: styling.opacity ?? 1,
  };

  const titleStyle: React.CSSProperties = {
    color: styling.titleColor || defaults.titleColor,
    fontWeight: '900',
    fontSize: `${styling.titleFontSize || defaults.titleFontSize}px`,
    margin: '0',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    width: '100%',
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: '18px',
    backgroundColor: styling.sliderTrackColor || defaults.sliderTrackColor,
    borderRadius: '100px',
    position: 'relative',
    cursor: isEditing ? 'default' : 'pointer',
    marginTop: '24px', 
    marginBottom: '8px',
    userSelect: 'none',
  };

  const percentage = (val / maxRating) * 100;

  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    background: styling.sliderFillColor || 'linear-gradient(90deg, #FF4582, #e11d48)',
    borderRadius: '100px',
    transition: isDragging ? 'none' : 'width 0.1s ease',
  };

  const emojiSize = styling.emojiSize || defaults.emojiSize;
  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    left: `calc(${percentage}% - ${emojiSize / 2}px)`,
    top: `-${emojiSize / 4}px`, 
    fontSize: `${emojiSize}px`,
    userSelect: 'none',
    cursor: 'grab',
    transition: isDragging ? 'none' : 'left 0.1s ease',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
  };

  const handleDrag = (clientX: number) => {
    if (!sliderTrackRef.current || isEditing) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const ratio = offsetX / rect.width;
    const computedVal = Math.round(ratio * maxRating * 10) / 10; // high precision, or snap: Math.round(ratio * maxRating)
    setVal(computedVal);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDrag(e.clientX);
    };

    const onMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onInteraction?.({
          type: 'rating',
          ratingId: data.id,
          value: val,
          stickerId: data.id
        });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) handleDrag(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging, val]);

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{data.title || 'Do you like my space?'}</h3>
      <div
        ref={sliderTrackRef}
        style={trackStyle}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div style={fillStyle} />
        <div style={thumbStyle} className="interactive-emoji-thumb">
          {data.emoji || '😍'}
        </div>
      </div>
    </div>
  );
};
