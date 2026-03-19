export type CampaignType = 'BAN' | 'FLT' | 'PIP' | 'SUR' | 'CSAT' | 'WID' | 'MOD' | 'BTS' | 'SCRT' | 'STR' | 'TLTP';

export interface CrossButtonConfig {
  color: {
    cross: string;
    fill: string;
    stroke: string;
  };
  enabled: boolean;
  image: string;
  margin: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  selectedStyle?: string;
  size: number;
}

export interface StorySlideCtaBorderRadius {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

export interface TriggerEventConfig {
  key?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
  value?: string;
  back_press?: boolean;
}

export interface TriggerEventObject {
  event: string;
  event_config: TriggerEventConfig[];
}

export type TriggerEvent = string | TriggerEventObject;

export interface BaseCampaign {
  id: string;
  campaign_type: CampaignType;
  trigger_event?: TriggerEvent;
  position?: string;
  screen?: string;
  details: any;
}

export interface CampaignBanner extends BaseCampaign {
  campaign_type: 'BAN';
  details: {
    id: string;
    image: string | null;
    lottie_data: string | null;
    width: null | number;
    height: null | number;
    link: null | string;
    styling: {
      bottomLeftRadius?: string;
      bottomRightRadius?: string;
      topLeftRadius?: string;
      topRightRadius?: string;
      marginBottom?: string;
      marginLeft?: string;
      marginRight?: string;
      crossButton?: CrossButtonConfig;
      [key: string]: any;
    };
  };
}

export interface Attributes {
  [key: string]: any;
}

export enum SdkState {
  uninitialized = 'uninitialized',
  initializing = 'initializing',
  initialized = 'initialized',
  error = 'error'
}

export interface AppStorysStore {
  userId: string;
  appId: string;
  accountId: string;
  currentScreen: string;
  campaigns: Campaign[];
  allCampaigns: Campaign[];
  campaignVersion: number;
  trackedEvents: string[];
  trackedEventMetadata: Record<string, Attributes[]>;
  attributes?: Attributes;
  isVisible: boolean;
  isAnonymousUser: boolean;
  variantMappings: Record<string, string>;
  personalizationData: Record<string, string>;
  baseUrl?: string;
  trackingUrl?: string;
}

export interface StorySlideCtaContainer {
  alignment?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  ctaFullWidth?: boolean;
  ctaWidth?: number;
  height?: number;
}

export interface StorySlideCtaText {
  color?: string;
  fontDecoration?: string[];
  fontFamily?: string;
  fontSize?: number;
}

export interface StorySlideCta {
  container?: StorySlideCtaContainer;
  cornerRadius?: StorySlideCtaBorderRadius;
  margin?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  text?: StorySlideCtaText;
}

export interface StorySlideStyling {
  cta?: StorySlideCta;
  meta?: {
    editorSource?: string;
  };
  pc_redirect_type?: string;
  rdrType?: string;
}

export interface StorySlide {
  button_text?: string;
  content?: any;
  id: string;
  image: string | null;
  link: string | null;
  order: number;
  parent: string;
  personalizationData?: any;
  styling?: StorySlideStyling;
  video: string | null;
}

export interface StoryGroupStyling {
  cornerRadius?: {
    bottomLeft?: number;
    bottomRight?: number;
    topLeft?: number;
    topRight?: number;
  };
  crossButton?: CrossButtonConfig;
  name?: {
    font?: string;
    fontFamily?: string;
    size?: number;
  };
  ringWidth?: number;
  share?: {
    color?: {
      cross?: string;
      fill?: string;
      stroke?: string;
    };
    enabled?: boolean;
    image?: string;
    margin?: {
      right?: number;
      top?: number;
    };
    selectedStyle?: string;
    size?: number;
  };
  size?: number;
  slideShowTime?: number;
  soundToggle?: {
    defaultSound?: string;
    enabled?: boolean;
    mute?: any;
    unmute?: any;
  };
  storyGroupText?: string;
}

export interface Story {
  cohorts: any;
  id: string;
  name: string;
  nameColor: string;
  order: number;
  ringColor: string;
  slides: StorySlide[];
  styling?: StoryGroupStyling;
  thumbnail: string;
}

export interface CampaignStory extends BaseCampaign {
  campaign_type: 'STR';
  details: Story[];
}

export interface WidgetImage {
  cohorts: any;
  id: string;
  image: string;
  link: string;
  order: number;
}

export interface CampaignWidget extends BaseCampaign {
  campaign_type: 'WID';
  details: {
    height: number;
    id: string;
    styling: {
      borderRadius: number;
      bottomLeftRadius: number;
      bottomMargin: number;
      bottomRightRadius: number;
      leftMargin: number;
      rightMargin: number;
      topLeftRadius: number;
      topMargin: number;
      topRightRadius: number;
      type: string;
    };
    widget_images: WidgetImage[];
    width: number;
    type?: string;
  };
}

export type Campaign = CampaignBanner | CampaignStory | CampaignWidget | BaseCampaign;

export interface InitializationOptions {
  appId: string;
  accountId: string;
  userId?: string;
  baseUrl?: string;
  trackingUrl?: string;
  navigateToScreen?: (screen: string) => void;
}
