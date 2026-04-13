import { getAccessToken, getUserId } from './store';
import verifyAccount from './verifyAccount';
import useAppStorysStore from './store';

type LayoutFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  screenWidth?: number;
  screenHeight?: number;
};

type LayoutInfo = { id: string; frame: LayoutFrame };

const layoutData: Record<string, LayoutInfo[]> = {};

function ensureList(screenName: string) {
  if (!layoutData[screenName]) layoutData[screenName] = [];
  return layoutData[screenName];
}

/**
 * Build a fresh FormData for the identify-elements request.
 */
function buildFormData(
  screenName: string,
  userId: string,
  children: string,
  blob: Blob
): FormData {
  const form = new FormData();
  
  // Sanitize screenName for filename
  const safeScreenName = screenName.replace(/[^a-z0-9]/gi, '_');
  const filename = `screenshot_${userId}_${safeScreenName}_${Date.now()}.png`;

  const file = new File([blob], filename, { type: 'image/png' });

  form.append('screenName', screenName);
  form.append('user_id', userId);
  form.append('children', children);
  form.append('screenshot', file);

  // Diagnostic logging
  try {
    console.groupCollapsed('AppStorys: FormData Payload Diagnostic');
    console.info('  screenName:', screenName);
    console.info('  user_id:', userId);
    console.info('  children:', JSON.parse(children));
    console.info('  screenshot:', file.name, `(${file.size} bytes)`);
    console.groupEnd();
  } catch (e) {
    console.warn('AppStorys: Could not run FormData diagnostics', e);
  }

  return form;
}

export default class CaptureService {
  static setup(screenName: string, enabled: boolean) {
    const s = useAppStorysStore.getState();
    s.setScreenCaptureEnabled(enabled);
    s.setCurrentScreen(screenName);
  }

  /**
   * Manually add layout information for an element.
   */
  static addLayoutInfo(screenName: string, id: string, frame: LayoutFrame) {
    const list = ensureList(screenName);
    const idx = list.findIndex(l => l.id === id);
    
    // Auto-fill screen dimensions if missing
    const enrichedFrame: LayoutFrame = {
      ...frame,
      screenWidth: frame.screenWidth || window.innerWidth,
      screenHeight: frame.screenHeight || window.innerHeight,
    };

    const info = { id, frame: enrichedFrame };
    if (idx >= 0) list[idx] = info; else list.push(info);
  }

  /**
   * Automatically collect all elements marked with [data-as-id].
   */
  static collectElements(screenName: string) {
    this.clearLayoutData(screenName);
    const elements = document.querySelectorAll('[data-as-id]');
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const foundIds: string[] = [];

    elements.forEach((el) => {
      const id = el.getAttribute('data-as-id');
      if (id) {
        foundIds.push(id);
        const rect = el.getBoundingClientRect();
        this.addLayoutInfo(screenName, id, {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          screenWidth,
          screenHeight
        });
      }
    });

    console.info(`AppStorys: Identified ${elements.length} elements:`, foundIds);
  }

  static clearLayoutData(screenName: string) {
    layoutData[screenName] = [];
  }

  static getLayoutData(screenName: string) {
    return layoutData[screenName] || [];
  }

  static async takeScreenshot(screenName: string, positionList?: string[]) {
    try {
      if (!screenName) {
        console.error('AppStorys: Screen name is required');
        return false;
      }

      console.info('AppStorys: Starting takeScreenshot for', screenName);

      const s = useAppStorysStore.getState();
      s.setCurrentScreen(screenName);

      // ── Step 0: Auto-collect elements before capture ──────────────────
      this.collectElements(screenName);

      await new Promise(resolve => setTimeout(resolve, 100));

      // ── Step 1: Capture ────────────────────────────────────────────────
      const win: any = window as any;
      let blob: Blob | null = null;

      if (typeof win.html2canvas !== 'function') {
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load html2canvas'));
            document.head.appendChild(script);
          });
        } catch (loadErr) {
          console.warn('AppStorys: html2canvas load error', loadErr);
        }
      }

      if (typeof win.html2canvas === 'function') {
        try {
          const canvas = await win.html2canvas(document.documentElement, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            scale: window.devicePixelRatio || 1,
          });
          blob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob((b: Blob | null) => resolve(b), 'image/png')
          );
        } catch (err) {
          console.warn('AppStorys: html2canvas capture failed (falling back to getDisplayMedia)', err);
          blob = null;
        }
      }

      if (!blob && navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
        try {
          const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || window.innerWidth;
          canvas.height = video.videoHeight || window.innerHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          blob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob((b: Blob | null) => resolve(b), 'image/png')
          );
          video.pause();
          stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        } catch (err) {
          console.warn('AppStorys: getDisplayMedia capture failed', err);
        }
      }

      if (!blob) {
        console.warn('AppStorys: Capture failed — no blob generated');
        return false;
      }

      // ── Step 2: Auth ──────────────────────────────────────────────────
      let accessToken = await getAccessToken();
      const userId = getUserId();

      if (!userId) {
        console.warn('AppStorys: No userId');
        return false;
      }

      if (!accessToken) {
        const state = useAppStorysStore.getState();
        if (state.accountId && state.appId && state.userId) {
          const refreshed = await verifyAccount(state.accountId, state.appId, state.userId);
          if (refreshed) accessToken = await getAccessToken();
        }
      }

      if (!accessToken) {
        console.warn('AppStorys: No token available');
        return false;
      }

      // ── Step 3: Send ───────────────────────────────────────────────────
      const endpoint = 'https://backend.appstorys.co/api/v1/appinfo/identify-elements/';
      const children = JSON.stringify(this.getLayoutData(screenName) || []);
      
      const body = buildFormData(screenName, userId, children, blob);
      
      console.info('AppStorys: Sending identify-elements with payload size:', children.length);

      let resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: body,
      });

      if (resp.status === 401) {
        console.warn('AppStorys: 401 response — retrying once');
        const state = useAppStorysStore.getState();
        if (state.accountId && state.appId && state.userId) {
          const refreshed = await verifyAccount(state.accountId, state.appId, state.userId);
          if (refreshed) {
            const newToken = await getAccessToken();
            if (newToken) {
              resp = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Accept': 'application/json'
                },
                body: buildFormData(screenName, userId, children, blob),
              });
            }
          }
        }
      }

      if (!resp.ok) {
        const text = await resp.text();
        console.error('AppStorys: identify-elements failed', resp.status, text);
        return false;
      }

      console.info('AppStorys: identify-elements success ✓');
      return true;
    } catch (err) {
      console.error('AppStorys: takeScreenshot error', err);
      return false;
    }
  }
}

export type { LayoutFrame, LayoutInfo };
