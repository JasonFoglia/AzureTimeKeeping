chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Periodically update badge (e.g., every 5 minutes)
chrome.alarms.create('updateBadge', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'updateBadge') {
        // Reuse the fetch logic from popup.js or call an API here
        // For simplicity, this is a placeholder
        chrome.action.setBadgeText({ text: '5' }); // Replace with actual count
    }
});