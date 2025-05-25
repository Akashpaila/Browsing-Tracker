let activeTab = null;
let startTime = null;
let siteData = {};

// Load stored data on startup
chrome.storage.local.get(['siteData'], (result) => {
  siteData = result.siteData || {};
});

// Track when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      updateTimeForPreviousTab();
      activeTab = tab.id;
      startTime = Date.now();
    }
  });
});

// Track when a tab's URL changes or page loads
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.tabId === activeTab && details.url) {
    updateTimeForPreviousTab();
    startTime = Date.now();
    const url = new URL(details.url).hostname;
    if (!siteData[url]) {
      siteData[url] = { timeSpent: 0, visits: 0 };
    }
    siteData[url].visits += 1;
    saveData();
  }
});

// Update time when tab is updated with a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTab && changeInfo.url) {
    updateTimeForPreviousTab();
    startTime = Date.now();
    const url = new URL(changeInfo.url).hostname;
    if (!siteData[url]) {
      siteData[url] = { timeSpent: 0, visits: 0 };
    }
    siteData[url].visits += 1;
    saveData();
  }
});

// Handle tab close or browser focus change
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTimeForPreviousTab();
    activeTab = null;
  }
});

function updateTimeForPreviousTab() {
  if (activeTab && startTime) {
    chrome.tabs.get(activeTab, (tab) => {
      if (tab && tab.url) {
        const url = new URL(tab.url).hostname;
        const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds
        if (siteData[url]) {
          siteData[url].timeSpent += timeSpent;
        } else {
          siteData[url] = { timeSpent: timeSpent, visits: 1 };
        }
        saveData();
      }
    });
  }
}

function saveData() {
  chrome.storage.local.set({ siteData });
}