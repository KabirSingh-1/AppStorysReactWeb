import { getAccessToken } from './store';

export default async function identifyWidgetPositions(screenName: string, positionList?: string[]) {
  if (!positionList || positionList.length === 0) {
    console.info('AppStorys: identifyWidgetPositions called with empty positionList; skipping');
    return;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('AppStorys: identifyWidgetPositions - access token not found');
    return;
  }

  try {
    const endpoint = 'https://backend.appstorys.co/api/v2/appinfo/identify-positions/';
    console.info('AppStorys: identifyWidgetPositions payload', { screen_name: screenName, position_list: positionList });
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        screen_name: screenName,
        position_list: positionList,
      }),
    });

    if (!resp.ok) {
      console.error('AppStorys: identifyWidgetPositions failed', resp.status, await resp.text());
    } else {
      console.info('AppStorys: identifyWidgetPositions OK');
    }
  } catch (err) {
    console.error('AppStorys: identifyWidgetPositions error', err);
  }
}
