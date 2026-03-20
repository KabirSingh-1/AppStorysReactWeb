import React from 'react';
import { tooltipPositions } from '../constants/tooltipPositions';

const elementDescriptions: { [key: string]: string } = {
  'track-screen-button': 'AppStorys Logo',
  'custom-touchable-button': 'Book a Demo Button',
  'touchable-text': 'Login Link',
  'main-text-input': 'Main Text Input / Hero CTA',
  'notification-toggle-switch': 'Toggle Switch',
  'switch-label-text': 'Switch Label Text',
  'card-title': 'Card Title',
  'card-description': 'Card Description',
  'information-card': 'Feature Information Card',
  'red-tag': 'Red Tag Badge',
  'teal-tag': 'Teal Tag Badge',
  'blue-tag': 'Blue Tag Badge',
  'red-tag-text': 'Red Tag Text',
  'teal-tag-text': 'Teal Tag Text',
  'blue-tag-text': 'Blue Tag Text',
  'tags-wrapper': 'Tags Wrapper',
  'placeholder-content': 'Placeholder Content',
  'dashed-border-view': 'Dashed Border View',
  'like-heart-icon': 'Like Heart Icon',
  'like-icon-circle': 'Like Icon Circle',
  'like-button-label': 'Like Button Label',
  'like-button': 'Like Button',
  'share-arrow-icon': 'Share Arrow Icon',
  'share-icon-circle': 'Share Icon Circle',
  'share-button-label': 'Share Button Label',
  'share-button': 'Share Button',
  'save-bookmark-icon': 'Save Bookmark Icon',
  'save-icon-circle': 'Save Icon Circle',
  'save-button-label': 'Save Button Label',
  'save-button': 'Save Button',
  'icon-buttons-row': 'Icon Buttons Row',
  'warning-message': 'Warning Message',
  'warning-notification': 'Warning Notification',
  'controls-container': 'Controls Container',
  'switch-container': 'Switch Container',
  'footer-placeholder': 'Footer Placeholder',
  'bottom-spacer': 'Bottom Spacer'
};

export const TooltipCanvas: React.FC = () => {
  const container = tooltipPositions.find(p => p.id === 'container') || { width: 1080, height: 2958, x: 0, y: 0 };
  const items = tooltipPositions.filter(p => p.id !== 'container');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#111827', // Dark theme for contrast
        boxSizing: 'border-box',
        zIndex: 500
      }}
    >
      <div style={{ position: 'relative', width: `${container.width}px`, height: `${container.height}px`, margin: '0 auto' }}>
        {items.map((item) => {
          const description = elementDescriptions[item.id];
          return (
            <div
              key={item.id}
              id={item.id}
              data-id={item.id}
              style={{
                position: 'absolute',
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                border: '1px dashed #FE6B35', // Highlight borders
                borderColor: item.id.includes('container') || item.id.includes('wrapper') ? '#6366F1' : '#FE6B35',
                backgroundColor: item.id.includes('button') ? 'rgba(254, 107, 53, 0.05)' : 'rgba(99, 102, 241, 0.02)',
                borderRadius: '4px',
                color: '#F9FAFB',
                fontSize: '11px',
                fontWeight: 500,
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                backgroundColor: 'rgba(17, 24, 39, 0.85)',
                padding: '2px 6px',
                borderRadius: '3px',
                pointerEvents: 'none',
                maxWidth: '95%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                border: '0.5px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span style={{ fontWeight: 600 }}>{item.id}</span>
                {description && (
                  <span style={{ color: '#9CA3AF', fontSize: '9px', marginLeft: '5px' }}>
                    ({description})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TooltipCanvas;
