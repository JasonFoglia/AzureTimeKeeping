document.addEventListener('DOMContentLoaded', async () => {
    const ticketList = document.getElementById('ticketList');

    // Replace with your ADO organization, project, and PAT
    const org = 'your-org';
    const project = 'your-project';
    const pat = 'your-personal-access-token';
    const apiUrl = `https://dev.azure.com/${org}/${project}/_apis/wit/wiql?api-version=7.0`;

    // WIQL query to get active work items (tickets)
    const query = {
        query: "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.State] = 'Active'"
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        const workItemIds = data.workItems.map(item => item.id);

        // Fetch detailed work item info
        const detailsUrl = `https://dev.azure.com/${org}/_apis/wit/workitems?ids=${workItemIds.join(',')}&api-version=7.0`;
        const detailsResponse = await fetch(detailsUrl, {
            headers: { 'Authorization': 'Basic ' + btoa(':' + pat) }
        });
        const tickets = await detailsResponse.json();

        // Update badge with ticket count
        chrome.action.setBadgeText({ text: tickets.value.length.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });

        // Render tickets
        tickets.value.forEach(ticket => {
            const div = document.createElement('div');
            div.className = 'ticket';
            div.innerHTML = `
          <div class="ticket-title">${ticket.fields['System.Title']}</div>
          <div>ID: ${ticket.id} | State: ${ticket.fields['System.State']}</div>
          <div class="time-controls">
            <button onclick="startTimer(${ticket.id})">Start</button>
            <button onclick="stopTimer(${ticket.id})">Stop</button>
            <span id="time-${ticket.id}">00:00</span>
          </div>
        `;
            ticketList.appendChild(div);
        });

    } catch (error) {
        ticketList.innerHTML = 'Error loading tickets: ' + error.message;
    }
});

// Time tracking functions (basic implementation)
let timers = {};

function startTimer(ticketId) {
    if (!timers[ticketId]) {
        timers[ticketId] = {
            startTime: Date.now(),
            interval: setInterval(() => updateTime(ticketId), 1000)
        };
    }
}

function stopTimer(ticketId) {
    if (timers[ticketId]) {
        clearInterval(timers[ticketId].interval);
        delete timers[ticketId];
        // Here you can add code to save the time (you mentioned handling this part)
    }
}

function updateTime(ticketId) {
    const elapsed = Math.floor((Date.now() - timers[ticketId].startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById(`time-${ticketId}`).textContent = `${minutes}:${seconds}`;
}