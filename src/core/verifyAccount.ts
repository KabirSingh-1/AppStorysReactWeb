import { WebStorage } from '../adapters/web/storage';
import getDeviceInfo from './getDeviceInfo';
import useAppStorysStore from './store';

const DEVICE_INFO_SENT_KEY = 'device_info_sent';

export default async function verifyAccount(accountId: string, appId: string, userId: string): Promise<boolean> {
  try {
    const requestBody: any = {
      account_id: accountId,
      app_id: appId,
      user_id: userId
    };

    const deviceInfoAlreadySent = await WebStorage.getItem(DEVICE_INFO_SENT_KEY);

    if (!deviceInfoAlreadySent) {
      const deviceInfo = await getDeviceInfo();
      requestBody.attributes = {
        ...deviceInfo
      };
    }

    const state = useAppStorysStore.getState();
    const baseUrl = state.baseUrl || 'https://users.appstorys.co';

    const response = await fetch(`${baseUrl}/${accountId}/validate-account`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      const data = await response.json();
      const { access_token, refresh_token } = data;

      if (access_token && refresh_token) {
        await WebStorage.setItem('access_token', access_token);
        await WebStorage.setItem('refresh_token', refresh_token);

        if (requestBody.attributes) {
          await WebStorage.setItem(DEVICE_INFO_SENT_KEY, 'true');
        }

        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error when verifying AppStorys account', error);
    return false;
  }
}
