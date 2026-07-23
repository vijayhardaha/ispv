(function () {
  'use strict';

  const BUTTON_HTML = `
    <button id="reel-vault-collect" title="Collect to Reel Vault"
      style="position:fixed;bottom:100px;right:40px;z-index:99999;width:56px;height:56px;border:2px solid #000;border-radius:10px;background:#facc15;color:#000;font-size:28px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;">
      +
    </button>
  `;

  /**
   * Collects Instagram reel metadata and submits it to the Reel Vault API.
   * Injects a floating collect button, attaches event handlers, and observes
   * SPA navigation to re-inject on page changes.
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

    /**
     * Collects page metadata (og:image, share date-time) and sends it to the
     * Reel Vault enrich API for processing.
     *
     * @returns {Promise<void>}
     */
    async #collectData() {
      const ogImage = this.#getMetaContent('og:image');
      const datetime = this.#findShareDateTime();
      const data = { ig_url: window.location.href, og_image: ogImage, ig_post_date: datetime };

      try {
        const res = await fetch('http://localhost:3001/api/auth/enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + 'IJdf1kBXLxnW2AO8rG8rVZT4j8JZL6A3',
          },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        console.log('[Reel Vault] Enriched:', result);
        alert('\u2705 Submitted to Reel Vault');
      } catch (err) {
        console.error('[Reel Vault] Error:', err);
        alert('\u274c Failed to submit');
      }
    }
  }

  new ReelVaultCollector();
})();
