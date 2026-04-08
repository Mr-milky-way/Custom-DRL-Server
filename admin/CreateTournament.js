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

document.addEventListener('DOMContentLoaded', () => {
    const MapSearchInput = document.getElementById('MapSearchInput');
    const MapSelector = document.getElementById('MapSelector');

    MapSelector.addEventListener('change', (event) => {
        const selectedMapGuid = event.target.value;

        if (selectedMapGuid) {
            const url = `/admin/maps/?guid=${selectedMapGuid}`;

            fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    document.getElementById('map').value = data.data.data[0]['map-id'];
                    document.getElementById('track').value = data.data.data[0]['track'] ? data.data.data[0]['track'] : '';
                    document.getElementById('is-custom-map').value = data.data.data[0]['track'] ? false : true;
                    document.getElementById('custom-map-guid').value = data.data.data[0]['guid'];
                    document.getElementById('custom-map-title').value = data.data.data[0]['map-title'];
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    })

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
                const tableBody = document.getElementById('MapSelector');

                if (data.data.data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No maps available.</td></tr>';
                    return;
                }
                const rows = data.data.data.map(Map => `
                    <option value="${Map.guid}">${Map['map-title']}</option>
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


function SubmitForm() {
    try {
        const url = '/admin/tournaments/create/';

        const formData = {
            "automated": document.getElementById('automated').value === 'true',
            "recurr_every_days": parseInt(document.getElementById('recurr-every').value) || null,
            "map_pool": document.getElementById('MapPool').value || null,
            "map": document.getElementById('map').value || null,
            "track": document.getElementById('track').value || null,
            "is_custom_map": document.getElementById('is-custom-map').value === 'true',
            "custom_map_guid": document.getElementById('custom-map-guid').value || null,
            "custom_map_title": document.getElementById('custom-map-title').value || null,
            "id": document.getElementById('id').value || null,
            "title": document.getElementById('title').value || null,
            "description": document.getElementById('description').value || null,
            "call_to_action": document.getElementById('call-to-action').value || null,
            "prize-description": document.getElementById('prize-description').value || null,
            "prize-url": document.getElementById('prize-url').value || null,
            "image-url": document.getElementById('image-url').value || null,
            "video-url": document.getElementById('video-url').value || null,
            "streaming_url": document.getElementById('streaming-url').value || null,
            "terms_and_conditions_url": document.getElementById('terms-and-conditions-url').value || null,
            "reigon": document.getElementById('region').value || null,
            "max_players": parseInt(document.getElementById('max-players').value) || null,
            "register_start": document.getElementById('register-start').value || null,
            "register_end": document.getElementById('register-end').value || null,
            "status": document.getElementById('status').value || null,
            "type": document.getElementById('type').value || null,
            "progression": document.getElementById('progression').value || null,
            "allow_new_registration": document.getElementById('allow-new-registration').value === 'true',
            "lan_support": document.getElementById('lan-support').value === 'true',
            "server_ip": document.getElementById('server-ip').value || null,
            "disable_public_spectators": document.getElementById('disable-public-spectators').value === 'true',
            "private": document.getElementById('private').value === 'true',
            "penalty": document.getElementById('penalty').value === 'true',
            "drl_pilot_mode": document.getElementById('drl-pilot-mode').value === 'true',
            "drone_guid": document.getElementById('drone-guid').value || null,
            "drone_class": parseInt(document.getElementById('drone-class').value) || null,
            "countdown": document.getElementById('countdown').value === 'true',
            "minimum_skill": parseInt(document.getElementById('minimum-skill').value) || null,
            "age_check": document.getElementById('age-check').value === 'true',
            "age_check_number": parseInt(document.getElementById('age-check-number').value) || null
        }
        

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                window.location.href = '/admin/tournaments/';
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error)
            });
    } catch (error) {
        alert('Error: ' + error);
    }
}