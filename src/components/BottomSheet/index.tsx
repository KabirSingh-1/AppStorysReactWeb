import React, { useEffect, useState } from 'react';
import useCampaigns from '../../hooks/useCampaigns';
import useAppStorysStore from '../../core/store';
import trackEvent from '../../core/trackEvent';
import { CampaignBottomSheet, BottomSheetElement } from '../../types';
import CrossButton from '../common/CommonElements/CrossButton';

export const BottomSheet: React.FC = () => {
  const data = useCampaigns<CampaignBottomSheet>('BTS');
  const sdkVisible = useAppStorysStore((state: any) => state.isVisible);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (data) {
      setIsDismissed(false);
      void trackEvent('bottomsheet_viewed', data.id);
    }
  }, [data]);

  if (!data || isDismissed || !sdkVisible) return null;

  const { details } = data;
  const elements = details.elements || [];
  const sortedElements = [...elements].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Determine opacity: if it's high (>1), treat as percentage
  let opacity = details.backdropOpacity ?? 0.5;
  if (opacity > 1) {
    opacity = opacity / 100;
  }

  const renderElement = (element: BottomSheetElement) => {
    switch (element.type) {
      case 'image': {
        const imgStyle: React.CSSProperties = {
          width: '100%',
          display: 'block',
          objectFit: 'contain',
          backgroundColor: element.imageBackgroundColor || 'transparent',
          paddingBottom: element.paddingBottom ?? 0,
          paddingLeft: element.paddingLeft ?? 0,
          paddingRight: element.paddingRight ?? 0,
          paddingTop: element.paddingTop ?? 0,
          cursor: element.imageLink ? 'pointer' : 'default',
        };
        return (
          <div key={element.id} style={{ textAlign: element.alignment || 'left', width: '100%' }}>
            {element.url && (
              <img 
                src={element.url} 
                alt="" 
                style={imgStyle} 
                onClick={() => {
                  if (element.imageLink) window.open(element.imageLink, '_blank');
                }}
              />
            )}
          </div>
        );
      }

      case 'cta': {
        const ctaData = element.cta || {};
        const container = ctaData.container || {};
        const cornerRadius = ctaData.cornerRadius || {};
        const margin = ctaData.margin || {};
        const textStyle = ctaData.text || {};

        return (
          <div 
            key={element.id}
            style={{
              display: 'flex',
              justifyContent: container.alignment === 'center' ? 'center' : container.alignment === 'right' ? 'flex-end' : 'flex-start',
              width: '100%',
              marginTop: margin.top ?? 0,
              marginBottom: margin.bottom ?? 0,
              marginLeft: margin.left ?? 0,
              marginRight: margin.right ?? 0,
            }}
          >
            <button
              style={{
                width: container.ctaFullWidth ? '100%' : container.ctaWidth || 'auto',
                height: container.height || 45,
                backgroundColor: container.ctaBoxColor || container.backgroundColor || '#FE6B35',
                color: textStyle.color || '#ffffff',
                border: `${container.borderWidth || 0}px solid ${container.borderColor || 'transparent'}`,
                borderRadius: `${cornerRadius.topLeft ?? 12}px ${cornerRadius.topRight ?? 12}px ${cornerRadius.bottomRight ?? 12}px ${cornerRadius.bottomLeft ?? 12}px`,
                fontSize: textStyle.fontSize || 14,
                fontFamily: textStyle.fontFamily || 'Arial',
                fontWeight: textStyle.fontDecoration?.includes('bold') ? 'bold' : 'normal',
                fontStyle: textStyle.fontDecoration?.includes('italic') ? 'italic' : 'normal',
                textDecoration: textStyle.fontDecoration?.includes('underline') ? 'underline' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
              }}
              onClick={() => {
                const link = element.ctaLink || element.url;
                if (link) window.open(link, '_blank');
              }}
            >
              {element.ctaText || 'Button'}
            </button>
          </div>
        );
      }

      case 'body': {
        const titleStyle = element.titleFontStyle || {};
        const descStyle = element.descriptionFontStyle || {};
        
        return (
          <div 
            key={element.id}
            style={{
              width: '100%',
              backgroundColor: element.bodyBackgroundColor || 'transparent',
              marginTop: element.marginTop ?? 0,
              marginBottom: element.marginBottom ?? 20,
              marginLeft: element.marginLeft ?? 4,
              marginRight: element.marginRight ?? 4,
            }}
          >
            {element.titleText && (
              <div style={{
                color: titleStyle.colour || '#000000',
                fontSize: titleStyle.fontSize ? `${titleStyle.fontSize}px` : element.titleFontSize ? `${element.titleFontSize}px` : '16px',
                fontFamily: titleStyle.fontFamily || 'inherit',
                textAlign: titleStyle.alignment || 'left',
                lineHeight: element.titleLineHeight || 1.2,
                fontWeight: titleStyle.decoration?.includes('bold') ? 'bold' : '600',
                fontStyle: titleStyle.decoration?.includes('italic') ? 'italic' : 'normal',
                textDecoration: titleStyle.decoration?.includes('underline') ? 'underline' : 'none',
                marginBottom: element.spacingBetweenTitleDesc ?? 4,
              }}>
                {element.titleText}
              </div>
            )}
            
            {element.descriptionText && (
              <div style={{
                color: descStyle.colour || '#000000',
                fontSize: descStyle.fontSize ? `${descStyle.fontSize}px` : element.descriptionFontSize ? `${element.descriptionFontSize}px` : '14px',
                fontFamily: descStyle.fontFamily || 'inherit',
                textAlign: descStyle.alignment || 'left',
                lineHeight: element.descriptionLineHeight || 1.5,
                fontWeight: descStyle.decoration?.includes('bold') ? 'bold' : 'normal',
                fontStyle: descStyle.decoration?.includes('italic') ? 'italic' : 'normal',
                textDecoration: descStyle.decoration?.includes('underline') ? 'underline' : 'none',
              }}>
                {element.descriptionText}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: details.backdropColor || 'rgba(0,0,0,0.5)',
          opacity: opacity,
          zIndex: 999998,
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => setIsDismissed(true)}
      />
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '500px', // Responsive safety
          backgroundColor: details.backgroundColor || '#FFFFFF',
          borderTopLeftRadius: `${details.cornerRadius?.topLeft ?? 16}px`,
          borderTopRightRadius: `${details.cornerRadius?.topRight ?? 16}px`,
          borderBottomLeftRadius: `${details.cornerRadius?.bottomLeft ?? 0}px`,
          borderBottomRightRadius: `${details.cornerRadius?.bottomRight ?? 0}px`,
          zIndex: 999999,
          padding: '24px 16px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.15)',
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div style={{
          width: '40px',
          height: '5px',
          backgroundColor: '#E0E0E0',
          borderRadius: '2.5px',
          marginBottom: '16px',
          cursor: 'pointer'
        }} onClick={() => setIsDismissed(true)} />

        {details.crossButton?.enabled && (
            <CrossButton 
              config={details.crossButton}
              onPress={() => setIsDismissed(true)}
              style={{
                top: details.crossButton?.margin?.top ?? 12,
                right: details.crossButton?.margin?.right ?? 12,
              }}
            />
        )}
        
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedElements.map(renderElement)}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
