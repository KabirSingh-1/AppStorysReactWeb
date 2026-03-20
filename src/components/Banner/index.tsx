import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { CampaignBanner } from '../../types';
import useAppStorysStore from '../../core/store';
import useCampaigns from '../../hooks/useCampaigns';
import trackEvent from '../../core/trackEvent';

export const Banner: React.FC = () => {
  const data = useCampaigns<CampaignBanner>('BAN');
  const sdkVisible = useAppStorysStore((state) => state.isVisible);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lottieData, setLottieData] = useState<any>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (data) {
      setIsDismissed(false);
      void trackEvent('viewed', data.id);

      // Fetch Lottie data if available
      if (data.details.lottie_data) {
        fetch(data.details.lottie_data)
          .then(res => res.json())
          .then(json => {
            setLottieData(json);
            if (json.w && json.h) {
              setAspectRatio(json.h / json.w);
            }
          })
          .catch(err => console.error('Error loading Lottie:', err));
      }
    }
  }, [data]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [data, isDismissed]);

  if (!data || isDismissed || !sdkVisible) return null;

  const { details } = data;
  const styling = details.styling || {};
  
  // Calculate height based on aspect ratio or fixed height
  let calculatedHeight: string | number = details.height || 'auto';
  if (aspectRatio && containerWidth) {
    calculatedHeight = containerWidth * aspectRatio;
  }

  const bannerStyle: React.CSSProperties = {
    position: 'fixed' as const,
    left: styling.marginLeft ? `${styling.marginLeft}px` : '10px',
    right: styling.marginRight ? `${styling.marginRight}px` : '10px',
    bottom: styling.marginBottom ? `${styling.marginBottom}px` : '10px',
    backgroundColor: 'transparent',
    borderRadius: `${styling.topRightRadius || 0}px ${styling.topLeftRadius || 0}px ${styling.bottomRightRadius || 0}px ${styling.bottomLeftRadius || 0}px`,
    overflow: 'hidden',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: details.link ? 'pointer' : 'default',
  };

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: typeof calculatedHeight === 'number' ? `${calculatedHeight}px` : calculatedHeight,
    display: 'block',
    objectFit: 'cover',
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    void trackEvent('banner_closed', data.id);
  };

  const handleClick = () => {
    if (details.link) {
      void trackEvent('clicked', data.id);
      if (details.link.startsWith('http')) {
        window.open(details.link, '_blank');
      } else {
        // This would ideally call a global handler, but for now:
        console.log('Internal link:', details.link);
      }
    }
  };

  return (
    <div ref={containerRef} style={bannerStyle} onClick={handleClick}>
      {lottieData ? (() => {
        const LottieComp = (Lottie as any).default || Lottie;
        return (
          <LottieComp 
            animationData={lottieData} 
            loop={true} 
            autoplay={sdkVisible}
            style={mediaStyle}
          />
        );
      })() : details.image ? (
        <img src={details.image} alt="Campaign Banner" style={mediaStyle} />
      ) : null}
      
      {styling.crossButton?.enabled && (
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'rgba(0,0,0,0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            lineHeight: '22px',
            textAlign: 'center',
            cursor: 'pointer',
            padding: '0',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
