// Dev helper: visually mark host elements that can receive widgets
declare global {
  interface Window {
    AppStorysShowWidgetElements?: () => void;
  }
}

function injectStyles() {
  if (document.getElementById('appstorys-widget-debug-styles')) return;
  const style = document.createElement('style');
  style.id = 'appstorys-widget-debug-styles';
  style.innerHTML = `
    .appstorys-widget-debug-pill {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #ff7a18;
      color: white;
      padding: 6px 10px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 12px;
      z-index: 2147483647;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      pointer-events: none;
    }
    .appstorys-widget-debug-overlay {
      outline: 3px dashed rgba(255,122,24,0.85);
      outline-offset: 6px;
    }
  `;
  document.head.appendChild(style);
}

function makePill(text: string) {
  const pill = document.createElement('div');
  pill.className = 'appstorys-widget-debug-pill';
  pill.textContent = text;
  return pill;
}

function ensureRelative(el: Element) {
  const node = el as HTMLElement;
  const computed = getComputedStyle(node);
  if (computed.position === 'static' || !computed.position) {
    node.style.position = 'relative';
  }
}

window.AppStorysShowWidgetElements = function showWidgetElements() {
  try {
    injectStyles();
    const matches = Array.from(document.querySelectorAll('[data-as-id], [data-widget], [data-widget-id]'));
    if (!matches.length) {
      // fallback: try obvious ids/classes used in examples
      const fallbacks = ['#hero_section', '.hero_section', '#header_container', '.header_container'];
      fallbacks.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) matches.push(el);
      });
    }

    if (!matches.length) {
      // last resort: mark body top-left
      const pill = makePill('Widget');
      pill.style.position = 'fixed';
      pill.style.top = '12px';
      pill.style.left = '12px';
      pill.style.pointerEvents = 'auto';
      document.body.appendChild(pill);
      return;
    }

    matches.forEach((el, idx) => {
      const target = el as HTMLElement;
      ensureRelative(target);
      target.classList.add('appstorys-widget-debug-overlay');
      // remove existing pill if present
      const existing = target.querySelector('.appstorys-widget-debug-pill');
      if (existing) existing.remove();
      const pill = makePill('Widget ' + (idx + 1));
      target.appendChild(pill);
    });
  } catch (err) {
    // swallow errors in dev helper
    // eslint-disable-next-line no-console
    console.error('AppStorysShowWidgetElements error', err);
  }
};

export {};
