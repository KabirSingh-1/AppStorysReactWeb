import React from 'react';
import { CampaignWidget } from '../../types';
import useAppStorysStore from '../../core/store';
import useCampaigns from '../../hooks/useCampaigns';
import trackEvent from '../../core/trackEvent';

export const Widget: React.FC = () => {
  const data = useCampaigns<CampaignWidget>('WID');
  const sdkVisible = useAppStorysStore((state) => state.isVisible);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (data) {
      void trackEvent('widget_viewed', data.id);
    }
  }, [data]);

  if (!data || !data.details || !sdkVisible) return null;

  const { details } = data;
  const styling = details.styling || {};
  const images = details.widget_images || [];

  const widgetType = details.type || styling.type || 'full';
  const isHalf = widgetType === 'half';
  
  const showCarousel = isHalf ? images.length > 2 : images.length > 1;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: showCarousel ? 'nowrap' : 'wrap',
    gap: '12px',
    width: '100%',
    height: isHalf ? (details.height ? `${details.height}px` : 'auto') : 'auto',
    marginTop: styling.topMargin ? `${styling.topMargin}px` : '0px',
    marginBottom: styling.bottomMargin ? `${styling.bottomMargin}px` : '0px',
    marginLeft: styling.leftMargin ? `${styling.leftMargin}px` : '8px',
    marginRight: styling.rightMargin ? `${styling.rightMargin}px` : '8px',
    boxSizing: 'border-box',
    overflowX: showCarousel ? 'auto' : 'hidden',
    overflowY: 'hidden',
    scrollSnapType: showCarousel ? 'x mandatory' : undefined,
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, offsetWidth } = containerRef.current;
      const itemWidth = isHalf ? (offsetWidth / 2) + 6 : offsetWidth + 12; // account for half width and spacing gap
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(index);
    }
  };

  const handleClick = (imageId: string, link: string) => {
    void trackEvent('widget_clicked', data.id, { image_id: imageId });
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        console.log('Internal link:', link);
      }
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <style>{`
        .widget-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div 
        ref={containerRef}
        className="widget-scroll-container"
        style={containerStyle}
        onScroll={showCarousel ? handleScroll : undefined}
      >
        {images.map((img) => {
          const itemStyle: React.CSSProperties = {
            flex: isHalf ? '0 0 calc(50% - 6px)' : '0 0 100%',
            height: isHalf ? '100%' : 'auto',
            cursor: img.link ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: styling.borderRadius ? `${styling.borderRadius}px` : '0px',
            borderTopLeftRadius: styling.topLeftRadius ? `${styling.topLeftRadius}px` : undefined,
            borderTopRightRadius: styling.topRightRadius ? `${styling.topRightRadius}px` : undefined,
            borderBottomLeftRadius: styling.bottomLeftRadius ? `${styling.bottomLeftRadius}px` : undefined,
            borderBottomRightRadius: styling.bottomRightRadius ? `${styling.bottomRightRadius}px` : undefined,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            scrollSnapAlign: 'start',
          };

          const imgStyle: React.CSSProperties = {
            width: '100%',
            height: isHalf ? '100%' : 'auto',
            objectFit: 'cover',
            display: 'block',
          };

          const imageUrl = img.image.startsWith('https://appstorysmediabucketdev.s3.ap-south-1.amazonaws.com/https://')
            ? img.image.replace('https://appstorysmediabucketdev.s3.ap-south-1.amazonaws.com/https://', 'https://')
            : img.image;

          return (
            <div 
              key={img.id} 
              style={itemStyle} 
              onClick={() => handleClick(img.id, img.link)}
            >
              <img 
                src={imageUrl} 
                alt={`Widget item`} 
                style={imgStyle} 
              />
            </div>
          );
        })}
      </div>

      {showCarousel && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '8px',
          width: '100%'
        }}>
          {images.map((_, i) => (
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
};
