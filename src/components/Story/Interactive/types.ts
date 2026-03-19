export interface BaseStickerData {
  id: string;
  type: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width?: number; // percentage or pixels
  height?: number;
  rotation?: number;
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    fontSize?: number;
    padding?: number;
    shadow?: string;
    [key: string]: any;
  };
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
  percentage?: number;
}

export interface PollStickerData extends BaseStickerData {
  type: 'poll';
  question: string;
  options: PollOption[];
  styling?: BaseStickerData['styling'] & {
    headerColor?: string;
    headerTextColor?: string;
    optionBgColor?: string;
    optionTextColor?: string;
    optionBorderRadius?: number;
  };
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  label?: string; // e.g., 'A', 'B', 'C', 'D'
}

export interface QuizStickerData extends BaseStickerData {
  type: 'quiz';
  question: string;
  options: QuizOption[];
  styling?: BaseStickerData['styling'] & {
    questionTextColor?: string;
    optionBgColor?: string;
    optionTextColor?: string;
    labelBgColor?: string;
    labelTextColor?: string;
    activeColor?: string;
    borderColor?: string;
  };
}

export interface RatingStickerData extends BaseStickerData {
  type: 'rating';
  title: string;
  emoji: string;
  currentRating?: number;
  maxRating?: number;
  styling?: BaseStickerData['styling'] & {
    sliderTrackColor?: string;
    sliderFillColor?: string;
    emojiSize?: number;
    titleColor?: string;
    titleFontSize?: number;
  };
}

export type StickerData = PollStickerData | QuizStickerData | RatingStickerData;

export interface StickerProps<T extends BaseStickerData> {
  data: T;
  onInteraction?: (interactionData: any) => void;
  isEditing?: boolean;
}
