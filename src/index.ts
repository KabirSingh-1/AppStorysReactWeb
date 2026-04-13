import { SdkState, InitializationOptions, Attributes } from './types';
import { Banner } from './components/Banner';
import { Pip } from './components/Pip';
import Floater from './components/Floater';
import trackEvent from './core/trackEvent';
import trackScreen from './core/trackScreen';
import verifyAccount from './core/verifyAccount';
import setUserProperties from './core/setUserProperties';
import { personalizeText } from './core/personalization';
import fetchAllCampaigns from './core/fetchAllCampaigns';
import useAppStorysStore from './core/store';
import { getAccessToken } from './core/store';
import reconcileAnonymousUser from './core/reconcileUser';
import { exitIntentManager } from './core/exitIntent';
import { visibilityManager } from './core/visibilityManager';
import { getOrCreateAnonymousUserId, getStoredAnonymousUserId, clearAnonymousUserId } from './core/userManagement';

class AppStorys {
  private state: SdkState = SdkState.uninitialized;
  private navigateToScreen?: (screen: string) => void;

  public async initialize(options: InitializationOptions) {
    const { appId, accountId, userId } = options;
    this.navigateToScreen = options.navigateToScreen;

    if (this.state === SdkState.initializing) return;

    if (this.state === SdkState.initialized) {
      const state = useAppStorysStore.getState();
      if (state.appId === appId && state.accountId === accountId && state.userId === userId) {
        return;
      }
    }

    this.state = SdkState.initializing;

    try {
      let finalUserId: string;
      let isAnonymous: boolean;

      if (!userId || userId.trim() === '') {
        finalUserId = await getOrCreateAnonymousUserId();
        isAnonymous = true;
      } else {
        const storedAnonymousUserId = await getStoredAnonymousUserId();
        if (storedAnonymousUserId && storedAnonymousUserId !== userId) {
          // Reconcile will happen after verification, matching RN logic
          console.log('AppStorys: Found previous anonymous user, will reconcile after verification.');
        }
        finalUserId = userId;
        isAnonymous = false;
      }

      const success = await verifyAccount(accountId, appId, finalUserId);
      if (!success) {
        this.state = SdkState.error;
        return;
      }

      // Step 1.5: Reconcile if we moved from anonymous to identified
      if (!isAnonymous) {
        const storedAnonymousUserId = await getStoredAnonymousUserId();
        if (storedAnonymousUserId && storedAnonymousUserId !== finalUserId) {
          await reconcileAnonymousUser(storedAnonymousUserId, finalUserId);
          await clearAnonymousUserId();
        }
      }

      // Fire a non-blocking call to track-user-res so it appears in the browser Network tab
      try {
        const accessToken = await getAccessToken();
        const usersBase = options.baseUrl || 'https://users.appstorys.co';
        // Fire-and-handle response to update store flags (do not block init)
        fetch(`${usersBase}/v2/${accountId}/track-user-res`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            user_id: finalUserId,
            screenName: (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '',
            silentUpdate: true,
          }),
        })
            .then(async (resp) => {
              if (!resp.ok) return;
              try {
                const data = await resp.json();
                const s = useAppStorysStore.getState();
                if (typeof data.screen_capture_enabled !== 'undefined') {
                  const val = Boolean(data.screen_capture_enabled);
                  console.info('AppStorys: track-user-res returned screen_capture_enabled=', val);
                  s.setScreenCaptureEnabled(val);
                }
              } catch (e) {
                /* ignore */
              }
            })
          .catch((err) => console.warn('track-user-res (init) failed', err));
      } catch (err) {
        console.warn('track-user-res (init) setup failed', err);
      }

      const { campaigns, version } = await fetchAllCampaigns(accountId);

      const state = useAppStorysStore.getState();
      state.setAppId(appId);
      state.setAccountId(accountId);
      state.setUserId(finalUserId);
      state.setIsAnonymousUser(isAnonymous);
      state.setBaseUrl(options.baseUrl);
      state.setTrackingUrl(options.trackingUrl);
      state.saveAllCampaigns(campaigns);
      state.setCampaignVersion(version);

      // After campaigns and store are populated, mount screen-capture button if enabled
      try {
        const s = useAppStorysStore.getState();
        if (s.screenCaptureEnabled) {
          const scModule = await import('./core/screenCapture');
          scModule.mountScreenCaptureButton();
        }
      } catch (err) {
        // mounting failure shouldn't block initialization
        console.warn('Failed to mount screen capture button', err);
      }

      // Initialize Exit Intent / Back Press listeners
      exitIntentManager.setup();

      // Initialize Visibility listeners
      visibilityManager.setup();

      this.state = SdkState.initialized;
    } catch (e) {
      this.state = SdkState.error;
      console.error('AppStorys initialization failed:', e);
    }
  }

  public async trackScreen(screenName: string) {
    await this.ensureInitialized();
    return trackScreen(screenName);
  }

  public async trackEvent(event: string, campaignId?: string, metadata?: Attributes) {
    await this.ensureInitialized();
    return trackEvent(event, campaignId, metadata);
  }

  public async setUserProperties(attributes: Attributes) {
    await this.ensureInitialized();
    return setUserProperties(attributes);
  }

  public handleLink(link: string | any) {
    if (!link) return;

    if (typeof link === 'string') {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        this.navigateToScreen?.(link);
      }
    } else if (typeof link === 'object' && link.value) {
      this.navigateToScreen?.(link.value);
    }
  }

  /**
   * Gets the visibility status of the SDK.
   * @returns boolean indicating whether the SDK is considered visible.
   */
  public get visibility(): boolean {
    return useAppStorysStore.getState().isVisible;
  }

  /**
   * Manually sets the visibility status of the SDK.
   * Useful for host apps that want to pause/resume SDK activities programmatically.
   * @param isVisible - boolean indicating visibility status.
   */
  public set visibility(isVisible: boolean) {
    visibilityManager.updateVisibility(isVisible);
  }

  private async ensureInitialized() {
    if (this.state === SdkState.initialized) return;

    const startTime = Date.now();
    while ((this.state as SdkState) !== SdkState.initialized) {
      if (this.state === SdkState.error) throw new Error('AppStorys SDK error');
      if (Date.now() - startTime > 10000) throw new Error('AppStorys SDK initialization timeout');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  public personalizeText(text: string): string {
    return personalizeText(text);
  }
}

import { Story } from './components/Story';
import { Widget } from './components/Widget';
import Tooltip from './components/Tooltip';
import { BottomSheet } from './components/BottomSheet';
import Csat from './components/Csat';

const instance = new AppStorys();
export { instance as AppStorys, Banner, Story, Pip, Widget, Floater, Tooltip, BottomSheet, Csat, personalizeText };
export * from './types';

