const rateLimit = require('express-rate-limit');
const UsernameGenerator = require('unique-username-generator');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const querystring = require('querystring');
const db = new sqlite3.Database('main.db');
const Tracks = require('./tracks.json')
const Ctracks = require('./Ctracks.json')

const multer = require('multer');
const { log } = require('console');
const replayCloud = multer({ dest: 'replay-cloud/' });

const app = express();
const PORT = 8080;

/*
-------------------------------------------------
████████╗ █████╗ ██████╗ ██╗     ███████╗███████╗
╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
   ██║   ███████║██████╔╝██║     █████╗  ███████╗
   ██║   ██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
   ██║   ██║  ██║██████╔╝███████╗███████╗███████║
   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
-------------------------------------------------
*/

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS user (uid TEXT UNIQUE, token TEXT, expires INTEGER, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS playerstate (uid TEXT UNIQUE, json TEXT)");
    db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT,
    profile_platform_id TEXT,
    username TEXT,
    profile_color TEXT,
    profile_thumb TEXT,
    profile_name TEXT,
    profile_platform TEXT,
    map TEXT,
    track TEXT,
    is_custom_map BOOLEAN,
    custom_map TEXT,
    mission TEXT,
    group_id TEXT,
    region TEXT,
    replay_url TEXT,
    game_type TEXT,
    diameter INT,
    drone_name TEXT,
    drone_thumb TEXT,
    multiplayer BOOLEAN,
    multiplayer_room_id TEXT,
    multiplayer_room_size INT,
    multiplayer_player_id TEXT,
    multiplayer_master_id TEXT,
    multiplayer_player_position INT,
    flag_url TEXT,
    score_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    match_id TEXT,
    tryouts BOOLEAN,
    battery_resistance FLOAT,
    controller_type TEXT,
    position INT,
    score INT,
    score_check INT,
    score_double_check INT,
    score_cheat BOOLEAN,
    score_cheat_ratio FLOAT,
    score_cheat_samples TEXT,
    crash_count INT,
    top_speed FLOAT,
    time_in_first FLOAT,
    lap_times TEXT,
    gate_times TEXT,
    fastest_lap INT,
    slowest_lap INT,
    total_distance FLOAT,
    percentile FLOAT,
    order_col INT,
    high_score BOOLEAN,
    race_id TEXT,
    limit_col INT,
    heat INT,
    custom_physics BOOLEAN,
    drl_official BOOLEAN,
    drl_pilot_mode BOOLEAN,
    drone_guid TEXT,
    drone_rig TEXT,
    drone_hash TEXT
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS playerprogression (
        uid TEXT UNIQUE,
        xp INT,
        previous_level_xp INT,
        next_level_xp INT,
        level INT,
        rank_name TEXT,
        rank_index INT,
        rank_position INT,
        rank_round_start TEXT,
        rank_round_end TEXT,
        league TEXT,
        streak_date_start TEXT,
        streak_date_end TEXT,
        streak_points INT,
        daily_completed_maps INT,
        goal_daily_completed_maps INT,
        prizes TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS playerweeklyprogression (
        uid TEXT UNIQUE,
        xp INT,
        previous_level_xp INT,
        next_level_xp INT,
        level INT,
        rank_name TEXT,
        rank_index INT,
        rank_position INT,
        rank_round_start TEXT,
        rank_round_end TEXT,
        league TEXT,
        streak_date_start TEXT,
        streak_date_end TEXT,
        streak_points INT,
        daily_completed_maps INT,
        goal_daily_completed_maps INT,
        prizes TEXT);`);
    //db.run("DROP TABLE playerprogression")
});

/*
----------------------------------------------------------------------------------------------------------------------
███╗   ███╗ █████╗ ██████╗ ███████╗     █████╗ ███╗   ██╗██████╗     ████████╗██████╗  █████╗  ██████╗██╗  ██╗███████╗
████╗ ████║██╔══██╗██╔══██╗██╔════╝    ██╔══██╗████╗  ██║██╔══██╗    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝
██╔████╔██║███████║██████╔╝███████╗    ███████║██╔██╗ ██║██║  ██║       ██║   ██████╔╝███████║██║     █████╔╝ ███████╗
██║╚██╔╝██║██╔══██║██╔═══╝ ╚════██║    ██╔══██║██║╚██╗██║██║  ██║       ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ ╚════██║
██║ ╚═╝ ██║██║  ██║██║     ███████║    ██║  ██║██║ ╚████║██████╔╝       ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝        ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝
----------------------------------------------------------------------------------------------------------------------
*/

app.use('/tracks', express.static(path.join(__dirname, 'tracks')));

app.get('/maps/:guid', (req, res) => {
    const guid = req.params.guid;
    console.log("/maps/ MAPS", guid);

    // Filter the tracks if GUID exists
    const mapData = Tracks.filter(track => track.guid === guid);

    console.log(mapData)
    res.status(200).json({
        success: true,
        data: {
            paging: {
                "page-total": 1,   // total number of pages
                "page": 1,                 // current page
                "next-page-url": "",       // URL for next page, empty if none
                "previous-page-url": ""    // URL for previous page, empty if none
            },
            data: mapData                  // array of items
        }
    });
});

app.get('/progression/maps/', (req, res) => {
    let progressionMaps = [
    ];
    for (let i = 0; i < Tracks.length; i++) {
        let data = {
            guid: Tracks[i].guid,
            "name": Tracks[i]["map-title"],
            "xp-value": Tracks[i]["xp-value"]
        }
        progressionMaps.push(data);
    }

    res.status(200).json({
        success: true, data: progressionMaps
    });
})

app.get('/maps/', (req, res) => {
    console.log(req.headers);
    res.status(200).json({ success: true, data: { data: Ctracks, "pagging": { "page": 1, "limit": 10, "page-total": 2 } } });
})

app.get('/maps/updated/', (req, res) => {
    console.log("/maps/updated/ MAPS")
    const payload = Tracks;
    res.status(200).json({ success: true, data: payload });
})


app.get('/maps/user/updated/', (req, res) => {
    console.log("/maps/user/updated/ MAPS")
    const payload = Ctracks;
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: Ctracks });
})


/*
---------------------------------------------------------------------------------------------------------
███████╗████████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗    ███████╗████████╗██╗   ██╗███████╗███████╗
██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝    ██╔════╝╚══██╔══╝██║   ██║██╔════╝██╔════╝
███████╗   ██║   ██║   ██║██████╔╝███████║██║  ███╗█████╗      ███████╗   ██║   ██║   ██║█████╗  █████╗
╚════██║   ██║   ██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝      ╚════██║   ██║   ██║   ██║██╔══╝  ██╔══╝
███████║   ██║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗    ███████║   ██║   ╚██████╔╝██║     ██║
╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
---------------------------------------------------------------------------------------------------------
*/

app.post('/storage/logs/', (req, res) => {
    res.status(200).json({ success: true });
})

app.post('/storage/replay-cloud/', replayCloud.single('file'), (req, res) => {
    console.log(req.headers);
    console.log(req.body); // Text fields are in req.body
    console.log(req.file);
    res.status(200).json({ success: true });
})

app.post('/storage/image/', (req, res) => {
    res.status(200).json({ success: true });
})


/*
---------------------------------------
██╗      ██████╗  ██████╗ ██╗███╗   ██╗
██║     ██╔═══██╗██╔════╝ ██║████╗  ██║
██║     ██║   ██║██║  ███╗██║██╔██╗ ██║
██║     ██║   ██║██║   ██║██║██║╚██╗██║
███████╗╚██████╔╝╚██████╔╝██║██║ ╚████║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝
---------------------------------------
*/

app.post('/v2/login', (req, res) => {
    let body = '';

    req.on('data', c => body += c);
    req.on('end', () => {
        const parsed = querystring.parse(body);

        console.log('LOGIN FIELDS:', parsed);

        const responseData = {
            userId: 'offline-user',
            permissions: [],
            expires: Math.floor(Date.now() / 1000) + 3600
        };

        const base64Data = Buffer
            .from(JSON.stringify(responseData))
            .toString('base64');


        try {
            decToken = decryptDRL(parsed.token, "09e027edfde3212431a8758576807083", parsed.time.padStart(16, '0'));
        } catch (E) {
            console.error("Decryption failed:", E);
            res.status(400).json({ success: false });
            return
        }
        db.serialize(() => {
            const stmt = db.prepare(
                `INSERT INTO user (uid, token, expires) VALUES (?, ?, ?)
                ON CONFLICT(uid) DO UPDATE SET token = excluded.token, expires = excluded.expires;`
            );

            stmt.run(
                decToken.uid,
                parsed.token,
                responseData.expires,
                (err) => {
                    if (err) {
                        console.error("SQLite insert failed:", err);
                    }
                }
            );

            stmt.finalize();
        });

        res.status(200).json({
            success: true,
            token: parsed.token,
            data: base64Data
        });
        console.log(decryptDRL(parsed.token, "09e027edfde3212431a8758576807083", parsed.time.padStart(16, '0')));
    });
});

/*
-------------------------------------------------
██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
-------------------------------------------------
*/

app.get('/social/profile/', (req, res) => {
    console.log("social profile for:", req.headers);
    payload = [{
        "platform-id": "Epic",
        "player-id": "b9365d125935475b8327162c66a25e12",
        "profile-color": "FFAA33",
        "profile-secondary-color": "33FFAA",
        "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64",
        "profile-rank": 12,
        "profile-name": "AcePilot",
        "username": "AcePilot007",
        "has-game": true,
        "is-drl-pilot": false,
    }];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({
        success: true, data: base64Data
    });
})

app.get('/state/game/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/state/', (req, res) => {
    const token = req.headers['x-access-jsonwebtoken'];
    console.log("state TOKEN:", token);
    let jsondata;
    db.serialize(() => {
        db.get(`SELECT uid FROM user WHERE token = ?`, [token], (err, row) => {
            if (err || !row) {
                console.error("Error fetching UID:", err);
                res.status(404).json({ success: false });
                return;
            }

            const uid = row.uid;
            console.log("UID:", uid);

            db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
                if (err) {
                    console.error("Error fetching JSON:", err);
                    res.status(500).json({ success: false });
                    return;
                }

                if (!row) {
                    console.log("No player state found for UID:", uid);
                    jsondata = { lastState: null };
                    const base64Data = Buffer.from(JSON.stringify(jsondata)).toString('base64');
                    res.status(200).json({ success: true, data: base64Data });
                } else {
                    try {
                        jsondata = JSON.parse(row.json);
                    } catch {
                        jsondata = row.json; // fallback
                    }
                    const base64Data = Buffer.from(JSON.stringify(jsondata)).toString('base64');
                    res.status(200).json({ success: true, data: base64Data });
                }
            });
        });
    });
})

app.post('/state/', (req, res) => {
    const token = decodeURIComponent(req.query.token).replace(/ /g, "+");
    console.log("TOKEN:", token);

    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        const raw = body.startsWith('state=') ? body.slice(6) : body;
        const parsed = JSON.parse(decodeURIComponent(raw));

        db.get(`SELECT uid, name FROM user WHERE token = ?`, [token], (err, row) => {
            if (err || !row) {
                console.error("Error fetching UID:", err);
                res.status(404).json({ success: false });
                return;
            }
            const stmt1 = db.prepare(
                `INSERT INTO user (uid, name) VALUES (?, ?)
                    ON CONFLICT(uid) DO UPDATE SET name = excluded.name;`
            );
            const uid = row.uid;
            stmt1.run(uid, row.name, (err) => { });
            parsed['player-id'] = row.uid;


            db.serialize(() => {
                const stmt = db.prepare(
                    `INSERT INTO playerstate (uid, json) VALUES (?, ?)
                    ON CONFLICT(uid) DO UPDATE SET json = excluded.json;`
                );

                stmt.run(uid, JSON.stringify(parsed), (err) => {
                    if (err) {
                        console.error("SQLite insert failed:", err);
                        return;
                    }


                    db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
                        if (err) {
                            console.error("Error fetching JSON:", err);
                            return;
                        }

                        if (!row) {
                        } else {
                            let jsondata;
                            try {
                                jsondata = JSON.parse(row.json);
                            } catch {
                                jsondata = row.json;
                            }
                        }

                        stmt.finalize(err => {
                            if (err) console.error("Error finalizing statement:", err);
                        });
                    });
                });
            });

            res.status(200).json({ success: true });
        });
    });
});

/*
---------------------------------------------------------------------------------------------------
████████╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ███╗   ███╗███████╗███╗   ██╗████████╗███████╗
╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
   ██║   ██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗
   ██║   ██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
   ██║   ╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║
   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
---------------------------------------------------------------------------------------------------
*/


app.get('/tournaments/:guid/register', (req, res) => {
    console.log("Tournament registration for:", req.headers['x-access-jsonwebtoken']);
    res.status(200).json({ success: true });
})

app.get('/tournaments/', (req, res) => {
    let StartTime = new Date(2026, 0, 11, 11, 0, 0, 0);
    const now = new Date();
    let yyyy = now.getFullYear();
    let MM = String(now.getMonth() + 1).padStart(2, '0');
    let dd = String(now.getDate()).padStart(2, '0');
    let HH = String(now.getHours()).padStart(2, '0');
    let mm = String(now.getMinutes()).padStart(2, '0');
    let ss = String(now.getSeconds()).padStart(2, '0');

    const timeStr = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    yyyy = StartTime.getFullYear();
    MM = String(StartTime.getMonth() + 1).padStart(2, '0');
    dd = String(StartTime.getDate()).padStart(2, '0');
    HH = String(StartTime.getHours()).padStart(2, '0');
    mm = String(StartTime.getMinutes()).padStart(2, '0');
    ss = String(StartTime.getSeconds()).padStart(2, '0');
    StartTime = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    res.status(200).json({
        success: true, data: [{
            "id": "tournament-001",
            "guid": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Sunday Session EU",
            "description": "Community Tournament featuring a recent community-made track",
            "region": "EU",
            "type": "DRL",

            "players-size": 0,
            "max-players": 16,
            "player-ids": [],

            "status": "active",
            "progression": "auto",

            "allow-new-registration": true,
            "disable-public-spectators": false,
            "private": false,

            "register-start": "2026-01-01T00:00:00Z",
            "register-end": StartTime,
            "current-time": timeStr,

            "penalty": false,

            "drl-pilot-mode": true,

            "dawc-seeding": false,
            "countdown": true,

            "ranking": [],

            "rounds": [
                {
                    "title": "Qualifiers",
                    "state": "active",
                    "mode": "matchTimeSum",
                    "game-mode": "race",
                    "is-custom-map": false,
                    "matches": [
                        {
                            "id": "match-001",
                            "player-ids": [
                                "player_steam_001",
                                "player_steam_002"
                            ]
                        }
                    ]
                },
                {
                    "state": "pending",
                    "game-mode": "race",
                    "matches": []
                }
            ]
        }]
    });
})

/*
-------------------------------------------------------------------------------------------------
██╗     ███████╗ █████╗ ██████╗ ███████╗██████╗ ██████╗  ██████╗  █████╗ ██████╗ ██████╗ ███████╗
██║     ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝
██║     █████╗  ███████║██║  ██║█████╗  ██████╔╝██████╔╝██║   ██║███████║██████╔╝██║  ██║███████╗
██║     ██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║╚════██║
███████╗███████╗██║  ██║██████╔╝███████╗██║  ██║██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝███████║
╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝
-------------------------------------------------------------------------------------------------
*/

app.post('/leaderboards/', (req, res) => {
    token = req.headers['x-access-jsonwebtoken']

    db.get(`SELECT name FROM user WHERE token = ?`, [token], (err, row) => {
        console.log("Player", row ? row.name : "unknown", "is sending leaderboard");
    });
    /*
    db.get(`SELECT uid, name FROM user WHERE token = ?`, [token], (err, row) => {
        if (err || !row) {
            console.error("Error fetching UID:", err);
            res.status(404).json({ success: false });
            return;
        }

        const uid = row.uid;


        db.serialize(() => {
            const stmt = db.prepare(
                `INSERT INTO leaderboard (player_id, profile_platform_id, username, profile_color, profile_thumb, profile_name, profile_platform, map, track, is_custom_map, custom_map, mission, group_id, region, replay_url, game_type, diameter, drone_name, drone_thumb, multiplayer, multiplayer_room_id, multiplayer_room_size, multiplayer_player_id, multiplayer_master_id, multiplayer_player_position, flag_url, score_type, match_id, tryouts, battery_resistance, controller_type, position, score, score_check, score_double_check, score_cheat, score_cheat_ratio, score_cheat_samples, crash_count, top_speed, time_in_first, lap_times, gate_times, fastest_lap, slowest_lap, total_distance, percentile, order_col, high_score, race_id, limit_col, heat, custom_physics, drl_official, drl_pilot_mode, drone_guid, drone_rig, drone_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(player_id, map, track, diameter, drone_name, drone_guid) DO UPDATE SET replay_url = excluded.replay_url, score = excluded.score, score_check = excluded.score_check, score_double_check = excluded.score_double_check;`
            );

            stmt.run(
                uid, 
                body.profile_platform_id ? body.profile_platform_id: "unknown",
                row.name,
                null,
                null,
                row.name,
                body.profile_platform_id ? body.profile_platform_id: "unknown",
                body.map ? body.map: "unknown",
                body.track ? body.track: "unknown",
                body['is-custom-map'] ? body['is-custom-map']: true,
                body['custom-map'] ? body['custom-map']: null,
                
                (err) => {

                if (err) {
                    console.error("SQLite insert failed:", err);
                    return;
                }


                db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
                    if (err) {
                        console.error("Error fetching JSON:", err);
                        return;
                    }

                    if (!row) {
                    } else {
                        let jsondata;
                        try {
                            jsondata = JSON.parse(row.json);
                        } catch {
                            jsondata = row.json;
                        }
                    }

                    stmt.finalize(err => {
                        if (err) console.error("Error finalizing statement:", err);
                    });
                });
            });
        });

        res.status(200).json({ success: true });
    });
    */
    console.log("NEW LEADERBOARD POST:\n")
    console.log("Headers:", req.headers);
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        const raw = body.startsWith('list=') ? body.slice(5) : body;
        const parsed = JSON.parse(decodeURIComponent(raw));
        console.log("LEADERBOARDS BODY:", parsed);
        db.serialize(() => {
            db.get(`SELECT uid FROM user WHERE token = ?`, [token], (err, row) => {
                if (err || !row) {
                    res.status(500).json({ success: false });
                    return;
                }
                const uid = row.uid;
                db.get(`SELECT * FROM playerprogression WHERE uid = ?`, [uid], (err, row) => {
                    if (err || !row) {
                        console.error("Error fetching playerprogression:", err);
                        res.status(500).json({ success: false });
                        return;
                    }
                    for (let i = 0; i < Tracks.length; i++) {
                        if (Tracks[i].guid === parsed[0]['custom-map']) {
                            xpValue = Tracks[i]['xp-value'];
                        }
                    }
                    console.log("XP VALUE FOR MAP", "is", xpValue);
                    let NEWXP = row.xp + xpValue;
                    if (NEWXP >= row.next_level_xp) {
                        row.previous_level_xp = row.next_level_xp;
                        row.level += 1;
                        row.next_level_xp = row.next_level_xp * 1.5;
                        console.log(row.next_level_xp);
                    }
                    progression = {
                        xp: NEWXP,
                        "previous-level-xp": row.previous_level_xp,
                        "next-level-xp": row.next_level_xp,
                        level: row.level,
                        "rank-name": row.rank_name,
                        "rank-index": row.rank_index,
                        "rank-position": row.rank_position,
                        "rank-round-start": row.rank_round_start,
                        "rank-round-end": row.rank_round_end,
                        "streak-points": row.streak_points,
                        "daily-completed-maps": row.daily_completed_maps,
                        "goal-daily-completed-maps": row.goal_daily_completed_maps,
                        prizes: JSON.parse(row.prizes)
                    }
                    const stmt = db.prepare(
                        `INSERT INTO playerprogression (uid, xp, previous_level_xp, next_level_xp, level, rank_name, rank_index, rank_position, rank_round_start, rank_round_end, streak_points, daily_completed_maps, goal_daily_completed_maps, prizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT (uid) DO UPDATE SET xp = excluded.xp, previous_level_xp = excluded.previous_level_xp, next_level_xp = excluded.next_level_xp, level = excluded.level;`
                    );
                    stmt.run(
                        uid,
                        progression.xp,
                        progression['previous-level-xp'],
                        progression['next-level-xp'],
                        progression.level,
                        progression["rank-name"],
                        progression["rank-index"],
                        progression["rank-position"],
                        progression["rank-round-start"],
                        progression["rank-round-end"],
                        progression["streak-points"],
                        progression["daily-completed-maps"],
                        progression["goal-daily-completed-maps"],
                        JSON.stringify(progression.prizes)
                    );
                    res.status(200).json({
                        success: true, data: [
                            {
                                playerId: "abc123",
                                username: "PilotOne",
                                platformPlayerId: "steam_001",
                                score: 123456,
                                position: 1,
                                gameType: "Race",
                                matchId: "match_001",
                                map: "Desert",
                                track: "TrackA",
                                lapTimes: [40000, 41000, 39500],
                                topSpeed: 98.5,
                                timeInFirst: 120000,
                                totalDistance: 1500,
                                progression: progression
                            }
                        ]
                    });
                });
            });
        });
    });
});


app.get('/leaderboards/rivals/', (req, res) => {
    console.log(req.headers);
    res.status(200).json({
        success: true, data: {
            "top": [
                {
                    "player-id": "player_steam_000",
                    "position": 1,
                    "username": "AAA",
                    "score": 60000,
                    "replayURL": "https://cdn/game/replays/top1"
                }
            ],
            "player": 2,
            "rivals": [
                {
                    "position": 98,
                    "username": "XYZ",
                    "score": 80000,
                },
                {
                    "position": 99,
                    "username": "YOU",
                    "score": 90000,
                    progression: { "xp": 1500 }
                },
                {
                    "position": 100,
                    "username": "ABC",
                    "score": 90101,
                }
            ],
            "past": null
        }

    });
});

app.get('/leaderboards/', (req, res) => {
    const token = req.query.token;  // user auth token
    const guid = req.query.guid;    // leaderboard ID
    const match = req.query.match;  // optional
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const gameType = req.query['game-type'] || null;

    console.log('Query parameters:', req.query);

    // Data might also come in body (some GET requests send JSON)
    console.log('Body:', req.body);

    // Header that C# sends
    console.log('Headers:', req.headers);

    console.log("Leaderboard request:", { token, guid, match, page, limit, gameType });
    res.status(200).json({
        success: true, data: {
            "leaderboard": [
                {
                    playerId: "abc123",
                    username: "PilotOne",
                    platformPlayerId: "steam_001",
                    score: 123456,
                    position: 1,
                    gameType: "Race",
                    matchId: "match_001",
                    map: "Desert",
                    track: "TrackA",
                    lapTimes: [40000, 41000, 39500],
                    topSpeed: 98.5,
                    timeInFirst: 120000,
                    totalDistance: 1500
                },
                {
                    playerId: "def456",
                    username: "PilotTwo",
                    platformPlayerId: "steam_002",
                    score: 130000,
                    position: 2,
                    gameType: "Race",
                    matchId: "match_001",
                    map: "Desert",
                    track: "TrackA",
                    lapTimes: [42000, 42500, 41000],
                    topSpeed: 95.3,
                    timeInFirst: 110000,
                    totalDistance: 1500
                }
            ],
            "pagging": { "page": 1, "limit": 10, "total": 2 }
        }
    });
});



/*
----------------------------------------------------------------------------------------
██████╗ ██████╗  ██████╗  ██████╗ ██████╗ ███████╗███████╗███████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗██╔════╝ ██╔══██╗██╔════╝██╔════╝██╔════╝██║██╔═══██╗████╗  ██║
██████╔╝██████╔╝██║   ██║██║  ███╗██████╔╝█████╗  ███████╗███████╗██║██║   ██║██╔██╗ ██║
██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══██╗██╔══╝  ╚════██║╚════██║██║██║   ██║██║╚██╗██║
██║     ██║  ██║╚██████╔╝╚██████╔╝██║  ██║███████╗███████║███████║██║╚██████╔╝██║ ╚████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
----------------------------------------------------------------------------------------
*/

app.get('/experience-points/ranking/', (req, res) => {
    console.log(req.headers);
    const payload = {
        "league": {
            "name": "",
            "guid": "LG-0"
        },
        "start-at": "2026-01-01T00:00:00Z",
        "end-at": "2026-01-31T23:59:59Z",
        "ranking": [{
            "is-player": true,
            "is-top": true,
            "is-bottom": false,
            "profile-color": "3FA9F5",
            "profile-thumb": "https://cdn/game/avatars/u123.png",
            "profile-name": "YOU",
            "flag-url": "https://cdn/game/flags/us.png",
            "position": 1,
            "type": "player",
            "xp": 0
        }]
    };

    res.status(200).json({ success: true, data: payload });
})


app.get('/experience-points/progression/', (req, res) => {
    token = req.headers['x-access-jsonwebtoken'];
    const payload = {
        "xp": 0,
        "previous-level-xp": 0,
        "next-level-xp": 100,
        "level": 1,
        "rank-name": "Bronze",
        "rank-index": 0,
        "rank-position": 0,
        "rank-round-start": getEndOfLastISOWeek(),
        "rank-round-end": getStartOfNextISOWeek(),
        "streak-points": 0,
        "daily-completed-maps": 0,
        "goal-daily-completed-maps": 0,
        "prizes": []
    };
    db.serialize(() => {
        db.get(`SELECT uid FROM user WHERE token = ?`, [token], (err, row) => {
            console.log("Player", row ? row.uid : "unknown", "is requesting progression");
            if (err || !row) {
                console.error("Error fetching UID:", err);
                res.status(404).json({ success: false });
                return;
            }
            uid = row.uid;
            db.get(`SELECT * FROM playerprogression WHERE uid = ?`, [uid], (err, row) => {
                if (err) {
                    console.error("Error fetching playerprogression:", err);
                    res.status(500).json({ success: false });
                    return;
                }
                if (!row) {
                    console.log("No player progression found for UID:", uid);
                    jsondata = payload;
                    res.status(200).json({ success: true, data: payload });
                    const stmt = db.prepare(
                        `INSERT INTO playerprogression (uid, xp, previous_level_xp, next_level_xp, level, rank_name, rank_index, rank_position, rank_round_start, rank_round_end, streak_points, daily_completed_maps, goal_daily_completed_maps, prizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
                    );
                    stmt.run(
                        uid,
                        payload.xp,
                        payload['previous-level-xp'],
                        payload['next-level-xp'],
                        payload.level,
                        payload["rank-name"],
                        payload["rank-index"],
                        payload["rank-position"],
                        payload["rank-round-start"],
                        payload["rank-round-end"],
                        payload["streak-points"],
                        payload["daily-completed-maps"],
                        payload["goal-daily-completed-maps"],
                        JSON.stringify(payload.prizes)
                    );
                    console.log("Inserted default progression for UID:", uid);
                } else {
                    jsondata = {
                        xp: row.xp,
                        "previous-level-xp": row.previous_level_xp,
                        "next-level-xp": row.next_level_xp,
                        level: row.level,
                        "rank-name": row.rank_name,
                        "rank-index": row.rank_index,
                        "rank-position": row.rank_position,
                        "rank-round-start": row.rank_round_start,
                        "rank-round-end": row.rank_round_end,
                        "streak-points": row.streak_points,
                        "daily-completed-maps": row.daily_completed_maps,
                        "goal-daily-completed-maps": row.goal_daily_completed_maps,
                        prizes: JSON.parse(row.prizes)
                    }
                    res.status(200).json({ success: true, data: jsondata });
                }
            });
        });
    });
})



/*
------------------------------------------------------
██████╗  █████╗ ███╗   ██╗██████╗  ██████╗ ███╗   ███╗
██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔═══██╗████╗ ████║
██████╔╝███████║██╔██╗ ██║██║  ██║██║   ██║██╔████╔██║
██╔══██╗██╔══██║██║╚██╗██║██║  ██║██║   ██║██║╚██╔╝██║
██║  ██║██║  ██║██║ ╚████║██████╔╝╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝     ╚═╝
------------------------------------------------------
*/

app.get('/time/', (req, res) => {
    res.status(200).json({ success: true, data: getTimeBase64() });
})


app.get('/circuits/', (req, res) => {
    const payload = [];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true });
})

// Helper: timestamp as Base64
function getTimeBase64() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const timeStr = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    const payload = { time: timeStr };
    const base64Data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    return base64Data;
}

function getStartOfNextISOWeek() {
    const today = new Date();

    const todayISODay = today.getDay() === 0 ? 7 : today.getDay();

    const daysUntilNextMonday = 8 - todayISODay;

    today.setDate(today.getDate() + daysUntilNextMonday);
    today.setHours(0, 0, 0, 0);


    return today.toISOString().split('T')[0];
}


function getEndOfLastISOWeek() {
    const today = new Date();

    const daysSinceLastSunday = today.getDay() === 0 ? 7 : today.getDay();

    const lastSunday = new Date(today.setDate(today.getDate() - daysSinceLastSunday));

    lastSunday.setHours(23, 59, 59, 999);

    const isoString = lastSunday.toISOString();

    return isoString;
}

app.use(rateLimit({
    windowMs: 60_000,
    max: 1000
}));

function decryptDRL(token, keyString, ivString) {
    const key = Buffer.from(keyString, 'utf8');    // matches C# Encoding.UTF8.GetBytes
    const iv = Buffer.from(ivString, 'utf8');      // matches C# Encoding.UTF8.GetBytes
    const encrypted = Buffer.from(token, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // Remove BOM if present
    if (decrypted[0] === 0xEF && decrypted[1] === 0xBB && decrypted[2] === 0xBF) {
        decrypted = decrypted.slice(3);
    }

    const decryptedText = decrypted.toString('utf8');
    return JSON.parse(decryptedText);
}

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on [http://localhost:${PORT}](http://localhost:${PORT})`);
});