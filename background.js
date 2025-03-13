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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchTickets') {
        const { org, project } = request;
        const apiUrl = `https://dev.azure.com/${org}/${project}/_apis/wit/wiql?api-version=7.0`;
        const query = {
            query: "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.State] = 'Active'"
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                const workItemIds = data.workItems.map(item => item.id);
                return fetch(`https://dev.azure.com/${org}/_apis/wit/workitems?ids=${workItemIds.join(',')}&api-version=7.0`, {
                    credentials: 'include'
                });
            })
            .then(response => response.json())
            .then(tickets => sendResponse({ tickets }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep the message channel open for async response
    }
});