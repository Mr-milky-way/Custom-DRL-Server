
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