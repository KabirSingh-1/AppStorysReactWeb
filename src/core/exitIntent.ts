import useAppStorysStore from "./store";
import { isBackPressCampaignReady, BACK_PRESS_SENTINEL } from "../hooks/useCampaigns";

/**
 * Manages 'Exit Intent' or 'Back Press' behavior for the Web SDK.
 * This translates the mobile back button behavior to web-friendly triggers:
 * 1. Mouse leaving the viewport towards the top (classic exit intent).
 * 2. Intercepting the browser's back button via the PopState API.
 */
class ExitIntentManager {
  private isInitialized = false;

  public setup() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 1. Mouse Move / Exit Intent
    document.addEventListener('mouseleave', this.handleMouseLeave);

    // 2. Browser Back Button (PopState)
    window.addEventListener('popstate', this.handlePopState);
    
    // We should push an initial state so we can intercept the first back press
    if (window.history.state !== 'appstorys_navigation') {
        window.history.pushState('appstorys_navigation', '');
    }

    this.isInitialized = true;
  }

  public destroy() {
    if (!this.isInitialized || typeof window === 'undefined') return;
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('popstate', this.handlePopState);
    this.isInitialized = false;
  }

  private handleMouseLeave = (e: MouseEvent) => {
    // Only trigger if mouse leaves the TOP of the window
    if (e.clientY <= 0 && isBackPressCampaignReady()) {
      this.triggerCampaign();
    }
  };

  private handlePopState = () => {
    if (isBackPressCampaignReady()) {
      // Prevent default navigation
      window.history.pushState('appstorys_navigation', '');
      this.triggerCampaign();
    }
  };

  private triggerCampaign() {
    const state = useAppStorysStore.getState();
    const { trackedEvents } = state;

    if (!trackedEvents.includes(BACK_PRESS_SENTINEL)) {
      console.log('AppStorys: Exit Intent triggered. Displaying campaign.');
      state.setTrackedEvents([...trackedEvents, BACK_PRESS_SENTINEL]);
    }
  }
}

export const exitIntentManager = new ExitIntentManager();
