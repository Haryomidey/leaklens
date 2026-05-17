/**
 * LeakLens Background Service Worker
 * This script handles long-running tasks and inter-process communication
 * between the popup and content scripts.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeakLens extension installed');
});

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_SCAN_STATUS') {
    sendResponse({ status: 'idle' });
  }
});
