/**
 * ======================================================================
 * ISPV Helper — Background Service Worker
 * ======================================================================
 * Purpose: Securely manage API credentials and proxy authenticated
 *          requests from the content script to the ISPV Admin API.
 *
 * The API token is stored in chrome.storage.sync and never exposed to
 * the content script. All API calls originate from this worker.
 * ======================================================================
 */

'use strict';

/** Storage key constants */
const STORAGE_KEYS = { API_TOKEN: 'ispv_api_token', ADMIN_URL: 'ispv_admin_url' };

/** Default admin URL */
const DEFAULT_ADMIN_URL = 'http://localhost:3001';

// ----------------------------------------------------------------------
// Storage Helpers
// ----------------------------------------------------------------------

/**
 * Reads the stored API token and admin URL from chrome.storage.sync.
 *
 * @returns {Promise<{ token: string | null; adminUrl: string }>} Resolves with stored credentials or defaults.
 */
async function getCredentials() {
  const result = await chrome.storage.sync.get([STORAGE_KEYS.API_TOKEN, STORAGE_KEYS.ADMIN_URL]);
  return {
    token: result[STORAGE_KEYS.API_TOKEN] ?? null,
    adminUrl: result[STORAGE_KEYS.ADMIN_URL] ?? DEFAULT_ADMIN_URL,
  };
}

// ----------------------------------------------------------------------
// API Proxy
// ----------------------------------------------------------------------

/**
 * Forwards an authenticated API request from the content script.
 *
 * @param {object} payload - The request payload from the content script.
 * @param {string} payload.video_url - The Instagram reel URL.
 * @param {string | null} payload.og_image - Open Graph image URL.
 * @param {string | null} payload.video_post_date - Reel post date/time.
 *
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>} Resolves with the API response result.
 */
async function proxyEnrichRequest(payload) {
  const { token, adminUrl } = await getCredentials();

  if (!token) {
    return { success: false, error: 'API token not configured. Open extension options to set it.' };
  }

  const url = `${adminUrl.replace(/\/+$/, '')}/api/auth/enrich`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        video_url: payload.video_url,
        og_image: payload.og_image ?? null,
        video_post_date: payload.video_post_date ?? null,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errorMessage = errBody.error || errorMessage;
      } catch {
        // ignore parse failures
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown network error' };
  }
}

// ----------------------------------------------------------------------
// Message Handler
// ----------------------------------------------------------------------

/**
 * Handles messages from the content script and options page.
 *
 * Supported action types:
 *   - "enrich"          — Proxy an enrich API request
 *   - "get-status"      — Check if token is configured
 *
 * @param {object} message - The incoming runtime message with an action type and optional payload.
 * @param {chrome.runtime.MessageSender} sender - The sender of the message.
 * @param {(response: object) => void} sendResponse - Callback to send response back to the sender.
 *
 * @returns {boolean} true if the response is async (keep channel open).
 */
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'enrich': {
      proxyEnrichRequest(message.payload).then(sendResponse);
      return true; // keep channel open for async response
    }

    case 'get-status': {
      getCredentials().then(({ token }) => {
        sendResponse({ configured: token !== null });
      });
      return true;
    }

    default: {
      sendResponse({ success: false, error: `Unknown action: ${message.action}` });
      return false;
    }
  }
}

chrome.runtime.onMessage.addListener(handleMessage);

// ----------------------------------------------------------------------
// Installation Handler
// ----------------------------------------------------------------------

/**
 * Opens the options page on first install so the user can set their
 * API token and admin URL.
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});
