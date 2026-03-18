import { useEffect } from 'react'
import { AppStorys, Banner, Story } from '@appstorys/react-web'
import Floater from '../../../src/components/Floater';
import './App.css'
import fetchAllCampaigns from '../../../src/core/fetchAllCampaigns';
import useAppStorysStore from '../../../src/core/store';

function App() {
  const DEMO_SCREEN_NAME = 'Home Screen';

  useEffect(() => {
    const initSDK = async () => {
      try {
        console.log('[App] Initializing AppStorys SDK...');
        // Fetch and store all campaigns before initializing SDK
        const { campaigns } = await fetchAllCampaigns('12a9eac5-94ee-4735-9aa6-b8a94cb8fbbb');
        useAppStorysStore.getState().saveAllCampaigns(campaigns);
        console.log('[App] All campaigns fetched and saved:', campaigns);
        await AppStorys.initialize({
          appId: 'f69bdccf-b20f-4938-b39e-7075d76db791',
          accountId: '12a9eac5-94ee-4735-9aa6-b8a94cb8fbbb',
          baseUrl: window.location.origin + '/appstorys-users',
          trackingUrl: window.location.origin + '/appstorys-tracking',
          navigateToScreen: (screen) => {
            console.log('[App] Navigating to screen:', screen);
          }
        });
        console.log('[App] AppStorys SDK initialized. Tracking screen:', DEMO_SCREEN_NAME);
        await AppStorys.trackScreen(DEMO_SCREEN_NAME);
        console.log('[App] Screen tracked:', DEMO_SCREEN_NAME);
      } catch (error) {
        console.error('Failed to init SDK:', error);
      }
    };
    initSDK();
  }, []);

  return (
    <div className="App">
      <h1>AppStorys Web SDK Demo</h1>
      <p>The banner shouldn't appear below if a campaign is active for '{DEMO_SCREEN_NAME}' screen.</p>

      <Story />
      <Banner />
      <Floater />

      <div className="card">
        <button onClick={() => AppStorys.trackEvent('button_click')}>
          Track Event
        </button>
      </div>
    </div>
  )
}

export default App
