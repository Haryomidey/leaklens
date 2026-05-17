/**
 * LeakLens Content Script
 * This script runs in the context of the webpage.
 * It identifies risky assets, leaks, and configurations.
 */

console.log('LeakLens content script active');

// Placeholder for scanning logic
function scanForSecrets() {
  const scripts = Array.from(document.scripts);
  console.log(`LeakLens analyzed ${scripts.length} scripts on this page.`);
}

scanForSecrets();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PING') {
    sendResponse({ pong: true });
  }
});
