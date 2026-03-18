import { Campaign } from "../types";
import useAppStorysStore from "./store";

const getVariantId = (campaignId: string): string | undefined => {
  return useAppStorysStore.getState().variantMappings[campaignId];
};

export function hasVariants(campaign: Campaign): boolean {
  return !!(campaign.details && typeof campaign.details === 'object' && 'variants' in campaign.details);
}

export function resolveCampaignVariant<T extends Campaign>(campaign: T): T {
  if (!hasVariants(campaign)) {
    return campaign;
  }

  const variantId = getVariantId(campaign.id || '');
  
  if (!variantId) {
    return campaign;
  }

  const variants = (campaign.details as any)?.variants;
  
  if (!variants || typeof variants !== 'object') {
    return campaign;
  }

  const variantDetails = variants[variantId];
  
  if (!variantDetails) {
    return campaign;
  }

  const resolvedCampaign = {
    ...campaign,
    details: {
      ...variantDetails,
      ...(typeof campaign.details === 'object' && !('variants' in variantDetails) 
        ? Object.fromEntries(
            Object.entries(campaign.details).filter(([key]) => key !== 'variants')
          )
        : {}
      ),
    },
    _variantId: variantId,
  } as T;
  
  return resolvedCampaign;
}

export function getCampaignVariantId(campaign: Campaign): string | undefined {
  if ('_variantId' in campaign) {
    return (campaign as any)._variantId;
  }
  
  if (hasVariants(campaign)) {
    return getVariantId(campaign.id || '');
  }
  
  return undefined;
}
