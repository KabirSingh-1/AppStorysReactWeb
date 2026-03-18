import { WebStorage } from '../adapters/web/storage';
import { Campaign } from '../types';

const STORAGE_KEY_CAMPAIGNS = "appstorys_campaigns_cache";
const STORAGE_KEY_ETAG = "appstorys_campaigns_etag";
const STORAGE_KEY_VERSION = "appstorys_campaigns_version";

export interface FetchCampaignsResult {
  campaigns: Campaign[];
  version: number;
}

export default async function fetchAllCampaigns(accountId: string): Promise<FetchCampaignsResult> {
  try {
    const isLocalDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const url = isLocalDev
      ? `/appstorys-campaigns/clients/${accountId}/campaigns.json`
      : `https://dev-cdn-campaign-appstorys.s3.ap-south-1.amazonaws.com/clients/${accountId}/campaigns.json`;

    const cachedData = await WebStorage.getItem(STORAGE_KEY_CAMPAIGNS);
    const cachedEtag = await WebStorage.getItem(STORAGE_KEY_ETAG);
    const cachedVersion = await WebStorage.getItem(STORAGE_KEY_VERSION);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Keep ETag revalidation for non-local environments only.
    if (!isLocalDev && cachedEtag) {
      headers["If-None-Match"] = cachedEtag;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      ...(isLocalDev ? { cache: "no-store" as RequestCache } : {}),
    });

    if (response.status === 304) {
      return {
        campaigns: cachedData ? JSON.parse(cachedData) : [],
        version: cachedVersion ? parseInt(cachedVersion) : 1,
      };
    }

    if (!response.ok) {
      return {
        campaigns: cachedData ? JSON.parse(cachedData) : [],
        version: cachedVersion ? parseInt(cachedVersion) : 1,
      };
    }

    const newEtag = response.headers.get("ETag");
    const responseData: any[] = await response.json();

    let version = 2;
    let campaigns: Campaign[] = responseData;

    if (responseData.length > 0 && responseData[0].version !== undefined) {
      version = responseData[0].version;
      campaigns = responseData.slice(1);
    }

    await WebStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
    await WebStorage.setItem(STORAGE_KEY_VERSION, version.toString());

    if (newEtag) {
      await WebStorage.setItem(STORAGE_KEY_ETAG, newEtag);
    }

    return { campaigns, version };

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    const cachedData = await WebStorage.getItem(STORAGE_KEY_CAMPAIGNS);
    const cachedVersion = await WebStorage.getItem(STORAGE_KEY_VERSION);
    
    return {
      campaigns: cachedData ? JSON.parse(cachedData) : [],
      version: cachedVersion ? parseInt(cachedVersion) : 1,
    };
  }
}
