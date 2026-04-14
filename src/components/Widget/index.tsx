import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CampaignWidget } from '../../types';
import useCampaigns from '../../hooks/useCampaigns';
import trackEvent from '../../core/trackEvent';

interface WidgetProps {
  position?: string;
}

/**
 * Simple web widget component mirroring RN Widgets.tsx implementation
 * - Accepts optional position prop
 * - Fetches single campaign via useCampaigns hook
 * - Renders carousel with auto-advance (full) or manual scroll (half)
 * - Portals into host element if position target found
 */
export const Widget: React.FC<WidgetProps> = ({ position }) => {
  const data = useCampaigns<CampaignWidget>('WID', { position });
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Derived values (must be declared unconditionally so hooks stay stable)
  const details = data?.details || ({} as any);
  const images = (details.widget_images || []) as any[];
  const styling = details.styling || {};
  const widgetType = details.type || 'full';
  const isHalf = widgetType === 'half';

  // Track widget impression (safe when `data` is undefined)
  useEffect(() => {
    if (!data?.id) return;
    void trackEvent('widget_viewed', data.id);
  }, [data?.id]);

  // Auto-advance full widgets every 5 seconds
  useEffect(() => {
    if (widgetType === 'full' && images.length > 1) {
      autoAdvanceRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= images.length ? 0 : next;
        });
      }, 5000);

      return () => {
        if (autoAdvanceRef.current) {
          clearInterval(autoAdvanceRef.current as any);
        }
      };
    }
    return undefined;
  }, [widgetType, images.length]);

  const handleClick = (imageId: string, link: string) => {
    if (data?.id) void trackEvent('clicked', data.id, { widget_image: imageId });
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        console.log('[Widget] Internal link:', link);
      }
    }
  };

  const handleScroll = () => {
    if (containerRef.current && isHalf) {
      const { scrollLeft, offsetWidth } = containerRef.current;
      const itemWidth = (offsetWidth / 2) + 12;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(index);
    }
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: isHalf ? 'nowrap' : 'wrap',
    gap: '12px',
    width: '100%',
    height: isHalf && details.height ? `${details.height}px` : 'auto',
    marginTop: styling.topMargin ? `${styling.topMargin}px` : '0px',
    marginBottom: styling.bottomMargin ? `${styling.bottomMargin}px` : '0px',
    marginLeft: styling.leftMargin ? `${styling.leftMargin}px` : '0px',
    marginRight: styling.rightMargin ? `${styling.rightMargin}px` : '0px',
    boxSizing: 'border-box',
    overflowX: isHalf ? 'auto' : 'hidden',
    overflowY: 'hidden',
    scrollSnapType: isHalf ? 'x mandatory' : undefined,
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  // Item styles
  const getItemStyle = (index: number): React.CSSProperties => ({
    flex: isHalf ? '0 0 calc(50% - 6px)' : '0 0 100%',
    height: isHalf && details.height ? `${details.height}px` : 'auto',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: styling.borderRadius ? `${styling.borderRadius}px` : '0px',
    borderTopLeftRadius: styling.topLeftRadius ? `${styling.topLeftRadius}px` : undefined,
    borderTopRightRadius: styling.topRightRadius ? `${styling.topRightRadius}px` : undefined,
    borderBottomLeftRadius: styling.bottomLeftRadius ? `${styling.bottomLeftRadius}px` : undefined,
    borderBottomRightRadius: styling.bottomRightRadius ? `${styling.bottomRightRadius}px` : undefined,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    scrollSnapAlign: 'start',
  });

  // Render content
  const content = (
    <div style={{ width: '100%', position: 'relative' }}>
      <style>{`
        .widget-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Carousel/grid container */}
      <div
        ref={containerRef}
        className="widget-scroll-container"
        style={containerStyle}
        onScroll={handleScroll}
      >
        {isHalf
          ? // Half: show all images (2 per row with horizontal scroll)
            images.map((img: any, idx: number) => (
              <div key={img.id} style={getItemStyle(idx)}>
                <img
                  src={img.image}
                  alt="widget"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onClick={() => handleClick(img.id, img.link)}
                />
              </div>
            ))
          : // Full: show only current slide (auto-advances)
            images.length > 0 && (
              <div key={`slide-${activeIndex}`} style={getItemStyle(0)}>
                <img
                  src={images[activeIndex].image}
                  alt="widget"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onClick={() => handleClick(images[activeIndex].id, images[activeIndex].link)}
                />
              </div>
            )}
      </div>

      {/* Dots indicator for full widgets */}
      {widgetType === 'full' && images.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '8px',
          width: '100%'
        }}>
          {images.map((_: any, i: number) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i === activeIndex ? '#333' : '#ccc',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Try to find host element if position is declared (mirror RN behavior)
  let target: Element | null = null;
  if (data?.position) {
    const key = String(data.position || '').replace(/^widget_/, '');
    const selectors = [
      `[data-as-id="${key}"]`,
      `#${key}`,
      `.${key}`,
      `[data-widget="${key}"]`,
    ];

    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          target = el;
          console.log('[Widget] Portal target found:', sel, 'for campaign', data?.id);
          break;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!target) {
      console.log('[Widget] No portal target found for position:', data?.position, 'rendering inline for campaign:', data?.id);
    }
  }

  // Portal into host if found, otherwise render inline
  if (target) {
    return createPortal(content, target);
  }

  return content;
};

export default Widget;
