function pullUpdates() {
    const url = '/admin/pull-updates/';
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

            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No tournaments available.</td></tr>';
                return;
            }
            const rows = data.data.map(tournament => `
            <tr>
                <td>${tournament.title}</td>
                <td>${tournament.status}</td>
                <td>${tournament['register-end']}</td>
                <td>${tournament['players-size']}</td>
                <td><button onclick="window.location.href='/admin/tournaments/modify/?guid=${tournament.guid}';">Modify</button></td>
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

function createMapPool() {
    const name = document.getElementById('mapPoolName').value.trim();
    if (!name) {
        alert('Please enter a name for the map pool.');
        return;
    }

    const url = '/admin/add-map-pool';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pool_name: name })
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('addPoolResMes').textContent = result.message;
        })
        .catch(error => {
            console.error('Error:', error)
            document.getElementById('addPoolResMes').textContent = 'Error: ' + error;
        });
}


function loadMapPools() {
    const url = '/admin/map-pool/';

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('map-pool-data');

            if (data.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No map pools available.</td></tr>';
                return;
            }
            const rows = data.data.map(Pool => `
            <tr>
                <td>${Pool.pool_name}</td>
                <td>${Pool.map_count}</td>
                <td><button onclick="window.location.href='/admin/map-pools/modify/?name=${Pool.pool_name}';">Modify</button></td>
            </tr>
        `).join('');

            tableBody.innerHTML = rows;
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error)
            document.getElementById('map-pool-data').innerHTML =
                '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const MapSearchInput = document.getElementById('MapSearchInput');

    MapSearchInput.addEventListener('input', (event) => {

        const url = '/admin/maps/?q=' + encodeURIComponent(event.target.value);

        fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const tableBody = document.getElementById('map-data');

                if (data.data.data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No maps available.</td></tr>';
                    return;
                }
                const rows = data.data.data.map(Map => `
            <tr>
                <td>${Map['map-title']}</td>
                <td>${Map['profile-name']}</td>
                <td><button onclick="addMapToPool('${Map.guid}', '${Map['map-id']}', '${Map['track'] || null}')">Add</button></td>
            </tr>
        `).join('');

                tableBody.innerHTML = rows;
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error)
                document.getElementById('map-data').innerHTML =
                    '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
            });
    });
})


function addMapToPool(mapGuid, map, track) {
    const poolName = document.getElementById('PoolName').value;
    if (!poolName || poolName.trim() === '') {
        alert('Please select a map pool first.');
        return;
    }

    const url = '/admin/add-map-to-map-pool';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ map_guid: mapGuid, pool_name: poolName, map: map, track: track })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
        })
        .catch(error => {
            console.error('Error:', error)
            alert('Error: ' + error);
        });
}


function CreateAPIKey() {
    const uid = document.getElementById("uid").value
    const name = document.getElementById("name").value
    const url = '/admin/createapiKey/';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({uid: uid, name: name})
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            document.getElementById("token").value = result.message
        })
        .catch(error => {
            console.error('Error:', error)
            alert('Error: ' + error);
        });
}

function loadapiKeys() {
    const url = '/admin/apikey/';

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('api-key-data');
            if (data.body.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No map pools available.</td></tr>';
                return;
            }
            const rows = data.body.map(Pool => `
            <tr>
                <td>${Pool.name}</td>
                <td>${Pool.token}</td>
                <td>${Pool.uid}</td>
                <td><button onclick="RemoveApiKey('${Pool.uid}')">Revoke</button></td>
            </tr>
        `).join('');

            tableBody.innerHTML = rows;
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error)
            document.getElementById('map-pool-data').innerHTML =
                '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
        });
}

function RemoveApiKey(uid){
    const url = "/admin/removeapikey/"
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({uid: uid})
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
        })
        .catch(error => {
            console.error('Error:', error)
            alert('Error: ' + error);
        });
}