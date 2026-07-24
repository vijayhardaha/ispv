/**
 * ======================================================================
 * ISPV Helper — Options Page Script
 * ======================================================================
 * Purpose: Manages the options page UI for securely storing API
 *          credentials (token + admin URL) in chrome.storage.sync.
 * ======================================================================
 */

'use strict';

/** Storage key constants (must match background.js) */
const STORAGE_KEYS = { API_TOKEN: 'ispv_api_token', ADMIN_URL: 'ispv_admin_url' };

/** Default admin URL (must match background.js) */
const DEFAULT_ADMIN_URL = 'http://localhost:3001';

// ----------------------------------------------------------------------
// DOM References
// ----------------------------------------------------------------------

/** Admin URL input element. */
const adminUrlInput = document.getElementById('admin-url');
/** API token input element. */
const apiTokenInput = document.getElementById('api-token');
/** Save settings button element. */
const saveButton = document.getElementById('save-btn');
/** Status message display element. */
const statusEl = document.getElementById('status');

// ----------------------------------------------------------------------
// Status Helpers
// ----------------------------------------------------------------------

/**
 * Shows a status message to the user.
 *
 * @param {'success' | 'error'} type - The status type determining visual styling.
 * @param {string} message - The status message text to display.
 */
function showStatus(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

/**
 * Clears the status message.
 */
function clearStatus() {
  statusEl.className = 'status';
  statusEl.textContent = '';
}

// ----------------------------------------------------------------------
// Storage Operations
// ----------------------------------------------------------------------

/**
 * Loads saved credentials from chrome.storage.sync and populates the form.
 */
async function loadCredentials() {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEYS.API_TOKEN, STORAGE_KEYS.ADMIN_URL]);
    adminUrlInput.value = result[STORAGE_KEYS.ADMIN_URL] ?? '';
    apiTokenInput.value = result[STORAGE_KEYS.API_TOKEN] ?? '';
  } catch (err) {
    console.error('[ISPV Options] Failed to load credentials:', err);
  }
}

/**
 * Saves credentials to chrome.storage.sync.
 */
async function saveCredentials() {
  const adminUrl = adminUrlInput.value.trim() || DEFAULT_ADMIN_URL;
  const apiToken = apiTokenInput.value.trim();

  // Normalise the admin URL: strip trailing slash
  const normalisedUrl = adminUrl.replace(/\/+$/, '');

  const toStore = { [STORAGE_KEYS.ADMIN_URL]: normalisedUrl };

  // Only store the token if the user provided one; if empty, don't clear it
  // unless they explicitly want to (empty = keep existing).
  if (apiToken) {
    toStore[STORAGE_KEYS.API_TOKEN] = apiToken;
  } else {
    // If user cleared the field, ask for confirmation before removing
    const existing = await chrome.storage.sync.get(STORAGE_KEYS.API_TOKEN);
    if (existing[STORAGE_KEYS.API_TOKEN]) {
      const confirmed = confirm('Clear the stored API token? Leave the field empty to keep the existing token.');
      if (!confirmed) {
        // Reload the existing token back into the field
        apiTokenInput.value = existing[STORAGE_KEYS.API_TOKEN];
        return;
      }
    }
    // User confirmed or there was no existing token — store empty to clear
    toStore[STORAGE_KEYS.API_TOKEN] = '';
  }

  try {
    await chrome.storage.sync.set(toStore);
    showStatus('success', 'Settings saved successfully.');

    // Clear the status after 3 seconds
    setTimeout(clearStatus, 3000);
  } catch (err) {
    console.error('[ISPV Options] Failed to save credentials:', err);
    showStatus('error', `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// ----------------------------------------------------------------------
// Event Handlers
// ----------------------------------------------------------------------

/**
 * Handles the Save button click.
 */
async function onSave() {
  saveButton.disabled = true;
  saveButton.textContent = 'Saving\u2026';

  try {
    await saveCredentials();
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save Settings';
  }
}

// ----------------------------------------------------------------------
// Initialisation
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  loadCredentials();
  saveButton.addEventListener('click', onSave);
});
