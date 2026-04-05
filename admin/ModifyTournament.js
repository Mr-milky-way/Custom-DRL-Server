const urlParams = new URLSearchParams(window.location.search);
const guid = urlParams.get('guid');

window.onload = function () {
    fetch(`/tournaments/${guid}/`)
        .then(res => res.json())
        .then(data => {
            const t = Array.isArray(data.data) ? data.data[0] : data.data;

            document.getElementById('id').value = t.id;
            document.getElementById('title').value = t.title;
            document.getElementById('description').value = t.description;
            document.getElementById('region').value = t.region;
            document.getElementById('status').value = t.status;
            document.getElementById('progression').value = t.progression;
            document.getElementById('max-players').value = t['max-players'];
            document.getElementById('register-end').value = t['register-end'].substring(0, 16);
            document.getElementById('register-start').value = t['register-start'].substring(0, 16);

            document.getElementById('allow-new-registration').value = t['allow-new-registration'];
            document.getElementById('disable-public-spectators').value = t['disable-public-spectators'];
            document.getElementById('private').value = t['private'];

            document.getElementById('drl-pilot-mode').value = t['drl-pilot-mode'];
            document.getElementById('countdown').value = t['countdown'];
        })
        .catch(err => console.error("Error loading tournament:", err));
};

function UpdateMapPools() {
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
            const tableBody = document.getElementById('MapPool');

            if (data.data.length === 0) {
                return;
            }
            const rows = [
                '<option value="">None</option>',
                ...data.data.map(Pool => `<option value="${Pool.pool_name}">${Pool.pool_name}</option>`)
            ].join('');

            tableBody.innerHTML = rows;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadTournamentRounds() {
    const url = `/tournaments/${guid}/`;

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('round-data');
            if (data.data[0].rounds.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="2">No Rounds available.</td></tr>';
                return;
            }

            // Clear any existing rows
            tableBody.innerHTML = '';

            data.data[0].rounds.forEach(round => {
                const tr = document.createElement('tr');

                const titleTd = document.createElement('td');
                titleTd.textContent = round.title;
                tr.appendChild(titleTd);

                const actionTd = document.createElement('td');
                const button = document.createElement('button');
                button.textContent = 'Modify';
                button.addEventListener('click', () => {
                    const targetUrl = `/admin/tournaments/modify/round/?RoundNumber=${encodeURIComponent(round.roundNumber)}&guid=${encodeURIComponent(guid)}`;
                    window.location.href = targetUrl;
                });
                actionTd.appendChild(button);

                tr.appendChild(actionTd);
                tableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error)
            document.getElementById('tournament-data').innerHTML =
                '<tr><td colspan="4">Failed to load data. Please try again later.</td></tr>';
        });
}