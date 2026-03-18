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

export type Campaign = CampaignBanner | BaseCampaign;

export interface InitializationOptions {
  appId: string;
  accountId: string;
  userId?: string;
  baseUrl?: string;
  trackingUrl?: string;
  navigateToScreen?: (screen: string) => void;
}
