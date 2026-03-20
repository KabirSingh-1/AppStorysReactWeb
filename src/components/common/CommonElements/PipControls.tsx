import React from 'react';
import { PipStyling } from '../../Pip/types';
import { SoundButton } from './SoundButton';
import { ExpandableButton } from './ExpandableButton';
import CrossButton from './CrossButton';

type PipMode = 'SMALL' | 'LARGE';

interface PipControlsProps {
  styling: PipStyling;
  mode: PipMode;

  muted: boolean;
  expanded: boolean;

  onClose: () => void;
  onToggleMute: () => void;
  onToggleExpand: () => void;

  /**
   * Used only in LARGE PIP
   * (safe-area / top padding etc.)
   */
  containerStyle?: React.CSSProperties;
}

const PipControls: React.FC<PipControlsProps> = ({
  styling,
  mode,
  muted,
  expanded,
  onClose,
  onToggleMute,
  onToggleExpand,
  containerStyle,
}) => {
  if (!styling) return null;

  const ignoreSizeAndMargin = mode === 'LARGE';

  // Defines positioning for icons in LARGE mode
  // Cross: Top Right
  // Sound: Top Left (next to cross)
  // Expand: Top Left (when no sound)

  const crossStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'auto',
    ...(ignoreSizeAndMargin ? { top: 15, right: 15 } : { top: 0, right: 0 })
  };

  const soundStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'auto',
    ...(ignoreSizeAndMargin ? { top: 15, right: 60 } : { top: 0, left: 0 })
  };

  const expandStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'auto',
    ...(ignoreSizeAndMargin ? { top: 15, left: 15 } : { bottom: 0, right: 0 })
  };

  const soundConfig = muted
    ? styling.soundToggle?.unmute
    : styling.soundToggle?.mute;

  const expandConfig = expanded
    ? styling.expandControls?.minimise
    : styling.expandControls?.maximise;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999999,
        pointerEvents: 'none',
        ...containerStyle,
      }}
    >
      {/* CLOSE */}
      {styling.crossButton?.enabled && (
        <CrossButton
          config={{
            enabled: styling.crossButton?.enabled ?? false,
            image: styling.crossButton?.image ?? '',
            color: {
              cross: styling.crossButton?.color?.cross ?? '#ffffff',
              fill: styling.crossButton?.color?.fill ?? '',
              stroke: styling.crossButton?.color?.stroke ?? '',
            },
            margin: {
              top: styling.crossButton?.margin?.top ?? 0,
              bottom: styling.crossButton?.margin?.bottom ?? 0,
              left: styling.crossButton?.margin?.left ?? 0,
              right: styling.crossButton?.margin?.right ?? 0,
            },
            size: styling.crossButton?.size && styling.crossButton.size > 10 ? styling.crossButton.size : 20
          }}
          onPress={onClose}
          ignoreSizeAndMargin={ignoreSizeAndMargin}
          style={crossStyle}
        />
      )}

      {/* MUTE / UNMUTE */}
      {styling.soundToggle?.enabled && soundConfig && (
        <SoundButton
          config={soundConfig}
          onPress={onToggleMute}
          ignoreSizeAndMargin={ignoreSizeAndMargin}
          style={soundStyle}
          enabled={styling.soundToggle?.enabled}
          type={muted ? 'unmute' : 'mute'}
        />
      )}

      {/* EXPAND / MINIMIZE */}
      {styling.expandControls?.enabled && expandConfig && (
        <ExpandableButton
          config={expandConfig}
          onPress={onToggleExpand}
          ignoreSizeAndMargin={ignoreSizeAndMargin}
          style={expandStyle}
          enabled={styling.expandControls?.enabled}
          type={expanded ? 'minimise' : 'maximise'}
        />
      )}
    </div>
  );
};

export default PipControls;