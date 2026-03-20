import React, { useState, useEffect } from 'react';
import { CountdownStickerData, StickerProps } from './types';

export const CountdownSticker: React.FC<StickerProps<CountdownStickerData>> = ({
  data,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!data.targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(data.targetDate) - +new Date();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      } else {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); 
    return () => clearInterval(timer);
  }, [data.targetDate]);

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
    alignItems: 'flex-start',
    gap: '12px',
    border: styling.borderColor ? `1px solid ${styling.borderColor}` : 'none',
  };

  const titleStyle: React.CSSProperties = {
    color: '#1A202C',
    fontWeight: '800',
    fontSize: `${styling.fontSize ? styling.fontSize + 2 : 16}px`,
  };

  const timerGridStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    width: '100%',
    justifyContent: 'flex-start'
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '42px',
    boxSizing: 'border-box'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: `${styling.fontSize || 16}px`,
    fontWeight: '700',
    color: '#1A202C'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#A0AEC0',
    marginTop: '4px',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{data.title || 'Ends in...'}</div>
      <div style={timerGridStyle}>
        <div style={boxStyle}>
          <span style={valueStyle}>{timeLeft.days}</span>
          <span style={labelStyle}>days</span>
        </div>
        <div style={boxStyle}>
          <span style={valueStyle}>{timeLeft.hours}</span>
          <span style={labelStyle}>hrs</span>
        </div>
        <div style={boxStyle}>
          <span style={valueStyle}>{timeLeft.minutes}</span>
          <span style={labelStyle}>min</span>
        </div>
        <div style={boxStyle}>
          <span style={valueStyle}>{timeLeft.seconds}</span>
          <span style={labelStyle}>sec</span>
        </div>
      </div>
    </div>
  );
};
