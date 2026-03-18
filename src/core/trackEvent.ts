import useAppStorysStore, { getAccessToken, getUserId } from "./store";
import { Attributes } from "../types";
import getDeviceInfo from "./getDeviceInfo";
import { sendOrQueue } from "./offlineQueue";

export default async function trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
  try {
    if (!event) return;

    const accessToken = await getAccessToken();
    const state = useAppStorysStore.getState();

    const excludedEvents = [
      "viewed",
      "clicked",
      "csat captured",
      "survey captured",
      "shared"
    ];

    if (!excludedEvents.includes(event)) {
      const trackedEvents = state.trackedEvents;
      if (!trackedEvents.includes(event)) {
        state.setTrackedEvents([...trackedEvents, event]);
      } else {
        const updatedEvents = trackedEvents.filter(e => e !== event);
        updatedEvents.push(event);
        state.setTrackedEvents(updatedEvents);
      }

      if (metadata && Object.keys(metadata).length > 0) {
        const currentMeta = state.trackedEventMetadata || {};
        const existing = currentMeta[event] || [];
        state.setTrackedEventMetadata({
          ...currentMeta,
          [event]: [...existing, metadata],
        });
      }
    }

    let finalMetadata: Record<string, any> = {
      ...(metadata || {}),
    };

    if (!excludedEvents.includes(event)) {
      const deviceInfo = await getDeviceInfo();
      finalMetadata = {
        ...finalMetadata,
        ...deviceInfo,
      };
    }

    const variantId = campaignId ? state.variantMappings[campaignId] : undefined;
    if (variantId) {
      finalMetadata.variant_id = variantId;
    }

    const body: Record<string, any> = {
      user_id: getUserId(),
      event: event,
      metadata: finalMetadata,
    };
    if (campaignId) {
      body.campaign_id = campaignId;
    }

    const trackingUrl = state.trackingUrl || 'https://tracking.appstorys.co';

    if (accessToken) {
      await sendOrQueue({
        url: `${trackingUrl}/capture-event`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: body,
      });
    }
  } catch (error) {
    console.error('Error in trackEvent', error);
  }
}
