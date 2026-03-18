import useAppStorysStore, { getAccessToken, getUserId } from "./store";
import { Attributes } from "../types";
import getDeviceInfo from "./getDeviceInfo";
import { sendOrQueue } from "./offlineQueue";

/**
 * Sets custom attributes for the user.
 * These properties can be used for campaign targeting and segmentation.
 * 
 * @param attributes - A key-value object of user properties.
 */
export default async function setUserProperties(attributes: Attributes) {
  try {
    const accessToken = await getAccessToken();
    const userId = getUserId();
    const state = useAppStorysStore.getState();

    if (!accessToken || !userId) {
      console.warn("AppStorys: Missing accessToken or userId. Ensure SDK is initialized before setting user properties.");
      return;
    }

    let finalMetadata: Record<string, any> = {
      ...(attributes || {}),
    };

    const deviceInfo = await getDeviceInfo();
    finalMetadata = {
      ...finalMetadata,
      ...deviceInfo,
    };

    const bodyData: any = {
      user_id: userId,
      attributes: finalMetadata
    };

    const baseUrl = state.baseUrl || 'https://users.appstorys.co';

    await sendOrQueue({
      url: `${baseUrl}/update-user-atr`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyData,
    });

  } catch (error) {
    console.error("AppStorys: Error in setUserProperties:", error);
  }
}
