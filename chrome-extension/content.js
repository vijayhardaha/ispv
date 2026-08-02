/**
 * ======================================================================
 * ISPV Helper — Content Script
 * ======================================================================
 * Purpose: Injects a floating collect button on Instagram reel pages,
 *          scrapes page metadata, and sends it to the background worker
 *          for secure API submission.
 * ======================================================================
 */

'use strict';

/** Normal button content. */
const BUTTON_REST = '+';

/**
 * Creates an animated SVG spinner element using the Web Animations API.
 * Avoids CSS keyframes and innerHTML SVG parsing for MV3 extension reliability.
 *
 * @returns {SVGSVGElement} Animated spinner SVG element.
 */
function createSpinner() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#fff');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 2a10 10 0 0 1 10 10');
  svg.appendChild(path);

  // Animate using Web Animations API — no CSS keyframes needed
  // Apply animation to the SVG root, centered at 50% 50% (12px of 24px viewBox)
  svg.style.transformOrigin = '50% 50%';
  svg.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
    duration: 600,
    iterations: Infinity,
  });

  return svg;
}

/** Shared button style text (sans content). */
const BTN_STYLE =
  'position:fixed;bottom:24px;right:24px;z-index:99999;width:54px;height:54px;border:none;border-radius:50%;background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);color:#fff;font-size:26px;font-weight:600;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s ease,opacity .15s ease;box-shadow:0 4px 14px rgba(0,0,0,.18);';

/** Floating collect button HTML template. */
const BUTTON_HTML = `<button id="ispv-collect" title="Collect to ISPV" style="${BTN_STYLE}">${BUTTON_REST}</button>`;

/** Notification toast accent colors, icons, and messages for success, error, and warning states. */
const NOTIFICATION_STYLES = {
  success: { color: '#2ecc71', icon: '\u2713\uFE0E', message: 'Submitted to ISPV' },
  error: { color: '#ed4956', icon: '\u2717\uFE0E', message: 'Failed to submit' },
  warning: { color: '#f7a600', icon: '!', message: '' },
};

/**
 * Collects Instagram reel metadata and submits it to the ISPV Admin API
 * via the background service worker (token never touches the content script).
 */
class ISPVCollector {
  /** @type {string | null} */
  #lastUrl;

  /** @type {MutationObserver | null} */
  #observer;

  /** @type {boolean} */
  #busy;

  constructor() {
    this.#lastUrl = location.href;
    this.#observer = null;
    this.#busy = false;
    this.#init();
  }

  // --------------------------------------------------------------------
  // Initialisation
  // --------------------------------------------------------------------

  /**
   * Sets up DOM-ready injection and SPA navigation observer.
   */
  #init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.#injectButton());
    } else {
      this.#injectButton();
    }

    this.#observer = new MutationObserver(() => this.#onUrlChange());
    this.#observer.observe(document, { subtree: true, childList: true });
  }

  /**
   * Re-injects the collect button when the URL changes (SPA navigation).
   */
  #onUrlChange() {
    if (location.href !== this.#lastUrl) {
      this.#lastUrl = location.href;
      setTimeout(() => this.#injectButton(), 1500);
    }
  }

  // --------------------------------------------------------------------
  // Button Injection
  // --------------------------------------------------------------------

  /**
   * Inserts the floating collect button into the DOM if not already present.
   * Retries once if document.body is not yet available.
   */
  #injectButton() {
    if (document.getElementById('ispv-collect')) {
      return;
    }

    if (!document.body) {
      setTimeout(() => this.#injectButton(), 200);
      return;
    }

    document.body.insertAdjacentHTML('beforeend', BUTTON_HTML);
    const btn = document.getElementById('ispv-collect');
    btn.addEventListener('click', () => this.#collectData());
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.08)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  }

  // --------------------------------------------------------------------
  // Metadata Extraction
  // --------------------------------------------------------------------

  /**
   * Reads a meta tag's content attribute by property name.
   *
   * @param {string} property - The meta tag property value.
   *
   * @returns {string | null} The content attribute value, or null if not found.
   */
  #getMetaContent(property) {
    const el = document.querySelector(`meta[property="${property}"]`);
    return el ? el.getAttribute('content') : null;
  }

  /**
   * Extracts the share date-time from the Instagram post page.
   * Tries multiple selector patterns for the share button, then falls back
   * to any time element with a datetime attribute.
   *
   * @returns {string | null} The datetime string, or null if not found.
   */
  #findShareDateTime() {
    const shareSelectors = [
      'svg[aria-label="Share"]',
      'svg[aria-label="Share Post"]',
      'svg[aria-label="Share post"]',
      'button[aria-label="Share"]',
      'button[aria-label="Share Post"]',
    ];

    let shareEl = null;
    for (const sel of shareSelectors) {
      shareEl = document.querySelector(sel);
      if (shareEl) {
        break;
      }
    }

    if (shareEl) {
      const parentDiv = shareEl.closest('div');
      if (parentDiv) {
        const timeEl = parentDiv.querySelector('time');
        if (timeEl) {
          return timeEl.getAttribute('datetime');
        }
      }
    }

    // Fallback: any time element with datetime on the page
    const allTimes = document.querySelectorAll('time[datetime]');
    for (const t of allTimes) {
      const val = t.getAttribute('datetime');
      if (val) {
        return val;
      }
    }

    return null;
  }

  // --------------------------------------------------------------------
  // Submission
  // --------------------------------------------------------------------

  /**
   * Collects page metadata and sends it to the background worker.
   * The background worker handles authentication and API calls securely.
   */
  async #collectData() {
    if (this.#busy) return;
    this.#busy = true;

    const btn = document.getElementById('ispv-collect');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '';
      btn.appendChild(createSpinner());
      btn.style.opacity = '0.7';
      btn.style.cursor = 'wait';
    }

    const ogImage = this.#getMetaContent('og:image');
    const datetime = this.#findShareDateTime();

    const payload = { video_url: window.location.href, og_image: ogImage, video_post_date: datetime };

    try {
      const response = await chrome.runtime.sendMessage({ action: 'enrich', payload });

      if (!response || !response.success) {
        throw new Error(response?.error ?? 'No response from background worker');
      }

      console.log('[ISPV] Enriched:', response.data);
      this.#showNotification('success');
    } catch (err) {
      console.error('[ISPV] Error:', err);

      if (err.message && err.message.includes('token not configured')) {
        this.#showNotification('warning', 'Configure API token in extension options');
        chrome.runtime.openOptionsPage();
      } else {
        this.#showNotification('error');
      }
    } finally {
      this.#busy = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = BUTTON_REST;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    }
  }

  // --------------------------------------------------------------------
  // Notification Toast
  // --------------------------------------------------------------------

  /**
   * Shows a temporary toast notification on the page.
   *
   * @param {'success' | 'error' | 'warning'} type - Notification type.
   * @param {string} [customMessage] - Optional custom message override.
   */
  #showNotification(type, customMessage) {
    const style = NOTIFICATION_STYLES[type];
    const message = customMessage ?? style.message;
    const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    // Replace any visible toast so stacked notifications never overlap.
    document.querySelectorAll('.ispv-toast').forEach((t) => t.remove());

    const toast = document.createElement('div');
    toast.classList.add('ispv-toast');
    toast.style.cssText = `position:fixed;bottom:92px;right:24px;z-index:99999;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:#fff;font-family:${fontFamily};box-shadow:0 4px 20px rgba(0,0,0,.14);opacity:1;`;

    const icon = document.createElement('span');
    icon.textContent = style.icon;
    icon.style.cssText = `width:22px;height:22px;border-radius:50%;background:${style.color};color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;`;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'font-size:14px;font-weight:500;color:#262626;';

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    toast.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 200, easing: 'ease-out' }
    );

    setTimeout(() => {
      toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in' });
      // Hard-remove fallback in case the exit animation is throttled (e.g. background tab).
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }
}

new ISPVCollector();
