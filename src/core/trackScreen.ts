import useAppStorysStore, { getAccessToken, getUserId } from "./store";
import { Campaign } from "../types";

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
      (campaign.screen === screenName || !campaign.screen)
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
          campaign.screen === screenName || !campaign.screen
        );
      }
    }

    const eligibleCampaigns = [...foundCampaigns, ...missingCampaigns];
    if (eligibleCampaigns.length > 0) {
      state.saveCampaigns(eligibleCampaigns);
    }
  } catch (error) {
    console.error('Error when tracking screen:', screenName, error);
  }
}
