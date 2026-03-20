import React, { useState } from 'react';
import { PromoCodeStickerData, StickerProps } from './types';

export const PromoCodeSticker: React.FC<StickerProps<PromoCodeStickerData>> = ({
  data,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data.code) {
      navigator.clipboard.writeText(data.code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const styling = data.styling || {};
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: styling.shadow || '0 8px 24px rgba(0,0,0,0.06)',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    border: styling.borderColor ? `1px solid ${styling.borderColor}` : 'none',
  };

  const titleStyle: React.CSSProperties = {
    color: '#1A202C',
    fontWeight: '800',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
    width: '100%',
    textAlign: 'left',
    marginBottom: '2px'
  };

  const ticketStyle: React.CSSProperties = {
     border: '2px dashed #CBD5E0',
     borderRadius: '14px',
     padding: '14px 18px',
     width: '100%',
     boxSizing: 'border-box',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'space-between',
     backgroundColor: '#FFFFFF',
     position: 'relative',
     cursor: 'pointer'
  };

  const iconStyle: React.CSSProperties = {
     width: '40px',
     height: '40px',
     borderRadius: '10px',
     backgroundColor: '#F7FAFC',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     fontSize: '18px'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Promo Code</div>
      <div style={ticketStyle} onClick={handleCopy}>
         
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={iconStyle}>🏷️</div>
            <span style={{ fontSize: `${styling.fontSize || 16}px`, fontWeight: '800', color: '#2D3748', letterSpacing: '1px' }}>{data.code || 'CODE20'}</span>
         </div>

         <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {copied && <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Copied!</span>}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
               </svg>
            </button>
         </div>

      </div>
    </div>
  );
};
