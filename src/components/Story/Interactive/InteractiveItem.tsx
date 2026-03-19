import React from 'react';
import { StickerData } from './types';
import { PollSticker } from './PollSticker';
import { QuizSticker } from './QuizSticker';

import { RatingSticker } from './RatingSticker';

interface InteractiveItemProps {
  data: StickerData;
  onInteraction?: (data: any) => void;
  isEditing?: boolean;
}

export const InteractiveItem: React.FC<InteractiveItemProps> = ({
  data,
  onInteraction,
  isEditing = false,
}) => {
  const defaults = {
    x: 10,
    y: 15,
    width: 80, // percentage
    rotation: 0,
  };

  const x = data.x ?? defaults.x;
  const y = data.y ?? defaults.y;
  const width = data.width ?? defaults.width;
  const rotation = data.rotation ?? defaults.rotation;

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${y}%`,
    left: `${x}%`,
    width: `${width}%`,
    transform: `rotate(${rotation}deg)`,
    zIndex: 10,
    transformOrigin: 'center center',
    boxSizing: 'border-box',
    cursor: isEditing ? 'move' : 'default',
    pointerEvents: 'auto', // override any transparent overlay issues
  };

  const renderSticker = () => {
    const stickerType = (data as any).type;
    switch (stickerType) {
      case 'poll':
        return <PollSticker data={data as any} onInteraction={onInteraction} isEditing={isEditing} />;
      case 'quiz':
        return <QuizSticker data={data as any} onInteraction={onInteraction} isEditing={isEditing} />;
      case 'rating':
        return <RatingSticker data={data as any} onInteraction={onInteraction} isEditing={isEditing} />;
      case 'image':
        return <img src={(data as any).url} alt="static overlay" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
      case 'text': {
        const textStyle = (data as any).styling || {};
        return (
          <span style={{
            color: textStyle.color || '#000000',
            fontSize: `${textStyle.fontSize || 14}px`,
            fontFamily: textStyle.fontFamily || 'Arial',
            fontStyle: textStyle.fontStyle || 'normal',
            fontWeight: textStyle.fontWeight || 'normal',
            wordBreak: 'break-word',
            display: 'inline-block',
          }}>
            {(data as any).text}
          </span>
        );
      }
      default:
        return (
          <div style={{ padding: '10px', background: 'white', color: 'black', borderRadius: '4px' }}>
            Unsupported interactive element: {(data as any).type}
          </div>
        );
    }
  };

  return <div style={wrapperStyle} className={`interactive-item-z${(data as any).z ?? 0}`}>{renderSticker()}</div>;
};
