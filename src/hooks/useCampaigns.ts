import { useMemo } from "react";
import { Campaign, TriggerEventConfig, TriggerEventObject, Attributes } from "../types";
import useAppStorysStore from "../core/store";
import { resolveCampaignVariant } from "../core/variantResolver";

export const BACK_PRESS_SENTINEL = '__back_press_triggered__';

interface UseCampaignsOptions {
  position?: string;
}

function compareValues(actual: string, operator: TriggerEventConfig['operator'], expected: string): boolean {
  const numActual = Number(actual);
  const numExpected = Number(expected);
  const useNumeric = !isNaN(numActual) && !isNaN(numExpected);

  switch (operator) {
    case 'eq':  return useNumeric ? numActual === numExpected : actual === expected;
    case 'neq': return useNumeric ? numActual !== numExpected : actual !== expected;
    case 'gt':  return useNumeric ? numActual > numExpected   : actual > expected;
    case 'gte': return useNumeric ? numActual >= numExpected  : actual >= expected;
    case 'lt':  return useNumeric ? numActual < numExpected   : actual < expected;
    case 'lte': return useNumeric ? numActual <= numExpected  : actual <= expected;
    default:    return false;
  }
}

function matchesEventConditions(
  event_config: TriggerEventConfig[],
  metadataList: Attributes[],
): boolean {
  const realConditions = event_config.filter((c) => c.back_press == null);
  if (realConditions.length === 0) return true;

  return metadataList.some((meta) =>
    realConditions.every((condition) => {
      const actual = meta[condition.key!];
      if (actual === undefined || actual === null) return false;
      return compareValues(String(actual), condition.operator!, condition.value!);
    })
  );
}

function isTriggerEventSatisfied(
  campaign: Campaign,
  trackedEvents: string[],
  trackedEventMetadata: Record<string, Attributes[]>,
): boolean {
  const { trigger_event, id } = campaign as Campaign & { id?: string };

  if (!trigger_event) return true;

  if (typeof trigger_event === 'string') {
    const resolved = trigger_event === 'viaAppStorys' ? `viaAppStorys${id}` : trigger_event;
    return trackedEvents.includes(resolved);
  }

  const { event, event_config } = trigger_event as TriggerEventObject;

  const isBackPress = (event_config ?? []).some((c) => c.back_press === true);
  if (isBackPress && !trackedEvents.includes(BACK_PRESS_SENTINEL)) return false;

  if (!trackedEvents.includes(event)) return false;
  if (!event_config || event_config.length === 0) return true;

  const metadataList = trackedEventMetadata[event] || [];
  return matchesEventConditions(event_config, metadataList);
}

/**
 * Checks whether any currently loaded campaign is a back_press (exit intent) campaign
 * that is ready to show but not yet triggered.
 */
export function isBackPressCampaignReady(): boolean {
  const { campaigns, trackedEvents, trackedEventMetadata, currentScreen } = useAppStorysStore.getState();

  return campaigns.some((campaign) => {
    if (campaign.screen && campaign.screen !== currentScreen) return false;

    const te = (campaign as any).trigger_event;
    if (!te || typeof te === 'string') return false;

    const { event, event_config } = te as TriggerEventObject;
    if (!(event_config ?? []).some((c: TriggerEventConfig) => c.back_press === true)) return false;

    // Already consumed
    if (trackedEvents.includes(BACK_PRESS_SENTINEL)) return false;

    // The underlying event must have been tracked
    if (!trackedEvents.includes(event)) return false;

    // Non-back_press conditions must also pass
    const realConditions = (event_config ?? []).filter((c: TriggerEventConfig) => c.back_press == null);
    if (realConditions.length === 0) return true;

    const metadataList = trackedEventMetadata[event] || [];
    return matchesEventConditions(realConditions, metadataList);
  });
}

export default function useCampaigns<T extends Campaign>(campaignType: string, options?: UseCampaignsOptions): T | undefined {
  const currentScreen = useAppStorysStore((state) => state.currentScreen);
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const trackedEvents = useAppStorysStore((state) => state.trackedEvents);
  const trackedEventMetadata = useAppStorysStore((state) => state.trackedEventMetadata);
  const variantMappings = useAppStorysStore((state) => state.variantMappings);

  return useMemo(
    () => {
      const campaign = campaigns?.find((campaign) =>
        campaign.screen === currentScreen &&
        campaign.campaign_type === campaignType &&
        (options?.position ? campaign.position === options.position : true) &&
        isTriggerEventSatisfied(campaign, trackedEvents, trackedEventMetadata)
      );

      if (!campaign) return undefined;
      return resolveCampaignVariant(campaign) as T | undefined;
    },
    [campaigns, trackedEvents, trackedEventMetadata, variantMappings, campaignType, options, currentScreen],
  );
}
