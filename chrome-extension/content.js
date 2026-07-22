(function () {
  'use strict';

  const BUTTON_HTML = `
    <button id="reel-vault-collect" title="Collect to Reel Vault"
      style="position:fixed;bottom:24px;right:24px;z-index:99999;width:48px;height:48px;border:2px solid #000;border-radius:50%;background:#facc15;color:#000;font-size:28px;font-weight:700;cursor:pointer;box-shadow:4px 4px 0 #000;display:flex;align-items:center;justify-content:center;transition:all .15s;">
      +
    </button>
  `;

  function injectButton() {
    if (document.getElementById('reel-vault-collect')) return;
    document.body.insertAdjacentHTML('beforeend', BUTTON_HTML);

    document.getElementById('reel-vault-collect').addEventListener('click', collectData);
  }

  function getMetaContent(property) {
    const el = document.querySelector(`meta[property="${property}"]`);
    return el ? el.getAttribute('content') : null;
  }

  function findShareDateTime() {
    // Try multiple aria-label patterns for the share button
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
      if (shareEl) break;
    }

    if (shareEl) {
      const parentDiv = shareEl.closest('div');
      if (parentDiv) {
        const timeEl = parentDiv.querySelector('time');
        if (timeEl) return timeEl.getAttribute('datetime');
      }
    }

    // Fallback: find any time element with datetime on the page
    const allTimes = document.querySelectorAll('time[datetime]');
    for (const t of allTimes) {
      const val = t.getAttribute('datetime');
      if (val) return val;
    }

    return null;
  }

  async function collectData() {
    const ogImage = getMetaContent('og:image');
    const datetime = findShareDateTime();

    const data = { ig_url: window.location.href, og_image: ogImage, ig_post_date: datetime };

    try {
      const res = await fetch('https://your-admin-app.vercel.app/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + 'YOUR_API_TOKEN' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log('[Reel Vault] Enriched:', result);
      alert('✅ Submitted to Reel Vault');
    } catch (err) {
      console.error('[Reel Vault] Error:', err);
      alert('❌ Failed to submit');
    }
  }

  // Wait for page to settle before injecting
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  // Re-inject on SPA navigation (Instagram is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(injectButton, 1500);
    }
  }).observe(document, { subtree: true, childList: true });
})();
