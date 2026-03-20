export interface IconConfig {
  color?: {
    cross?: string;
    fill?: string;
    stroke?: string;
  };
  image?: string;
  margin?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  selectedStyle?: string;
  size?: number;
}

export type PipButtonConfig = IconConfig;

export interface PipStyling {
  appearance?: {
    defaultSound?: string;
    pipHeight?: string | number;
    pipWidth?: string | number;
  };
  crossButton?: {
    color?: {
      cross?: string;
      fill?: string;
      stroke?: string;
    };
    enabled?: boolean;
    image?: string;
    margin?: {
      bottom?: number;
      left?: number;
      right?: number;
      top?: number;
    };
    selectedStyle?: string;
    size?: number;
  };
  expandControls?: {
    enabled?: boolean;
    maximise?: IconConfig;
    minimise?: IconConfig;
  };
  soundToggle?: {
    enabled?: boolean;
    defaultSound?: string;
    mute?: IconConfig;
    unmute?: IconConfig;
  };
}
