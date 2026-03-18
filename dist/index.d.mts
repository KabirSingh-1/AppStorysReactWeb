import React from 'react';

type CampaignType = 'BAN' | 'FLT' | 'PIP' | 'SUR' | 'CSAT' | 'WID' | 'MOD' | 'BTS' | 'SCRT' | 'STR' | 'TLTP';
interface CrossButtonConfig {
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
interface StorySlideCtaBorderRadius {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
}
interface TriggerEventConfig {
    key?: string;
    operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
    value?: string;
    back_press?: boolean;
}
interface TriggerEventObject {
    event: string;
    event_config: TriggerEventConfig[];
}
type TriggerEvent = string | TriggerEventObject;
interface BaseCampaign {
    id: string;
    campaign_type: CampaignType;
    trigger_event?: TriggerEvent;
    position?: string;
    screen?: string;
    details: any;
}
interface CampaignBanner extends BaseCampaign {
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
interface Attributes {
    [key: string]: any;
}
declare enum SdkState {
    uninitialized = "uninitialized",
    initializing = "initializing",
    initialized = "initialized",
    error = "error"
}
interface AppStorysStore {
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
type Campaign = CampaignBanner | BaseCampaign;
interface InitializationOptions {
    appId: string;
    accountId: string;
    userId?: string;
    baseUrl?: string;
    trackingUrl?: string;
    navigateToScreen?: (screen: string) => void;
}

declare const Banner: React.FC;

declare function personalizeText(text: string): string;

declare class AppStorys {
    private state;
    private navigateToScreen?;
    initialize(options: InitializationOptions): Promise<void>;
    trackScreen(screenName: string): Promise<void>;
    trackEvent(event: string, campaignId?: string, metadata?: Attributes): Promise<void>;
    setUserProperties(attributes: Attributes): Promise<void>;
    handleLink(link: string | any): void;
    /**
     * Gets the visibility status of the SDK.
     * @returns boolean indicating whether the SDK is considered visible.
     */
    get visibility(): boolean;
    /**
     * Manually sets the visibility status of the SDK.
     * Useful for host apps that want to pause/resume SDK activities programmatically.
     * @param isVisible - boolean indicating visibility status.
     */
    set visibility(isVisible: boolean);
    private ensureInitialized;
    personalizeText(text: string): string;
}
declare const instance: AppStorys;

export { instance as AppStorys, type AppStorysStore, type Attributes, Banner, type BaseCampaign, type Campaign, type CampaignBanner, type CampaignType, type CrossButtonConfig, type InitializationOptions, SdkState, type StorySlideCtaBorderRadius, type TriggerEvent, type TriggerEventConfig, type TriggerEventObject, personalizeText };
