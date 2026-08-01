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
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#000');
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
  'position:fixed;bottom:100px;right:40px;z-index:99999;width:56px;height:56px;border:2px solid #000;background:#facc15;color:#000;font-size:28px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;';

/** Floating collect button HTML template. */
const BUTTON_HTML = `<button id="ispv-collect" title="Collect to ISPV" style="${BTN_STYLE}">${BUTTON_REST}</button>`;

/** Notification toast styles for success, error, and warning states. */
const NOTIFICATION_STYLES = {
  success: { bg: '#22c55e', text: 'white', icon: '\u2713', message: 'Submitted to ISPV' },
  error: { bg: '#ef4444', text: 'white', icon: '\u2717', message: 'Failed to submit' },
  warning: { bg: '#facc15', text: 'black', icon: '\u26A0', message: '' },
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
    document.getElementById('ispv-collect').addEventListener('click', () => this.#collectData());
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

    const toast = document.createElement('div');
    toast.textContent = `${style.icon} ${message}`;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '170px',
      right: '40px',
      zIndex: '99999',
      padding: '12px 20px',
      borderRadius: '8px',
      border: '2px solid #000',
      background: style.bg,
      color: style.text,
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '4px 4px 0 #000',
      transition: 'opacity 0.3s ease',
      opacity: '1',
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

new ISPVCollector();
