function pullUpdates() {
    const url = '/admin/pull-updates';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('ReqPullRes').textContent = result.message;
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById('ReqPullRes').textContent = 'Error: ' + error
        }
        );
}


function RestartServer() {
    const url = '/admin/reboot';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('ReqRebootRes').textContent = result.message;
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById('ReqRebootRes').textContent = "Connection lost (Server is likely restarting)";
        }
        );
}


function UpdateMapNumber() {
    const url = '/admin/maps-count';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('totalMapsNum').textContent = result.count.toString();
        })
        .catch(error => {
            console.error('Error:', error)
        });
}

function UpdateUserNumber() {
    const url = '/admin/users-count';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('totalUsersNum').textContent = result.count.toString();
        })
        .catch(error => {
            console.error('Error:', error)
        });
}

function UpdateLeaderboardEntriesNumber() {
    const url = '/admin/leaderboard-entries-count';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('leaderboardEntriesNum').textContent = result.count.toString();
        })
        .catch(error => {
            console.error('Error:', error)
        });
}


function UpdateTournamentNumber() {
    const url = '/admin/tournaments-count';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('totalTournamentsNum').textContent = result.count.toString();
        })
        .catch(error => {
            console.error('Error:', error)
        });
}


function loadTournaments() {
    const url = '/tournaments/';
    
    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('tournament-data');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No tournaments available.</td></tr>';
            return;
        }
        const rows = data.data.map(tournament => `
            <tr>
                <td>${tournament.title}</td>
                <td>${tournament.status}</td>
                <td>${tournament['register-end']}</td>
                <td>${tournament['players-size']}</td>
            </tr>
        `).join('');

        tableBody.innerHTML = rows;
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error)
        document.getElementById('tournament-data').innerHTML = 
            '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
    });
}
