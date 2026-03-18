import useAppStorysStore from "./store";

/**
 * Manages the visibility state of the SDK.
 * It listens to the browser's Page Visibility API and updates the global store.
 * This is crucial for pausing/resuming resource-heavy operations like video playback (PiP).
 */
class VisibilityManager {
  private isInitialized = false;

  public setup() {
    if (this.isInitialized || typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Set initial state
    this.updateVisibility(document.visibilityState === 'visible');
    
    this.isInitialized = true;
  }

  public destroy() {
    if (!this.isInitialized || typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.isInitialized = false;
  }

  private handleVisibilityChange = () => {
    this.updateVisibility(document.visibilityState === 'visible');
  };

  /**
   * Updates the global SDK visibility state.
   * Can be called by the visibilitychange listener or manually via the public API.
   */
  public updateVisibility(isVisible: boolean) {
    const state = useAppStorysStore.getState();
    if (state.isVisible !== isVisible) {
      console.log(`AppStorys: SDK visibility changed to ${isVisible ? 'visible' : 'hidden'}`);
      state.setVisibility(isVisible);
    }
  }
}

export const visibilityManager = new VisibilityManager();
