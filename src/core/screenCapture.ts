import useAppStorysStore from './store';
import CaptureService from './CaptureService';

function injectStyles() {
  if (document.getElementById('appstorys-capture-styles')) return;
  const style = document.createElement('style');
  style.id = 'appstorys-capture-styles';
  style.innerHTML = `
    @keyframes appstorys-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .appstorys-spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid #fff;
      border-radius: 50%;
      animation: appstorys-spin 0.8s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

function createButton(): HTMLButtonElement {
  injectStyles();
  const btn = document.createElement('button');
  btn.id = 'appstorys-screen-capture-btn';
  btn.title = 'Capture screen';
  Object.assign(btn.style, {
    position: 'fixed',
    left: '16px',
    bottom: '16px',
    width: '100px',
    height: '56px',
    borderRadius: '28px',
    background: '#ff6a00',
    color: '#fff',
    border: 'none',
    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
    zIndex: '2147483647',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'sans-serif',
    transition: 'all 0.2s ease'
  } as CSSStyleDeclaration);
  btn.innerText = 'Capture';
  return btn;
}

export function mountScreenCaptureButton() {
  try {
    const state = useAppStorysStore.getState();
    const win: any = window as any;
    const debugForce = Boolean(win.__APPSTORYS_DEBUG_CAPTURE);
    console.info('AppStorys: mountScreenCaptureButton called, screenCaptureEnabled=', state.screenCaptureEnabled, 'debugForce=', debugForce);
    
    if (!state.screenCaptureEnabled && !debugForce) {
      return null;
    }

    if (document.getElementById('appstorys-screen-capture-btn')) return null;

    const btn = createButton();

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const originalText = btn.innerText;
      btn.innerHTML = '<div class="appstorys-spinner"></div>';
      
      const s = useAppStorysStore.getState();
      const screenName = s.currentScreen || (typeof window !== 'undefined' ? window.location.pathname : '');
      
      try {
        await CaptureService.takeScreenshot(screenName);
      } catch (err) {
        console.error('CaptureService error', err);
      }
      
      btn.disabled = false;
      btn.innerText = originalText;
      btn.animate([{ transform: 'scale(1.0)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1.0)' }], { duration: 300 });
    });

    document.body.appendChild(btn);
    console.info('AppStorys: screen capture button mounted');
    return btn;
  } catch (err) {
    console.error('mountScreenCaptureButton error', err);
    return null;
  }
}

// Expose a helper for dev to mount manually from console
try {
  (window as any).AppStorysMountCapture = function() {
    try {
      return mountScreenCaptureButton();
    } catch (e) {
      console.error('AppStorysMountCapture failed', e);
      return null;
    }
  };
} catch (e) {
  // ignore
}

// Expose a helper to inspect store state from the console
try {
  (window as any).AppStorysDebugState = function() {
    try {
      const s = useAppStorysStore.getState();
      console.info('AppStorys store state:', s);
      return s;
    } catch (e) {
      console.error('AppStorysDebugState failed', e);
      return null;
    }
  };
} catch (e) {
  // ignore
}

// Expose a helper to debug token
try {
  (window as any).AppStorysDebugToken = function() {
    try {
      const token = localStorage.getItem('access_token') || '';
      const len = token.length;
      const masked = token ? token.slice(0, 20) + '...' + token.slice(-10) : '(none)';
      console.info('Token length:', len, 'masked:', masked);
      if (token && token.includes('.')) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.info('Token payload:', payload);
            if (payload.exp) {
              const exp = new Date(payload.exp * 1000);
              const now = new Date();
              console.info('Token expires:', exp.toISOString(), 'Expired:', now > exp);
            }
          }
        } catch (e) {
          console.warn('Could not decode JWT:', e);
        }
      }
      return token ? 'Token present' : 'No token';
    } catch (e) {
      console.error('AppStorysDebugToken failed', e);
      return null;
    }
  };
} catch (e) {
  // ignore
}
