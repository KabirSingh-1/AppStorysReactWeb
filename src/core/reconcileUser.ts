import useAppStorysStore, { getAccessToken } from "./store";

interface ReconcileUserRequest {
  anonymous_user_id: string;
  identified_user_id: string;
}

/**
 * Reconciles an anonymous user with an identified user.
 * This merges the anonymous user's data with the identified user's data.
 * 
 * @param anonymousUserId - The previous anonymous user ID
 * @param identifiedUserId - The new identified user ID
 * @returns Promise<boolean> - true if reconciliation was successful, false otherwise
 */
export default async function reconcileAnonymousUser(
  anonymousUserId: string,
  identifiedUserId: string
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const state = useAppStorysStore.getState();
    
    if (!accessToken) {
      console.error('AppStorys: Access token not found for reconciliation');
      return false;
    }

    const requestBody: ReconcileUserRequest = {
      anonymous_user_id: anonymousUserId,
      identified_user_id: identifiedUserId,
    };

    const baseUrl = state.baseUrl || 'https://users.appstorys.co';

    const response = await fetch(`${baseUrl}/reconcile-anonymous-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error('AppStorys: Failed to reconcile anonymous user:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('AppStorys: Error in reconcileAnonymousUser:', error);
    return false;
  }
}
