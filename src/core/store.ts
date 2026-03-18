import { create } from 'zustand';
import { AppStorysStore, Campaign, Attributes } from '../types';
import { WebStorage } from '../adapters/web/storage';

export interface AppStorysActions {
  setUserId: (userId: string) => void;
  setAppId: (appId: string) => void;
  setAccountId: (accountId: string) => void;
  setCurrentScreen: (screen: string) => void;
  saveCampaigns: (campaigns: Campaign[]) => void;
  saveAllCampaigns: (campaigns: Campaign[]) => void;
  setCampaignVersion: (version: number) => void;
  setTrackedEvents: (events: string[]) => void;
  setTrackedEventMetadata: (metadata: Record<string, Attributes[]>) => void;
  setAttributes: (attributes: Attributes) => void;
  setVisibility: (visible: boolean) => void;
  setIsAnonymousUser: (isAnonymous: boolean) => void;
  setVariantMappings: (mappings: Record<string, string>) => void;
  setPersonalizationData: (data: Record<string, string>) => void;
  setBaseUrl: (baseUrl?: string) => void;
  setTrackingUrl: (trackingUrl?: string) => void;
}

const useAppStorysStore = create<AppStorysStore & AppStorysActions>((set) => ({
  userId: '',
  appId: '',
  accountId: '',
  currentScreen: '',
  campaigns: [],
  allCampaigns: [],
  campaignVersion: 2,
  trackedEvents: [],
  trackedEventMetadata: {},
  isVisible: true,
  isAnonymousUser: false,
  variantMappings: {},
  personalizationData: {},
  baseUrl: undefined,
  trackingUrl: undefined,
  
  saveCampaigns: (campaigns: Campaign[]) => set({ campaigns }),
  saveAllCampaigns: (campaigns: Campaign[]) => set({ allCampaigns: campaigns }),
  setCampaignVersion: (version: number) => set({ campaignVersion: version }),
  setUserId: (userId: string) => set({ userId }),
  setAppId: (appId: string) => set({ appId }),
  setAccountId: (accountId: string) => set({ accountId }),
  setCurrentScreen: (currentScreen: string) => set({ currentScreen }),
  setAttributes: (attributes: Attributes) => set({ attributes }),
  setTrackedEvents: (trackedEvents: string[]) => set({ trackedEvents }),
  setTrackedEventMetadata: (trackedEventMetadata: Record<string, Attributes[]>) => set({ trackedEventMetadata }),
  setVisibility: (isVisible: boolean) => set({ isVisible }),
  setIsAnonymousUser: (isAnonymousUser: boolean) => set({ isAnonymousUser }),
  setVariantMappings: (variantMappings: Record<string, string>) => set({ variantMappings }),
  setPersonalizationData: (personalizationData: Record<string, string>) => set({ personalizationData }),
  setBaseUrl: (baseUrl?: string) => set({ baseUrl }),
  setTrackingUrl: (trackingUrl?: string) => set({ trackingUrl }),
}));

export function getAppId() {
  return useAppStorysStore.getState().appId;
}

export function getUserId() {
  return useAppStorysStore.getState().userId;
}

export async function getAccessToken() {
  return WebStorage.getItem('access_token');
}

export function getCampaigns() {
  return useAppStorysStore.getState().campaigns;
}

export function getAllCampaigns() {
  return useAppStorysStore.getState().allCampaigns;
}

export function getCampaignVersion() {
  return useAppStorysStore.getState().campaignVersion;
}

export default useAppStorysStore;
