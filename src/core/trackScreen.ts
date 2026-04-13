import useAppStorysStore, { getAccessToken, getUserId } from "./store";
import { Campaign } from "../types";

function normalizeScreenName(screen?: string | null): string {
  return (screen || "").trim().toLowerCase();
}

function isScreenMatch(campaign: Campaign, screenName: string): boolean {
  const campaignScreen = normalizeScreenName(campaign.screen);
  const currentScreen = normalizeScreenName(screenName);
  return !campaignScreen || campaignScreen === currentScreen;
}

export default async function trackScreen(screenName: string) {
  try {
    const state = useAppStorysStore.getState();
    const accessToken = await getAccessToken();
    const accountId = state.accountId;

    if (!accessToken || !accountId) return;

    state.setCurrentScreen(screenName);
    state.setTrackedEvents([]); // Reset tracked events for new screen

    const baseUrl = state.baseUrl || 'https://users.appstorys.co';

    const response = await fetch(`${baseUrl}/v2/${accountId}/track-user-res`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        user_id: getUserId(),
        screenName
      }),
    });

    if (!response.ok) return;

    const data = await response.json();

    // Update screen-capture flag from response
    if (typeof data.screen_capture_enabled !== 'undefined') {
      state.setScreenCaptureEnabled(Boolean(data.screen_capture_enabled));
    }

    // Handle variants
    if (data.variants && data.variants.length > 0) {
      const variantMappings: Record<string, string> = {};
      data.variants.forEach((variant: any) => {
        variantMappings[variant.id] = variant.v_id;
      });
      state.setVariantMappings(variantMappings);
    }

    // Handle personalization
    if (data.personalization_data) {
      state.setPersonalizationData(data.personalization_data);
    }

    // Filter campaigns
    const allCampaigns = state.allCampaigns || [];
    const eligibleCampaignIds = data.eligibleCampaignList || [];

    const foundCampaigns = allCampaigns.filter(campaign =>
      eligibleCampaignIds.includes(campaign.id!) &&
      isScreenMatch(campaign, screenName)
    );

    // Fetch missing campaigns if necessary
    const foundCampaignIds = foundCampaigns.map(c => c.id!);
    const missingCampaignIds = eligibleCampaignIds.filter((id: string) => !foundCampaignIds.includes(id));

    let missingCampaigns: Campaign[] = [];
    if (missingCampaignIds.length > 0) {
      const fallbackResponse = await fetch(`${baseUrl}/load-campaign-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(missingCampaignIds),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        missingCampaigns = fallbackData.filter((campaign: Campaign) =>
          isScreenMatch(campaign, screenName)
        );
      }
    }

    const eligibleCampaigns = [...foundCampaigns, ...missingCampaigns];

    // Keep display-trigger campaigns available even when eligibility API is partial.
    const displayTriggeredCampaigns = allCampaigns.filter((campaign: Campaign & { display_trigger?: boolean }) =>
      isScreenMatch(campaign, screenName) && campaign.display_trigger === true
    );

    const mergedCampaigns = [...eligibleCampaigns];
    const seenCampaignIds = new Set(mergedCampaigns.map((campaign) => campaign.id));

    for (const campaign of displayTriggeredCampaigns) {
      if (!seenCampaignIds.has(campaign.id)) {
        mergedCampaigns.push(campaign);
        seenCampaignIds.add(campaign.id);
      }
    }

    state.saveCampaigns(mergedCampaigns);
  } catch (error) {
    console.error('Error when tracking screen:', screenName, error);
  }
}
