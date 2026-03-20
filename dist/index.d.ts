import React from 'react';

type CampaignType = 'BAN' | 'FLT' | 'PIP' | 'SUR' | 'CSAT' | 'WID' | 'MOD' | 'BTS' | 'SCRT' | 'STR' | 'TLTP' | 'TTP';
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
interface StorySlideCtaContainer {
    alignment?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    ctaFullWidth?: boolean;
    ctaWidth?: number;
    height?: number;
}
interface StorySlideCtaText {
    color?: string;
    fontDecoration?: string[];
    fontFamily?: string;
    fontSize?: number;
}
interface StorySlideCta {
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
interface StorySlideStyling {
    cta?: StorySlideCta;
    meta?: {
        editorSource?: string;
    };
    pc_redirect_type?: string;
    rdrType?: string;
}
interface StorySlide {
    button_text?: string;
    content?: any;
    id: string;
    image: string | null;
    interactions?: any[];
    link: string | null;
    order: number;
    parent: string;
    personalizationData?: any;
    styling?: StorySlideStyling;
    video: string | null;
}
interface StoryGroupStyling {
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
interface Story$1 {
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
interface CampaignStory extends BaseCampaign {
    campaign_type: 'STR';
    details: Story$1[];
}
interface WidgetImage {
    cohorts: any;
    id: string;
    image: string;
    link: string;
    order: number;
}
interface CampaignWidget extends BaseCampaign {
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
interface TooltipStyling {
    appearance?: {
        arrowStyle?: {
            height?: number;
            width?: number;
        };
        backdropOpacity?: number;
        colors?: {
            arrow?: string;
            backdrop?: string;
            tooltip?: string;
        };
        cornerRadius?: {
            bottomLeft?: number;
            bottomRight?: number;
            topLeft?: number;
            topRight?: number;
        };
        highlight?: {
            padding?: number;
            radius?: number;
        };
        padding?: {
            bottom?: number;
            left?: number;
            right?: number;
            top?: number;
        };
    };
    cta?: {
        container?: {
            alignment?: string;
            backgroundColor?: string;
            borderColor?: string;
            borderWidth?: number;
            ctaFullWidth?: boolean;
            ctaWidth?: number;
            height?: number;
        };
        cornerRadius?: {
            bottomLeft?: number;
            bottomRight?: number;
            topLeft?: number;
            topRight?: number;
        };
        margin?: {
            bottom?: number;
            left?: number;
            right?: number;
            top?: number;
        };
        text?: {
            color?: string;
            fontDecoration?: string[];
            fontFamily?: string;
            fontSize?: number;
        };
    };
    subTitle?: {
        color?: string;
        fontDecoration?: string[];
        fontFamily?: string;
        fontSize?: number;
        margin?: {
            bottom?: number;
            left?: number;
            right?: number;
            top?: number;
        };
        textAlign?: string;
    };
    title?: {
        color?: string;
        fontDecoration?: string[];
        fontFamily?: string;
        fontSize?: number;
        margin?: {
            bottom?: number;
            left?: number;
            right?: number;
            top?: number;
        };
        textAlign?: string;
    };
}
interface TooltipItem {
    _id: string;
    arrowPosition?: "left" | "right" | "top" | "bottom" | string;
    clickAction?: "nextStep" | "close" | string;
    ctaText?: string;
    enableBackdrop?: boolean;
    eventName?: string;
    link?: string;
    order?: number;
    position?: string;
    styling?: TooltipStyling;
    subtitleText?: string;
    target?: string;
    titleText?: string;
    url?: string | null;
}
interface CampaignTooltip extends BaseCampaign {
    campaign_type: 'TTP';
    details: {
        tooltips?: TooltipItem[];
        titleText?: string;
        subtitleText?: string;
        target?: string;
        styling?: TooltipStyling;
    } & Partial<TooltipItem>;
    display_trigger?: boolean;
}
type Campaign = CampaignBanner | CampaignStory | CampaignWidget | CampaignTooltip | BaseCampaign;
interface InitializationOptions {
    appId: string;
    accountId: string;
    userId?: string;
    baseUrl?: string;
    trackingUrl?: string;
    navigateToScreen?: (screen: string) => void;
}

declare const Banner: React.FC;

declare const Pip: React.FC;

declare const Floater: React.FC;

declare function personalizeText(text: string): string;

declare const Story: React.FC;

declare const Widget: React.FC;

declare const Tooltip: React.FC;

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

export { instance as AppStorys, type AppStorysStore, type Attributes, Banner, type BaseCampaign, type Campaign, type CampaignBanner, type CampaignStory, type CampaignTooltip, type CampaignType, type CampaignWidget, type CrossButtonConfig, Floater, type InitializationOptions, Pip, SdkState, Story, type StoryGroupStyling, type StorySlide, type StorySlideCta, type StorySlideCtaBorderRadius, type StorySlideCtaContainer, type StorySlideCtaText, type StorySlideStyling, Tooltip, type TooltipItem, type TooltipStyling, type TriggerEvent, type TriggerEventConfig, type TriggerEventObject, Widget, type WidgetImage, personalizeText };
