import { WebStorage } from '../adapters/web/storage';
import { Campaign } from '../types';
import { getAccessToken, getUserId } from './store';
import useAppStorysStore from './store';

const STORAGE_KEY_CAMPAIGNS = "appstorys_campaigns_cache";
const STORAGE_KEY_ETAG = "appstorys_campaigns_etag";
const STORAGE_KEY_VERSION = "appstorys_campaigns_version";

export interface FetchCampaignsResult {
  campaigns: Campaign[];
  version: number;
}

export default async function fetchAllCampaigns(accountId: string, screenName?: string): Promise<FetchCampaignsResult> {
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

    const newEtag = response.headers.get("ETag");
    const responseData: any[] = await response.json();

    let version = 2;
    let campaigns: Campaign[] = responseData;

    // Determine an effective screen name. If caller didn't provide one, try
    // to fetch it from the users service `v2/{accountId}/track-user-res`.
    let effectiveScreenName = screenName;
    if (!effectiveScreenName) {
      try {
        const accessToken = await getAccessToken();
        const userId = getUserId();
        const usersBase = isLocalDev ? '/appstorys-users' : 'https://users.appstorys.co';

        const trackResp = await fetch(`${usersBase}/v2/${accountId}/track-user-res`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            user_id: userId,
            screenName: (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '',
            silentUpdate: true,
          }),
        });

        if (trackResp.ok) {
          const trackData = await trackResp.json();
          console.info('AppStorys: fetchAllCampaigns track-user-res returned', trackData);
          const possibleScreen = trackData?.screenName || trackData?.screen || trackData?.currentScreen || trackData?.screen_name || trackData?.current_screen;
          if (possibleScreen) {
            effectiveScreenName = possibleScreen;
          }
          try {
            const s = useAppStorysStore.getState();
            if (typeof trackData.screen_capture_enabled !== 'undefined') {
              s.setScreenCaptureEnabled(Boolean(trackData.screen_capture_enabled));
            }
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Could not fetch screen name from track-user-res:', err);
      }
    }

    if (responseData.length > 0 && responseData[0].version !== undefined) {
      version = responseData[0].version;
      campaigns = responseData.slice(1);
    }

    // If no campaigns found in the primary source, try fallback using track-user and load-campaign-data
    if ((!campaigns || campaigns.length === 0)) {
      try {
        const accessToken = await getAccessToken();
        const userId = getUserId();
        const usersBase = isLocalDev ? '/appstorys-users' : 'https://users.appstorys.co';

        const trackResp = await fetch(`${usersBase}/v2/${accountId}/track-user-res`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            user_id: userId,
            screenName: (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '',
            silentUpdate: true,
          }),
        });

        if (trackResp.ok) {
          const trackData = await trackResp.json();
          const userIdFromResp = trackData?.user_id || trackData?.id || trackData?.userId || userId;

          try {
            const s = useAppStorysStore.getState();
            if (typeof trackData.screen_capture_enabled !== 'undefined') {
              s.setScreenCaptureEnabled(Boolean(trackData.screen_capture_enabled));
            }
          } catch (err) {
            // ignore
          }

          if (userIdFromResp) {
            const loadUrl = isLocalDev
              ? `/appstorys-users/load-campaign-data`
              : `https://users.appstorys.com/load-campaign-data`;

            const fallbackResponse = await fetch(loadUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({ user_id: userIdFromResp }),
            });

            if (fallbackResponse.ok) {
              const fallbackData: any[] = await fallbackResponse.json();
              console.log(`Fetched ${fallbackData.length} missing campaigns from fallback`);
              console.log('Fallback campaigns:', JSON.stringify(fallbackData, null, 2));

              // Use fallback campaigns if available
              if (fallbackData && fallbackData.length > 0) {
                campaigns = fallbackData as Campaign[];
              }
            } else {
              console.error('Failed to fetch missing campaigns:', await fallbackResponse.text());
            }
          }
        }
      } catch (error) {
        console.error('Error fetching missing campaigns via fallback:', error);
      }
    }

    // Filter campaigns by effective screenName if available
    if (effectiveScreenName && campaigns && campaigns.length > 0) {
      const normalize = (s?: string | null) => (s || '').trim().toLowerCase();
      const current = normalize(effectiveScreenName);
      campaigns = campaigns.filter(campaign => !normalize(campaign.screen) || normalize(campaign.screen) === current);
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
