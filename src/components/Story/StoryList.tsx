import React from 'react';
import { Story as StoryType } from '../../types';

interface StoryListProps {
  stories: StoryType[];
  viewedStories: string[];
  onStoryClick: (index: number) => void;
}

export const StoryList: React.FC<StoryListProps> = ({ stories, viewedStories, onStoryClick }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '18px',
      padding: '16px 20px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      justifyContent: 'flex-start'
    }}>
      {stories.sort((a, b) => a.order - b.order).map((story, index) => {
        const styling = story.styling || {};
        const size = styling.size || 80;
        const ringWidth = styling.ringWidth || 3;
        const isViewed = viewedStories.includes(story.id);
        const ringColor = isViewed ? '#E5E7EB' : (story.ringColor || '#FF0000');
        const nameColor = story.nameColor || '#333333';
        const cornerRadius = styling.cornerRadius;
        const borderRadiusStr = cornerRadius 
          ? `${cornerRadius.topLeft || 0}px ${cornerRadius.topRight || 0}px ${cornerRadius.bottomRight || 0}px ${cornerRadius.bottomLeft || 0}px` 
          : '50%';
        const imgBorderRadiusStr = cornerRadius 
          ? `${Math.max(0, (cornerRadius.topLeft || 0) - 3)}px ${Math.max(0, (cornerRadius.topRight || 0) - 3)}px ${Math.max(0, (cornerRadius.bottomRight || 0) - 3)}px ${Math.max(0, (cornerRadius.bottomLeft || 0) - 3)}px` 
          : '50%';

        return (
          <div
            key={story.id}
            onClick={() => onStoryClick(index)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <div style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: borderRadiusStr,
              border: `${ringWidth}px solid ${ringColor}`,
              padding: '3px', // Spacing for border effect
              boxSizing: 'border-box',
              transition: 'transform 0.1s ease'
            }}>
              <img
                src={story.thumbnail}
                alt={story.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: imgBorderRadiusStr,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <span style={{
              marginTop: '6px',
              fontSize: `${styling.name?.size || 12}px`,
              fontFamily: styling.name?.fontFamily || 'sans-serif',
              fontWeight: styling.name?.font === 'Bold' ? 'bold' : 'normal',
              color: nameColor,
              maxWidth: `${size + 10}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {story.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
