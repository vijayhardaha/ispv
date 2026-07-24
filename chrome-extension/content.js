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

/** Floating collect button HTML template. */
const BUTTON_HTML = `
  <button id="reel-vault-collect" title="Collect to Reel Vault"
    style="position:fixed;bottom:100px;right:40px;z-index:99999;width:56px;height:56px;border:2px solid #000;border-radius:10px;background:#facc15;color:#000;font-size:28px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;">
    +
  </button>
`;

/** Notification toast styles for success, error, and warning states. */
const NOTIFICATION_STYLES = {
  success: { bg: '#22c55e', text: 'white', icon: '\u2713', message: 'Submitted to Reel Vault' },
  error: { bg: '#ef4444', text: 'white', icon: '\u2717', message: 'Failed to submit' },
  warning: { bg: '#facc15', text: 'black', icon: '\u26A0', message: '' },
};

/**
 * Collects Instagram reel metadata and submits it to the ISPV Admin API
 * via the background service worker (token never touches the content script).
 */
class ReelVaultCollector {
  /** @type {string | null} */
  #lastUrl;

  /** @type {MutationObserver | null} */
  #observer;

  constructor() {
    this.#lastUrl = location.href;
    this.#observer = null;
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
    if (document.getElementById('reel-vault-collect')) {
      return;
    }

    if (!document.body) {
      setTimeout(() => this.#injectButton(), 200);
      return;
    }

    document.body.insertAdjacentHTML('beforeend', BUTTON_HTML);
    document.getElementById('reel-vault-collect').addEventListener('click', () => this.#collectData());
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
    const ogImage = this.#getMetaContent('og:image');
    const datetime = this.#findShareDateTime();

    const payload = { video_url: window.location.href, og_image: ogImage, video_post_date: datetime };

    try {
      const response = await chrome.runtime.sendMessage({ action: 'enrich', payload });

      if (!response || !response.success) {
        throw new Error(response?.error ?? 'No response from background worker');
      }

      console.log('[Reel Vault] Enriched:', response.data);
      this.#showNotification('success');
    } catch (err) {
      console.error('[Reel Vault] Error:', err);

      if (err.message && err.message.includes('token not configured')) {
        this.#showNotification('warning', 'Configure API token in extension options');
        chrome.runtime.openOptionsPage();
      } else {
        this.#showNotification('error');
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

new ReelVaultCollector();
