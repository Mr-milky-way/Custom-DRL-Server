require('dotenv').config();
const pm2 = require('pm2');
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session')
const path = require('path');
const querystring = require('querystring');
const csrf = require('lusca').csrf;
const sharp = require('sharp');

const db = new sqlite3.Database('main.db', err => {
    if (err) {
        console.error("SQLite open error:", err);
    } else {
        console.log("SQLite database connected");
    }
});

const multer = require('multer');
const { env } = require('process');
const replayCloud = multer({ dest: 'replay-cloud/' });

process.on("uncaughtException", err => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
    console.error("UNHANDLED REJECTION:", err);
});


const image = multer.diskStorage({
    destination: function (req, file, cb) {
        const token = req.headers['x-access-jsonwebtoken']
        const uid = req.uid
        fs.mkdirSync('image-cloud/' + uid, { recursive: true });
        cb(null, 'image-cloud/' + uid + "/");
    },
    filename: function (req, file, cb) {
        cb(null, crypto.randomUUID() + `.png`);
    }
});
const imageCloud = multer({ storage: image });

const replaydest = multer.diskStorage({
    destination: function (req, file, cb) {
        const uid = req.uid
        fs.mkdirSync('replay/' + uid, { recursive: true });
        cb(null, 'replay/' + uid + "/");
    },
    filename: function (req, file, cb) {
        cb(null, crypto.randomUUID());
    }
});

const replay = multer({ storage: replaydest });


const app = express();
const PORT = process.env.PORT || 8080;
const url = process.env.URL || `http://localhost:${PORT}`;


app.use(rateLimit({
    windowMs: 60_000,
    max: 1000
}));


//TODO: finnish maps IE duplicating and stuff
//TODO: Fix crash dummy data
//TODO: Get tournaments working ???
//TODO: Make it look better
//TODO: Better documentation


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


app.use((req, res, next) => {
    res.setTimeout(10000, () => {
        console.error("Request timed out");
        res.status(504).json({ success: false });
    });
    next();
});


db.serialize(() => {
    db.run("PRAGMA journal_mode=WAL;");


    //tournaments

    /*db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        players_size INT,
        max_players INT,
        id TEXT,
        guid TEXT UNIQUE,
        title TEXT,
        region TEXT,
        lan_support BOOLEAN,
        server_ip TEXT,
        call_to_action TEXT,
        description TEXT,
        prize_description TEXT,
        prize_url TEXT,
        image_url TEXT,
        video_url TEXT,
        allow_new_registration BOOLEAN,
        disable_public_spectators BOOLEAN,
        register_start DATETIME,
        register_end DATETIME,
        current_time DATETIME,
        penalty BOOLEAN,
        status TEXT,
        progression TEXT,
        drone_guid TEXT,
        drl_pilot_mode BOOLEAN,
        default_drone_class INT,
        minimum_skill INT,
        streaming_url TEXT,
        private BOOLEAN,
        dawc_seeding BOOLEAN,
        countdown BOOLEAN,
        rounds TEXT,
        rankings TEXT,
        age_check BOOLEAN,
        age_check_number INT,
        terms_and_conditions_url TEXT,
        type TEXT,
        player_ids TEXT,
        ranking TEXT,
        )`);


        db.run(`CREATE TABLE IF NOT EXISTS tournamentrounds (
        guid TEXT,
        roundNumber INT,
        status TEXT,
        norder INT,
        title TEXT,
        start_at DATETIME,
        end_at DATETIME,
        map TEXT,
        track TEXT,
        is_custom_map BOOLEAN,
        custom_map TEXT,
        custom_map_title TEXT,
        multiplayer_countdown BOOLEAN,
        mode TEXT,
        timeout INT,
        matches TEXT,
        PRIMARY KEY (roundNumber, guid)
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS tournamentroundmatches (
    id TEXT,
    round_id TEXT,
    round_norder INT,
    map TEXT,
    track TEXT,
    is_custom_map TEXT,
    custom_map TEXT,
    custom_map_title TEXT,
    multiplayer_room_timer BOOLEAN,
    is_under_review BOOLEAN,
    players_size INT,
    throttle_cap FLOAT,
    current_heat INT,
    active_heat INT,
    status TEXT,
    norder INT,
    heats INT,
    num_winners INT,
    start_at DATETIME,
    end_at DATETIME,
    current_time DATETIME,
    progress INT,
    default_drone_class INT,
    mode TEXT,
    parents TEXT,
    player_ids TEXT,
    player_order TEXT,
    players TEXT,
    scores TEXT,
    replay_urls TEXT,

    PRIMARY KEY (roundNumber, guid, id)
    )`);
    
    db.run("CREATE TABLE IF NOT EXISTS tournamentsregistered (uid TEXT, guid TEXT, PRIMARY KEY (uid, guid))");

    db.run("CREATE TABLE IF NOT EXISTS tournamentsubscribed (uid TEXT, guid TEXT, PRIMARY KEY (uid, guid))");
    */

    db.run(`
    CREATE TABLE IF NOT EXISTS map_pools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pool_name TEXT NOT NULL UNIQUE
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS poolmaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        map TEXT,
        track TEXT,
        is_custom_map TEXT,
        custom_map TEXT,
        custom_map_title TEXT,
        pool_id INTEGER,
        UNIQUE (custom_map, pool_id)
        FOREIGN KEY (pool_id) REFERENCES map_pools(id)
    )
    `);


    // Login
    db.run(`CREATE TABLE IF NOT EXISTS adminusers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);
    db.run("CREATE TABLE IF NOT EXISTS user (uid TEXT UNIQUE, token TEXT, expires INTEGER, name TEXT)");

    db.run("CREATE TABLE IF NOT EXISTS trackcolab (uid TEXT, guid TEXT, PRIMARY KEY (uid, guid))");
    //tracks
    db.run("CREATE TABLE IF NOT EXISTS trackupdates (uid TEXT UNIQUE, tracks TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS playerstate (uid TEXT UNIQUE, json TEXT)");
    //leaderboard
    db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    player_id TEXT NOT NULL,
    map TEXT NOT NULL,
    track TEXT NOT NULL,
    diameter INT NOT NULL,
    drl_official BOOLEAN NOT NULL,

    drone_name TEXT NOT NULL,
    drone_guid TEXT NOT NULL,
    profile_platform_id TEXT,
    username TEXT,
    profile_color TEXT,
    profile_thumb TEXT,
    profile_name TEXT,
    profile_platform TEXT,
    is_custom_map BOOLEAN NOT NULL,
    custom_map TEXT,
    mission TEXT,
    group_id TEXT,
    region TEXT,
    replay_url TEXT,
    game_type TEXT,
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
    drl_pilot_mode BOOLEAN,
    drone_rig TEXT,
    drone_hash TEXT,

    PRIMARY KEY (player_id, map, track, diameter, drl_official, custom_map)
    );`);
    //drones
    db.run(`CREATE TABLE IF NOT EXISTS drone (
        guid TEXT UNIQUE,
        player_id TEXT,
        profile_platform_id TEXT,
        profile_platform TEXT,
        profile_color TEXT,
        profile_thumb TEXT,
        profile_name TEXT,
        score FLOAT,
        rating FLOAT,
        rating_count INT,
        thumb_url TEXT,
        name TEXT,
        is_public BOOLEAN,
        is_official BOOLEAN,
        is_custom_physics BOOLEAN,
        flight_time FLOAT,
        flight_total FLOAT,
        size INT,
        thrust FLOAT,
        speed FLOAT,
        weight FLOAT,
        rpm FLOAT,
        frame_id TEXT,
        motor_id TEXT,
        prop_id TEXT,
        battery_id TEXT,
        rig_data TEXT,
        profile_data TEXT,
        physics_data TEXT
        );`);
    //player info
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
        league_name TEXT,
        league_guid TEXT,
        streak_date_start TEXT,
        streak_date_end TEXT,
        streak_points INT,
        daily_completed_maps INT,
        goal_daily_completed_maps INT,
        prizes TEXT,
        xp_this_week INT,
        weekstart TEXT,
        weekend TEXT
        );`);


    //tracks
    db.run(`CREATE TABLE IF NOT EXISTS communitytracks (
            guid TEXT UNIQUE,
            root TEXT,
            prefs TEXT,
            allow_copy BOOLEAN,
            base_assets_enabled BOOLEAN,
            exclusive_by_platform TEXT,
            is_race_allowed BOOLEAN,
            is_public BOOLEAN,
            is_public_for_drlpilots BOOLEAN,
            is_drl_official BOOLEAN,
            is_featured BOOLEAN,
            is_multigp BOOLEAN,
            is_tryouts BOOLEAN,
            is_virtual_season BOOLEAN,
            map_category TEXT,
            map_difficulty INT,
            map_distance FLOAT,
            map_dirty BOOLEAN,
            map_lighting INT,
            map_laps INT,
            map_stats_triangle_count INT,
            map_stats_object_count INT,
            map_asset_layers TEXT,
            map_styles TEXT,
            categories TEXT,
            prefs_auto_save BOOLEAN,
            rating_count INT,
            score INT,
            track_id TEXT,
            xp_value INT,
            xp_min_time INT,
            cm_collectable_count INT,
            collaborators TEXT,
            map_mode_type TEXT,
            map_id TEXT,
            map_title TEXT,
            steam_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            version INT,
            title_translations TEXT,
            images TEXT,
            map_thumb TEXT,
            avatar TEXT,
            player_id TEXT,
            profile_name TEXT,
            profile_thumb TEXT,
            profile_color TEXT,
            profile_platform TEXT,
            profile_platform_id TEXT,
            flag_url TEXT,
            is_avatar_blocked BOOLEAN,
            full_track_url TEXT
            );`);
    //db.run("DROP TABLE communitytracks")
});






const badTokenAuthv2 = (req, res, next) => {
    const token = req.headers['x-access-jsonwebtoken']
    db.get(`SELECT uid, expires FROM user WHERE token = ?`, [token], (err, row) => {
        if (err || !row) {
            console.error("Error fetching UID:", err);
            res.status(404).json({ success: false });
            return;
        } else if (row.expires < Math.floor(Date.now() / 1000)) {
            console.error("Error fetching UID: Token expired");
            res.status(401).json({ success: false, message: "Token invalid" });
            return;
        } else {
            req.uid = row.uid;
            next()
        }
    })
}




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

function TOJSON(value) {
    if (!value) return [];

    if (typeof value === "string") {
        value = value.trim();
        if (value === "[]" || value === "{}" || value === "null") return [];
        try {
            return JSON.parse(value);
        } catch (e) {
            console.warn("TOJSON failed to parse string, returning original value:", value);
            return value;
        }
    }

    return value;
}

function mapCTracksqlToJson(row) {
    return {
        "guid": row.guid,
        "root": TOJSON(row.root),
        "prefs": TOJSON(row.prefs),
        "allow-copy": row.allow_copy,
        "base-assets-enabled": row.base_assets_enabled,
        "exclusive-by-platform": TOJSON(row.exclusive_by_platform),
        "is-race-allowed": row.is_race_allowed,
        "is-public": row.is_public,
        "is-public-for-drlpilots": row.is_public_for_drlpilots,
        "is-drl-official": row.is_drl_official,
        "is-featured": row.is_featured,
        "is-multigp": row.is_multigp,
        "is-tryouts": row.is_tryouts,
        "is-virtual-season": row.is_virtual_season,
        "map-category": row.map_category,
        "map-difficulty": row.map_difficulty,
        "map-distance": row.map_distance,
        "map-dirty": row.map_dirty,
        "map-lighting": row.map_lighting,
        "map-laps": row.map_laps,
        "map-stats-triangle-count": row.map_stats_triangle_count,
        "map-stats-object-count": row.map_stats_object_count,
        "map-asset-layers": TOJSON(row.map_asset_layers),
        "map-styles": TOJSON(row.map_styles),
        "categories": TOJSON(row.categories),
        "prefs-auto-save": row.prefs_auto_save,
        "rating-count": row.rating_count,
        "score": row.score,
        "track-id": row.track_id,
        "xp-value": row.xp_value,
        "xp-min-time": row.xp_min_time,
        "cm-collectable-count": row.cm_collectable_count,
        "collaborators": TOJSON(row.collaborators),
        "map-mode-type": row.map_mode_type,
        "map-id": row.map_id,
        "map-title": row.map_title,
        "steam-id": row.steam_id,
        "created-at": row.created_at,
        "updated-at": row.updated_at,
        "version": row.version,
        "title-translations": TOJSON(row.title_translations),
        "images": TOJSON(row.images),
        "map-thumb": row.map_thumb,
        "avatar": row.avatar,
        "player-id": row.player_id,
        "profile-name": row.profile_name,
        "profile-thumb": row.profile_thumb,
        "profile-color": row.profile_color,
        "profile-platform": row.profile_platform,
        "profile-platform-id": row.profile_platform_id,
        "flag-url": row.flag_url,
        "is-avatar-blocked": row.is_avatar_blocked,
        "full-track-url": url + row.full_track_url
    }
}

app.post('/maps/:guid/duplicate', express.urlencoded({ limit: "100mb", extended: true }), badTokenAuthv2, (req, res) => {
    const baseDir = path.join(__dirname, 'tracks');
    const finalPath = path.resolve(baseDir, req.params.guid + '.cmp');

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }

    if (!fs.existsSync(finalPath)) {
        return res.status(404).end();
    }
    res.sendFile(finalPath);
});

//path for track downloads
app.get('/tracks/:id', (req, res) => {
    console.log("req sent to /tracks/ for id:", req.params.id)
    const baseDir = path.join(__dirname, 'tracks');
    const finalPath = path.resolve(baseDir, req.params.id + '.cmp');

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }

    if (!fs.existsSync(finalPath)) {
        return res.status(404).end();
    }
    res.sendFile(finalPath);
});


//TODO: WHAT DID THIS DO?
/*
app.get('/maps/:guid', (req, res) => {
    const guid = req.params.guid;
    console.log("what? /maps/ MAPS", guid);
 
    const mapData = Tracks.filter(track => track.guid === guid);
 
    res.status(200).json({
        success: true,
        data: {
            paging: {
                "page-total": 1,
                "page": 1,
                "next-page-url": "",
                "previous-page-url": ""
            },
            data: mapData
        }
    });
});
*/

app.get('/progression/maps/', (req, res) => {
    let progressionMaps = [];
    db.all(`SELECT * FROM communitytracks WHERE map_category != 'MapCommon'`, (err, Track) => {
        for (let i = 0; i < Track.length; i++) {
            let data = {
                guid: Track[i].guid,
                "name": Track[i]["map_title"],
                "xp-value": Track[i]["xp_value"]
            }
            progressionMaps.push(data);
        }
        res.status(200).json({
            success: true, data: progressionMaps
        });
    });
})




app.get('/maps/updated/', (req, res) => {
    console.log("req sent to /maps/updated/")
    const token = req.headers['x-access-jsonwebtoken']
    db.all(`SELECT * FROM communitytracks WHERE map_category != 'MapCommon' AND is_public = 1`, (err, Track) => {
        db.get(`SELECT uid, expires FROM user WHERE token = ?`, [token], (err, row) => {
            if (err || !row) {
                console.error("Error fetching UID:", err);
                for (i = 0; i < Track.length; i++) {
                    Track[i] = mapCTracksqlToJson(Track[i]);
                }
                res.status(200).json(Track);
                return;
            } else if (row.expires < Math.floor(Date.now() / 1000)) {
                console.error("Error fetching UID: Token expired");
                res.status(401).json({ success: false, message: "Token invalid" });
                return;
            } else {
                const uid = row.uid
                db.get(`SELECT tracks FROM trackupdates WHERE uid = ?`, [uid], (err, row) => {
                    if (err || !row) {
                        console.error("Error fetching user tracks:", err);
                        for (i = 0; i < Track.length; i++) {
                            Track[i] = mapCTracksqlToJson(Track[i]);
                        }
                        return res.status(200).json(Track);
                    }
                    let payload = [];
                    let trackss = JSON.parse(row.tracks);
                    for (i = 0; i < trackss.length; i++) {
                        for (e = 0; e < Track.length; e++) {
                            if (trackss[i].guid !== Track[e].guid || trackss[i].version !== Track[e].version) {
                                payload.push(mapCTracksqlToJson(Track[e]));
                            }
                        }
                    }
                    res.status(200).json(payload);
                });
            }
        });
    });
});

app.post('/maps/updated/', express.urlencoded({ extended: false }), (req, res) => {
    console.log("req sent to /maps/updated/ via POST")
    console.log(req.body);
    console.log(req.headers)
    res.status(200).json({ success: true });
})

/*
app.post('/maps/updated/', express.urlencoded({ extended: false }), (req, res) => {
    console.log("req sent to /maps/updated/ via POST")
    const token = req.headers['x-access-jsonwebtoken']
    db.get(`SELECT uid, expires FROM user WHERE token = ?`, [token], (err, row) => {
        if (err || !row) {
            console.error("Error fetching UID:", err);
            res.status(404).json({ success: false });
            return;
        } else if (row.expires < Math.floor(Date.now() / 1000)) {
            console.error("Error fetching UID: Token expired");
            res.status(401).json({ success: false, message: "Token invalid" });
            return;
        } else {
            console.log(JSON.stringify(req.body))
            db.run(`INSERT INTO trackupdates (uid, tracks) VALUES (?, ?) ON CONFLICT(uid) DO UPDATE SET tracks = excluded.tracks`, [row.uid, JSON.stringify(req.body)], function (err) {
                if (err) {
                    console.error("Error inserting track update:", err);
                    res.status(500).json({ success: false });
                } else {
                    res.status(200).json({ success: true });
                }
            });
        }
    });
});
*/

app.get('/maps/user/updated/', express.urlencoded({ extended: false }), badTokenAuthv2, (req, res) => {
    const token = req.headers['x-access-jsonwebtoken']
    console.log("req sent to /maps/user/updated/")
    let payload = []
    const uid = req.uid
    db.all(`SELECT ct.*
                FROM communitytracks ct
                INNER JOIN trackcolab tc ON ct.guid = tc.guid
                WHERE tc.uid = ?`, [uid], (err, row) => {
        if (err) {
            console.error("Error fetching community tracks:", err);
            return res.status(500).json({ success: false });
        }
        for (let i = 0; i < row.length; i++) {
            let data = mapCTracksqlToJson(row[i]);
            payload.push(data);
        }
        console.log("Returned", payload, "tracks for user", uid);
        res.status(200).json({ success: true, data: { data: payload, "pagging": { "page": req.query.page, "page-total": Math.ceil(payload.length / req.query.limit) }, success: true } });
    });
})


app.post('/maps/:guid/rate/', (req, res) => {
    console.log("Body:", req.body);
    res.status(200).json({ success: true });
})

app.get('/maps/:guid/remove/', express.urlencoded({ extended: false }), badTokenAuthv2, (req, res) => {
    console.log("req sent to /maps/:guid/remove/ for guid:", req.params.guid)
    const uid = req.uid
    db.get(`SELECT player_id FROM communitytracks WHERE guid = ?`, [req.params.guid], (err, row) => {
        if (err || !row) {
            console.error("Error fetching drone:", err);
            res.status(500).json({ success: false });
            return;
        } else {
            if (row.player_id == uid) {
                try {
                    const baseDir = path.join(__dirname, 'tracks');
                    const finalPath = path.resolve(baseDir, req.params.guid + '.cmp');

                    if (!finalPath.startsWith(baseDir)) {
                        return res.status(403).send('Forbidden: Invalid path');
                    }
                    fs.unlinkSync(fs.realpathSync(finalPath));
                    console.log('File deleted synchronously successfully');
                } catch (err) {
                    console.error('Error deleting file synchronously:', err);
                    res.status(500).json({ success: false });
                    return;
                }
                db.run(`DELETE FROM communitytracks WHERE guid = ? AND player_id = ?`, [req.params.guid, uid], function (err) {
                    if (err) {
                        console.error("Error deleting community track:", err);
                        res.status(500).json({ success: false });
                        return;
                    } else {
                        console.log(`Deleted ${this.changes} row(s) from community tracks table.`);
                        res.status(200).json({ success: true });
                    }
                });
            } else {
                res.status(403).json({ success: false });
                return;
            }
        }
    });
});


app.get('/maps/:guid', (req, res) => {
    console.log("req sent to /maps/ for guid:", req.params.guid)
    const baseDir = path.join(__dirname, 'tracks');
    const finalPath = path.resolve(baseDir, req.params.guid + '.cmp');

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }

    if (!fs.existsSync(finalPath)) {
        return res.status(404).end();
    }
    res.sendFile(finalPath);
});

app.get('/maps/', (req, res) => {
    console.log("req sent to /maps/ headers are:", req.headers, req.query);
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    let sqlSort = "";
    let filters = []
    let filtersP = []
    filters.push(" AND is_race_allowed = 1");
    if (req.query['map-difficulty']) {
        filters.push(`AND map_difficulty = ?`);
        filtersP.push(parseInt(req.query['map-difficulty']));
    }
    if (req.query['map-id']) {
        filters.push("AND map_id = ?");
        filtersP.push(req.query['map-id']);
    }
    if (req.query.q) {
        if (req.query.q.startsWith("@")) {
            filters.push("AND profile_name = ?");
            filtersP.push(req.query.q.toLowerCase().substring(1));
        } else {
            filters.push("AND map_title LIKE ?");
            filtersP.push(`%${req.query.q}%`);
        }
    }
    if (req.query.sort && req.query.order) {
        const normalizedSort = req.query.sort.replace(/-/g, '_');
        const allowedSortFields = ['score', 'rating_count', 'created_at', 'updated_at'];
        const sortField = allowedSortFields.includes(normalizedSort) ? normalizedSort : 'score';

        const sortOrder = req.query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sqlSort = `ORDER BY ${sortField} ${sortOrder}`;
        filters.push(sqlSort)
    }

    console.log("Final filters:", filters);
    console.log("Final filter parameters:", filtersP);
    db.get(
        `SELECT COUNT(*) as total FROM communitytracks WHERE is_public = 1 AND map_category = 'MapCommon' ${filters.join(' ')}`,
        [...filtersP],
        (err, countResult) => {
            if (err) {
                console.error("Error counting tracks:", err);
                return res.status(500).json({ success: false });
            }
            const totalCount = countResult.total;
            const totalPages = Math.ceil(totalCount / limit);
            db.all(
                `SELECT *
                FROM communitytracks
                WHERE is_public = 1 AND map_category = 'MapCommon'
                ${filters.join(' ')} LIMIT ? OFFSET ? `,
                [...filtersP, limit, offset],
                (err, rows) => {
                    if (err) {
                        console.error("Error fetching community tracks:", err);
                        return res.status(500).json({ success: false });
                    }
                    const payload = rows.map(row => mapCTracksqlToJson(row));
                    res.status(200).json({ success: true, data: { data: payload, pagging: { page: page, "page-total": totalPages } } });
                    console.log("Returned", payload.length, "tracks for page", page, "of", totalPages);
                }
            );
        }
    );
});

app.post('/maps/', express.urlencoded({ limit: "50mb", extended: true }), badTokenAuthv2, (req, res) => {
    console.log("req sent to /maps/ via POST", req.body);
    const uid = req.uid
    let payload = {
        "success": true,
        "message": null,
        "token": null,
        "webtoken": null,
        "encoded": false,
        "data": {
            "pagging": {
                "page": 1,
                "page-total": 1,
                "total": 1,
                "previous-page-url": null,
                "next-page-url": null
            },
            "data": [req.body]
        }
    }
    const baseDir = path.join(__dirname, 'tracks');
    const finalPath = path.resolve(baseDir, req.params.guid + '.cmp');

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }
    fs.writeFile(finalPath, JSON.stringify(payload), err => {
        if (err) {
            console.error(err);
        } else {
            console.log("File written successfully");

        }
    });
    db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
        if (!row) {
            return res.status(500).json({ success: false, error: 'Player state not found' });
        }
        let jsondata = JSON.parse(row.json);
        let root = {
            "id": req.body.root.id,
            "children": [],
            "type": req.body.root.type,
            "name": "$root"
        }
        db.run(`INSERT INTO communitytracks (guid, root, prefs, map_dirty, map_title, map_mode_type, map_id, map_stats_triangle_count, map_stats_object_count, is_race_allowed, player_id, profile_name, full_track_url, map_difficulty, map_lighting, is_public, allow_copy, cm_collectable_count, map_thumb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(guid) DO UPDATE SET root = excluded.root, prefs = excluded.prefs, map_title = excluded.map_title, map_stats_triangle_count = excluded.map_stats_triangle_count, map_stats_object_count = excluded.map_stats_object_count, is_race_allowed = excluded.is_race_allowed, full_track_url = excluded.full_track_url, map_difficulty = excluded.map_difficulty, map_lighting = excluded.map_lighting, is_public = excluded.is_public, allow_copy = excluded.allow_copy, cm_collectable_count = excluded.cm_collectable_count, map_thumb = excluded.map_thumb;`, [
            req.body.guid,
            JSON.stringify(root),
            JSON.stringify(req.body.prefs),
            req.body["map-dirty"],
            req.body["map-title"],
            req.body["map-mode-type"],
            req.body["map-id"],
            req.body["map-stats-triangle-count"],
            req.body["map-stats-object-count"],
            req.body["is-race-allowed"],
            uid,
            jsondata["profile-name"],
            `/tracks/${req.body.guid}`,
            req.body["map-difficulty"],
            req.body["map-lighting"],
            req.body["is-public"],
            req.body["allow-copy"],
            req.body["cm-collectable-count"],
            req.body["map-thumb"]
        ], err => {
            if (err) {
                console.error("Error inserting/updating community track:", err);
                res.status(500).json({ success: false });
                return;
            } else {
                db.run(`INSERT OR IGNORE INTO trackcolab (uid, guid) VALUES (?, ?)`, [uid, req.body.guid], function (err) {
                    if (err) {
                        console.error("Error inserting into trackcolab:", err);
                    } else {

                        db.all(`SELECT * FROM trackcolab WHERE guid = ?`, [req.body.guid], (err, row) => {

                            const existingUids = row.map(r => r.uid);
                            console.log(req.body.collaborators)
                            const incomingUids = JSON.parse(req.body.collaborators).map(c => c['player-id']);

                            incomingUids.forEach(uid => {
                                if (!existingUids.includes(uid)) {
                                    db.run(`INSERT INTO trackcolab (uid, guid) VALUES (?, ?)`, [uid, req.body.guid]);
                                }
                            });

                            existingUids.forEach(uid => {
                                if (!incomingUids.includes(uid)) {
                                    db.run(`DELETE FROM trackcolab WHERE uid = ? AND guid = ?`, [uid, req.body.guid]);
                                }
                            });


                            res.status(200).json({ success: true, data: req.body });
                        });
                    }
                });
            }
        })
    });
});


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
    console.log("replay sent to /storage/logs/ here is data:", req.headers);
    console.log(req.query)
    res.status(200).json({ success: true });
})


app.post('/replay/', badTokenAuthv2, replay.single('replay-data'), (req, res) => {
    console.log("replay sent to /replay/ here is data:", req.headers);
    console.log(req.query)
    console.log(req.body)
    console.log(req.file)
    const uid = req.uid
    db.run(
        `UPDATE leaderboard
                    SET replay_url = ?
                    WHERE rowid = (
                        SELECT rowid
                        FROM leaderboard
                        WHERE player_id = ?
                        ORDER BY updated_at DESC
                        LIMIT 1
                    )`,
        ['/replay/' + uid + '/' + req.file.filename, uid],
        function (err) {

            if (err) {
                console.error(err);
                res.status(500).json({ success: false });
                return;
            }

            console.log('Rows updated:', this.changes);
            res.status(200).json({ success: true });
        }
    );
});


app.post('/storage/replay-cloud/', badTokenAuthv2, replayCloud.single('file'), (req, res) => {
    console.log("replay sent to /storage/replay-cloud/ here is data:", req.headers);
    console.log(req.query)
    console.log(req.body);
    console.log(req.file);
    res.status(200).json({ success: true });
})

app.post('/storage/image/', badTokenAuthv2, imageCloud.single('file'), (req, res) => {
    console.log("Image sent to /storage/image/ here is data:", req.headers);
    console.log(req.query)
    console.log(req.body);
    console.log(req.file);
    res.status(200).json({ success: true, data: "/" + req.file.path.replace(/\\/g, '/') });
})

app.get('/images/', async (req, res) => {
    console.log("Image requested from /images/ here is data:", req.headers);
    const { url, w, h } = req.query;
    console.log(req.query)
    if (url.startsWith("/image-cloud/")) {
        const baseDir = path.join(__dirname, 'image-cloud');
        const finalPath = path.resolve(baseDir, url.replace("/image-cloud/", ""));
        if (!finalPath.startsWith(baseDir)) {
            return res.status(403).send('Forbidden: Invalid path');
        }
        if (!fs.existsSync(finalPath)) {
            return res.status(404).end();
        }
        let transform = sharp(finalPath);
        if (w || h) {
            transform = transform.resize({
                width: w ? parseInt(w) : null,
                height: h ? parseInt(h) : null,
                fit: 'contain'
            });
        }
        transform.pipe(res);
    } else if (url.startsWith(url + "/image-cloud/")) {
        const baseDir = path.join(__dirname, 'image-cloud');
        const finalPath = path.resolve(baseDir, url.replace(url + "/image-cloud/", ""));
        if (!finalPath.startsWith(baseDir)) {
            return res.status(403).send('Forbidden: Invalid path');
        }
        if (!fs.existsSync(finalPath)) {
            return res.status(404).end();
        }
        let transform = sharp(finalPath);
        if (w || h) {
            transform = transform.resize({
                width: w ? parseInt(w) : null,
                height: h ? parseInt(h) : null,
                fit: 'contain'
            });
        }
        transform.pipe(res);
    }
});



//This would be how you do it normaly but the game wants it in a really odd way - see above
app.get('/image-cloud/:uid/:id', (req, res) => {
    console.log("/image-cloud")
    const baseDir = path.join(__dirname, 'image-cloud');
    const finalPath = path.resolve(baseDir, req.params.uid, path.basename(req.params.id));

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }

    if (!fs.existsSync(finalPath)) {
        return res.status(404).end();
    }
    res.sendFile(finalPath);
});


app.get('/replay/:uid/:guid', (req, res) => {
    const baseDir = path.join(__dirname, 'replay');
    const finalPath = path.resolve(baseDir, req.params.uid, path.basename(req.params.guid));

    if (!finalPath.startsWith(baseDir)) {
        return res.status(403).send('Forbidden: Invalid path');
    }

    if (!fs.existsSync(finalPath)) {
        return res.status(404).end();
    }

    console.log("GETTING REPLAY FROM:", finalPath);
    res.sendFile(finalPath);
});


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

app.post('/v2/login', express.urlencoded({ extended: false }), (req, res) => {
    console.log("POST /v2/login")
    let decToken;
    try {
        decToken = decryptDRL(req.body.token, "09e027edfde3212431a8758576807083", req.body.time.padStart(16, '0'));
    } catch (E) {
        console.error("Login Decryption failed:", E);
        res.status(400).json({ success: false });
        return
    }
    const responseData = {
        "player-id": decToken.uid,
        permissions: [],
        expires: Math.floor(Date.now() / 1000) + 3600
    };

    console.log(responseData)

    const base64Data = Buffer
        .from(JSON.stringify(responseData))
        .toString('base64');

    db.run(`INSERT INTO user (uid, token, expires) VALUES (?, ?, ?)
                ON CONFLICT(uid) DO UPDATE SET token = excluded.token, expires = excluded.expires;`, [
        decToken.uid,
        req.body.token,
        responseData.expires,
    ], (err) => {
        if (err) {
            console.error("SQLite insert failed:", err);
            res.status(500).json({ success: false });
            return
        } else {
            res.status(200).json({
                success: true,
                token: req.body.token,
                data: base64Data
            });
        }
    })
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

app.get('/social/profile/', badTokenAuthv2, (req, res) => {
    console.log("social profile header for:", req.query);
    const uid = req.uid
    db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
        if (!row) {
            res.status(404).json({ success: false });
            return
        }
        jsondata = JSON.parse(row.json);
        let payload = [{
            "platform-id": "epic-id",
            "player-id": uid,
            "profile-color": jsondata["profile-color"],
            "profile-rank": 1,
            "profile-name": jsondata["profile-name"],
            "username": jsondata["profile-name"],
            "has-game": true,
        }];
        const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
        res.status(200).json({
            success: true, data: base64Data
        });
    });
})

app.get('/state/game/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/state/', badTokenAuthv2, (req, res) => {
    const token = req.headers['x-access-jsonwebtoken'];
    console.log("req sent to /state/ TOKEN:", token);
    let jsondata;
    const uid = req.uid;
    console.log("UID:", uid);
    db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
        if (err) {
            console.error("Error fetching JSON:", err);
            res.status(500).json({ success: false });
            return;
        } else if (!row) {
            console.log("No player state found for UID:", uid);
            jsondata = { lastState: null };
            const base64Data = Buffer.from(JSON.stringify(jsondata)).toString('base64');
            res.status(200).json({ success: true, data: base64Data });
            return;
        } else {
            let jsondata;
            jsondata = JSON.parse(row.json);

            jsondata['profile-developer'] = (uid === "b9365d125935475b8327162c66a25e12");

            const base64Data = Buffer
                .from(JSON.stringify(jsondata))
                .toString('base64');

            res.status(200).json({ success: true, data: base64Data });
        }
    });
})

//TODO: stop using let body = '';
app.post('/state/', (req, res) => {
    const token = req.headers['x-access-jsonwebtoken'];
    console.log("post sent to /state/ TOKEN:", token);
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {


        const raw = body.startsWith('state=') ? body.slice(6) : body;
        const parsed = JSON.parse(decodeURIComponent(raw));

        db.get(`SELECT uid, expires FROM user WHERE token = ?`, [token], (err, row) => {
            if (err || !row) {
                console.error("Error fetching UID:", err);
                res.status(404).json({ success: false });
                return;
            } else if (row.expires < Math.floor(Date.now() / 1000)) {
                console.error("Error fetching UID: Token expired");
                res.status(401).json({ success: false, message: "Token invalid" });
                return;
            } else {
                const uid = row.uid;
                db.get(`SELECT json FROM playerstate WHERE uid = ?`, [row.uid], (err, json) => {
                    if (err) {
                        console.error("Error fetching JSON:", err);
                        res.status(500).json({ success: false });
                        return;
                    }
                    if ('profile-name' in parsed && parsed['profile-name'].trim() === "") {
                        console.warn("Blocked empty profile-name write");
                        parsed['profile-name'] = JSON.parse(json.json)['profile-name'];
                    }

                    db.run(`INSERT INTO playerstate (uid, json) VALUES (?, ?)
                    ON CONFLICT(uid) DO UPDATE SET json = excluded.json;`, [
                        uid,
                        JSON.stringify(parsed)
                    ], (err) => {
                        if (err) {
                            console.error("SQLite insert failed:", err);
                            res.status(500).json({ success: false });
                            return;
                        } else {
                            res.status(200).json({ success: true });
                        }
                    })
                });
            }
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


app.get('/tournaments/:guid/register', badTokenAuthv2, (req, res) => {
    console.log("/tournaments/:guid/register");
    const uid = req.uid;
    db.run(`INSERT INTO tournamentsregistered (uid, guid) VALUES ON CONFLICT (uid, guid) DO NOTHING`, [uid, req.params.guid], (err) => {
        res.status(200).json({ success: true });
    })
})


app.get('/tournaments/:guid/unregister', badTokenAuthv2, (req, res) => {
    console.log("/tournaments/:guid/register");
    const uid = req.uid;
    db.run(`DELETE FROM tournamentsregistered WHERE uid = ? AND guid = ?`, [uid, req.params.guid], (err) => {
        res.status(200).json({ success: true });
    })
})

app.get(`/tournaments/:guid/subscription`, (req, res) => {
    console.log("/tournaments/:guid/subscription");
    res.status(200).json({
        success: true, data:
        {
            "tournament-id": "tournament-001",
            "player-id": "b9365d125935475b8327162c66a25e12"
        }
    });
})


app.get(`/tournaments/:guid/matches/:mid/countdown`, (req, res) => {
    console.log("/tournaments/:guid/matches/:mid/countdown");
    const base64Data = Buffer.from(JSON.stringify(true)).toString('base64');
    res.status(200).json({
        success: true, data: base64Data
    });
})

app.get(`/tournaments/subscription`, (req, res) => {
    console.log("/tournaments/subscription");
    res.status(200).json({ success: true, data: [] });
})


app.get(`/player/tournaments/`, (req, res) => {
    console.log("/player/tournaments/");
    res.status(200).json({ success: true, data: [] });
})

app.get(`/tournaments/:guid/matches/:mid`, (req, res) => {
    console.log("/tournaments/:guid/matches/:mid");
    const now = new Date();
    let yyyy = now.getFullYear();
    let MM = String(now.getMonth() + 1).padStart(2, '0');
    let dd = String(now.getDate()).padStart(2, '0');
    let HH = String(now.getHours()).padStart(2, '0');
    let mm = String(now.getMinutes()).padStart(2, '0');
    let ss = String(now.getSeconds()).padStart(2, '0');

    const timeStr = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;
    res.status(200).json({
        success: true, data: [
            {
                "id": "match-001",
                "map": "MP-95a",
                "track": "MT-964",
                "status": "active",
                "start-at": timeStr,
                "mode": "match_points",
                "players-size": 2,
                "heats": 4,
                "active-heat": 1,
                "current-heat": 1,
                "num-winners": 1,
                "players": [{
                    "player-id": "b9365d125935475b8327162c66a25e12",
                    "profile-name": "Ninety9prob",
                    "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64"
                }],
                "player-ids": [
                    "b9365d125935475b8327162c66a25e12",
                    "player_steam_002"
                ]
            }
        ]
    });
})

app.get(`/tournaments/:guid`, (req, res) => {
    console.log("/tournaments/:guid");
    let StartTime = new Date(2026, 2, 27, 15, 30, 0, 0);
    const now = new Date();
    now.setSeconds(now.getSeconds());
    let yyyy = now.getFullYear();
    let MM = String(now.getMonth() + 1).padStart(2, '0');
    let dd = String(now.getDate()).padStart(2, '0');
    let HH = String(now.getHours()).padStart(2, '0');
    let mm = String(now.getMinutes()).padStart(2, '0');
    let ss = String(now.getSeconds()).padStart(2, '0');

    const timeStr = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;


    const now2 = new Date();
    now2.setSeconds(now2.getSeconds() + 1000);
    yyyy = now2.getFullYear();
    MM = String(now2.getMonth() + 1).padStart(2, '0');
    dd = String(now2.getDate()).padStart(2, '0');
    HH = String(now2.getHours()).padStart(2, '0');
    mm = String(now2.getMinutes()).padStart(2, '0');
    ss = String(now2.getSeconds()).padStart(2, '0');

    const timeStr2 = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    yyyy = StartTime.getFullYear();
    MM = String(StartTime.getMonth() + 1).padStart(2, '0');
    dd = String(StartTime.getDate()).padStart(2, '0');
    HH = String(StartTime.getHours() + 1).padStart(2, '0');
    mm = String(StartTime.getMinutes()).padStart(2, '0');
    ss = String(StartTime.getSeconds()).padStart(2, '0');
    StartTime = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    res.status(200).json({
        success: true, data: [{
            "id": "tournament-001",
            "guid": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Sunday Session EU",
            "description": "Community Tournament featuring a recent community-made track",
            "region": "eu", //needs to be lowercase (default is us)
            "type": "Simple", //this is not even used

            "players-size": 1,
            "max-players": 16,
            "player-ids": ["b9365d125935475b8327162c66a25e12"],

            "status": "active",
            "progression": "manual",

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
                    "title": "Qualifiers 2",
                    "status": "idle",
                    "norder": 0,
                    "mode": "match_points",
                    "game-mode": "race",
                    "is-custom-map": false,
                    "start-at": timeStr,
                    "map": "MP-95a",
                    "track": "MT-964",
                    "matches": [
                        {
                            "id": "match-001",
                            "map": "MP-95a",
                            "track": "MT-964",
                            "status": "idle",
                            "start-at": timeStr,
                            "end-at": timeStr2,
                            "current-time": timeStr,
                            "mode": "match_points",
                            "players-size": 2,
                            "heats": 4,
                            "active-heat": 1,
                            "current-heat": 1,
                            "num-winners": 1,
                            "players": [{
                                "player-id": "b9365d125935475b8327162c66a25e12",
                                "profile-name": "Ninety9prob",
                                "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64"
                            }],
                            "player-ids": [
                                "b9365d125935475b8327162c66a25e12",
                                "player_steam_002"
                            ]
                        }
                    ]
                },
                {
                    "title": "Qualifiers",
                    "status": "active",
                    "norder": 1,
                    "mode": "match_points",
                    "game-mode": "race",
                    "is-custom-map": false,
                    "start-at": timeStr,
                    "map": "MP-95a",
                    "track": "MT-964",
                    "matches": [
                        {
                            "id": "match-001",
                            "map": "MP-95a",
                            "track": "MT-964",
                            "status": "active",
                            "start-at": timeStr,
                            "end-at": timeStr2,
                            "current-time": timeStr,
                            "mode": "match_points",
                            "players-size": 2,
                            "heats": 2,
                            "active-heat": 1,
                            "current-heat": 1,
                            "num-winners": 1,
                            "players": [{
                                "player-id": "b9365d125935475b8327162c66a25e12",
                                "profile-name": "Ninety9prob",
                                "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64"
                            }],
                            "player-ids": [
                                "b9365d125935475b8327162c66a25e12",
                                "player_steam_002"
                            ]
                        }
                    ]
                }
            ]
        }]
    });
})

app.get('/tournaments/', (req, res) => {
    console.log("/tournaments/");
    let StartTime = new Date(2026, 2, 27, 15, 30, 0, 0);
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);
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
    HH = String(StartTime.getHours() + 1).padStart(2, '0');
    mm = String(StartTime.getMinutes()).padStart(2, '0');
    ss = String(StartTime.getSeconds()).padStart(2, '0');
    StartTime = `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}-00`;

    res.status(200).json({
        success: true, data: [{
            "id": "tournament-001",
            "guid": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Sunday Session EU",
            "description": "Community Tournament featuring a recent community-made track",
            "region": "eu", //needs to be lowercase (default is us)
            "type": "Simple", //this is not even used

            "players-size": 1,
            "max-players": 16,
            "player-ids": ["b9365d125935475b8327162c66a25e12"],

            "status": "active",
            "progression": "manual",

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
                    "status": "active",
                    "norder": 1,
                    "mode": "match_points",
                    "game-mode": "race",
                    "is-custom-map": false,
                    "start-at": timeStr,
                    "map": "MP-95a",
                    "track": "MT-964",
                    "matches": [
                        {
                            "id": "match-001",
                            "map": "MP-95a",
                            "track": "MT-964",
                            "status": "active",
                            "start-at": timeStr,
                            "mode": "match_points",
                            "players-size": 2,
                            "heats": 4,
                            "active-heat": 1,
                            "current-heat": 1,
                            "num-winners": 1,
                            "players": [{
                                "player-id": "b9365d125935475b8327162c66a25e12",
                                "profile-name": "Ninety9prob",
                                "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64"
                            }],
                            "player-ids": [
                                "b9365d125935475b8327162c66a25e12",
                                "player_steam_002"
                            ]
                        }
                    ]
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

function mapLeaderboardSqlToJson(row, i) {
    return {
        "player-id": row[i].player_id,
        "map": row[i].map,
        "track": row[i].track,
        "diameter": row[i].diameter,
        "drl-official": row[i].drl_official,
        "drone-name": row[i].drone_name,
        "drone-guid": row[i].drone_guid,
        "profile-platform-id": row[i].profile_platform_id,
        "username": row[i].username,
        "profile-color": row[i].profile_color,
        "profile-thumb": row[i].profile_thumb,
        "profile-name": row[i].profile_name,
        "profile-platform": row[i].profile_platform,
        "is-custom-map": row[i].is_custom_map,
        "custom-map": row[i].custom_map,
        "mission": row[i].mission,
        "group-id": row[i].group_id,
        "region": row[i].region,
        "replay-url": url + row[i].replay_url,
        "game-type": row[i].game_type,
        "drone-thumb": row[i].drone_thumb,
        "multiplayer": row[i].multiplayer,
        "multiplayer-room-id": row[i].multiplayer_room_id,
        "multiplayer-room-size": row[i].multiplayer_room_size,
        "multiplayer-player-id": row[i].multiplayer_player_id,
        "multiplayer-master-id": row[i].multiplayer_master_id,
        "multiplayer-player-position": row[i].multiplayer_player_position,
        "flag-url": row[i].flag_url,
        "score-type": row[i].score_type,
        "match-id": row[i].match_id,
        "tryouts": row[i].tryouts,
        "battery-resistance": row[i].battery_resistance,
        "controller-type": row[i].controller_type,
        "position": i + 1,
        "score": row[i].score,
        "score-check": row[i].score_check,
        "score-double-check": row[i].score_double_check,
        "score-cheat": row[i].score_cheat,
        "score-cheat-ratio": row[i].score_cheat_ratio,
        "score-cheat-samples": row[i].score_cheat_samples,
        "crash-count": row[i].crash_count,
        "top-speed": row[i].top_speed,
        "time-in-first": row[i].time_in_first,
        "lap-times": TOJSON(row[i].lap_times),
        "gate-times": TOJSON(row[i].gate_times),
        "fastest-lap": row[i].fastest_lap,
        "slowest-lap": row[i].slowest_lap,
        "total-distance": row[i].total_distance,
        "percentile": row[i].percentile,
        "order-col": row[i].order_col,
        "high-score": row[i].high_score,
        "race-id": row[i].race_id,
        "limit-col": row[i].limit_col,
        "heat": row[i].heat,
        "custom-physics": row[i].custom_physics,
        "drl-pilot-mode": row[i].drl_pilot_mode,
        "drone-rig": row[i].drone_rig,
        "drone-hash": row[i].drone_hash
    }
}

//TODO: This
app.get('/leaderboards/user/', (req, res) => {
    const token = req.headers['x-access-jsonwebtoken']
    console.log(req.query)
    db.get(`SELECT uid, expires FROM user WHERE token = ?`, [token], (err, row) => {
        if (err || !row) {
            console.error("Error uid FROM user:", err);
            res.status(400).json({ success: false });
            return;
        }

    });
    let data = {
        leaderboard: [
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
                progression: null,
                "high-score": false,
                diameter: 7,
                "drl-official": true
            }
        ]
    };
    res.status(200).json({
        success: true, data: data
    });
});

app.post('/leaderboards/user/reset/', express.urlencoded({ extended: true }), badTokenAuthv2, (req, res) => {
    const uid = req.uid;
    fs.readdir("replay/" + uid, (err, files) => {
        if (err) {
            console.error(err)
            res.status(500).json({ success: false });
            return;
        }

        for (const file of files) {
            fs.unlink(path.join("replay/" + uid, file), (err) => {
                if (err) {
                    console.error(err)
                    res.status(500).json({ success: false });
                    return;
                }
                db.run(`DELETE FROM leaderboard WHERE player_id = ?`, [uid], function (err) {
                    if (err) {
                        res.status(500).json({ success: false });
                        return;
                    } else {
                        res.status(200).json({ success: true });
                        console.log(`Deleted ${this.changes} leaderboard entries for user ${uid}`);
                    }
                });
            });
        }
    });
});

app.post('/leaderboards/user/reset/track/', express.urlencoded({ extended: true }), badTokenAuthv2, (req, res) => {
    console.log(req.body)
    let sql;
    let args;
    if (req.body.isCustom === 'true') {
        sql = `AND custom_map = ?`
        args = [uid, req.body.mapID, req.body.customMapId]
    } else {
        sql = `AND track = ?`
        args = [uid, req.body.mapID, req.body.trackID]
    }
    const uid = req.uid;
    db.run(`DELETE FROM leaderboard WHERE player_id = ? AND map = ?` + sql, args, function (err) {
        if (err) {
            res.status(500).json({ success: false });
        } else {
            res.status(200).json({ success: true });
            console.log(`Deleted ${this.changes} leaderboard entries for user ${uid}`);
        }
    });
});

app.post('/leaderboards/', express.urlencoded({ extended: false }), badTokenAuthv2, (req, res) => {
    console.log(TOJSON(req.body.list))
    console.log("NEW LEADERBOARD POST:")
    const parsed = JSON.parse(req.body.list);
    db.all(`SELECT * FROM communitytracks WHERE guid = ?`, [parsed[0]['custom-map']], (err, Track) => {
        const Tracks = Track
        let highscore;
        const uid = req.uid;
        const diameter = Number(parsed[0].diameter);
        let query = ""
        let inputs = []
        if (parsed[0]['is-custom-map'] == true) {
            query = `WHERE player_id = ? AND map = ? AND track = ? AND diameter = ? AND drl_official = ? AND custom_map = ? `
            inputs = [uid, parsed[0].map, parsed[0].track, diameter, parsed[0]["drl-official"], parsed[0]['custom-map']]
        } else {
            query = `WHERE player_id = ? AND map = ? AND track = ? AND diameter = ? AND drl_official = ? `
            inputs = [uid, parsed[0].map, parsed[0].track, diameter, parsed[0]["drl-official"]]
        }
        console.log(`SELECT * FROM leaderboard ${query} `, inputs)
        db.get(`SELECT * FROM leaderboard ${query}`, inputs, (err, row) => {
            if (err || !row) {
                console.error("Error fetching leaderboard:", err);
            }
            const isNewRow = !row;
            const isBetterScore =
                row && row.score != null && parsed[0].score != null
                    ? parsed[0].score < row.score
                    : true;
            if (isBetterScore || isNewRow) {
                if (!isNewRow) {
                    let rep = row.replay_url
                    let prefix = `/replay/${uid}/`
                    try {
                        if (rep.startsWith(prefix)) {
                            oldReplayfile = rep.substring(prefix.length)
                            fs.unlink(path.join("replay", uid, oldReplayfile), (err) => {
                                if (err) {
                                    console.error("Error deleting old replay file:", err);
                                }
                            });
                        }
                    } catch (e) {
                        console.log("No old replay")
                    }
                }
                db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
                    if (err) {
                        console.error("Error fetching JSON:", err);
                        res.status(500).json({ success: false });
                        return;
                    }

                    if (!row) {
                    } else {
                        jsondata = JSON.parse(row.json);
                    }



                    const stmt = db.prepare(
                        `INSERT INTO leaderboard (player_id, profile_name, profile_color, map, track, is_custom_map, custom_map, mission, group_id, game_type, diameter, drone_name, drone_thumb, multiplayer, multiplayer_room_id, multiplayer_room_size, multiplayer_player_id, multiplayer_master_id, multiplayer_player_position, flag_url, score_type, match_id, tryouts, battery_resistance, controller_type, score, score_check, score_double_check, score_cheat, score_cheat_ratio, score_cheat_samples, crash_count, top_speed, time_in_first, lap_times, gate_times, fastest_lap, slowest_lap, total_distance, order_col, high_score, race_id, limit_col, heat, custom_physics, drl_official, drl_pilot_mode, drone_guid, drone_rig, drone_hash, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                                ON CONFLICT(player_id, map, track, diameter, drl_official, custom_map) DO UPDATE SET score = excluded.score, score_check = excluded.score_check, score_double_check = excluded.score_double_check, controller_type = excluded.controller_type, score_cheat = excluded.score_cheat, score_cheat_ratio = excluded.score_cheat_ratio, score_cheat_samples = excluded.score_cheat_samples, crash_count = excluded.crash_count, top_speed = excluded.top_speed, lap_times = excluded.lap_times, gate_times = excluded.gate_times, fastest_lap = excluded.fastest_lap, slowest_lap = excluded.slowest_lap, total_distance = excluded.total_distance, race_id = excluded.race_id, drone_name = excluded.drone_name, drone_guid = excluded.drone_guid, updated_at = datetime('now');`
                    );
                    stmt.run(
                        uid,
                        jsondata['profile-name'],
                        jsondata['profile-color'],
                        parsed[0].map ? parsed[0].map : "unknown",
                        parsed[0].track ? parsed[0].track : "unknown",
                        parsed[0]['is-custom-map'] ? parsed[0]['is-custom-map'] : true,
                        parsed[0]['custom-map'] ? parsed[0]['custom-map'] : null,
                        parsed[0]['mission'] ? parsed[0]['mission'] : null,
                        parsed[0]['group-id'] ? parsed[0]['group-id'] : null,
                        parsed[0]['game-type'] ? parsed[0]['game-type'] : null,
                        parsed[0]['diameter'] ? parsed[0]['diameter'] : 7,
                        parsed[0]['drone-name'] ? parsed[0]['drone-name'] : null,
                        parsed[0]['drone-thumb'] ? parsed[0]['drone-thumb'] : null,
                        parsed[0]['multiplayer'] ? parsed[0]['multiplayer'] : null,
                        parsed[0]['multiplayer-room-id'] ? parsed[0]['multiplayer-room-id'] : null,
                        parsed[0]['multiplayer-room-size'] ? parsed[0]['multiplayer-room-size'] : null,
                        parsed[0]['multiplayer-player-id'] ? parsed[0]['multiplayer-player-id'] : null,
                        parsed[0]['multiplayer-master-id'] ? parsed[0]['multiplayer-master-id'] : null,
                        parsed[0]['multiplayer-player-position'] ? parsed[0]['multiplayer-player-position'] : null,
                        parsed[0]['flag-url'] ? parsed[0]['flag-url'] : null,
                        parsed[0]['score-type'] ? parsed[0]['score-type'] : null,
                        parsed[0]['match-id'] ? parsed[0]['match-id'] : null,
                        parsed[0]['tryouts'] ? parsed[0]['tryouts'] : null,
                        parsed[0]['battery-resistance'] ? parsed[0]['battery-resistance'] : null,
                        parsed[0]['controller-type'] ? parsed[0]['controller-type'] : null,
                        parsed[0]['score'] ? parsed[0]['score'] : null,
                        parsed[0]['score-check'] ? parsed[0]['score-check'] : null,
                        parsed[0]['score-double-check'] ? parsed[0]['score-double-check'] : null,
                        parsed[0]['score-cheat'] ? parsed[0]['score-cheat'] : null,
                        parsed[0]['score-cheat-ratio'] ? parsed[0]['score-cheat-ratio'] : null,
                        parsed[0]['score-cheat-samples'] ? parsed[0]['score-cheat-samples'] : null,
                        parsed[0]['crash-count'] ? parsed[0]['crash-count'] : null,
                        parsed[0]['top-speed'] ? parsed[0]['top-speed'] : null,
                        parsed[0]['time-in-first'] ? parsed[0]['time-in-first'] : null,
                        parsed[0]['lap-times'] ? JSON.stringify(parsed[0]['lap-times']) : null,
                        parsed[0]['gate-times'] ? JSON.stringify(parsed[0]['gate-times']) : null,
                        parsed[0]['fastest-lap'] ? parsed[0]['fastest-lap'] : null,
                        parsed[0]['slowest-lap'] ? parsed[0]['slowest-lap'] : null,
                        parsed[0]['total-distance'] ? parsed[0]['total-distance'] : null,
                        parsed[0]['order-col'] ? parsed[0]['order-col'] : null,
                        parsed[0]['high-score'] ? parsed[0]['high-score'] : null,
                        parsed[0]['race-id'] ? parsed[0]['race-id'] : null,
                        parsed[0]['limit-col'] ? parsed[0]['limit-col'] : null,
                        parsed[0]['heat'] ? parsed[0]['heat'] : null,
                        parsed[0]['custom-physics'] ? parsed[0]['custom-physics'] : null,
                        parsed[0]['drl-official'] ? parsed[0]['drl-official'] : null,
                        parsed[0]['drl-pilot-mode'] ? parsed[0]['drl-pilot-mode'] : null,
                        parsed[0]['drone-guid'] ? parsed[0]['drone-guid'] : null,
                        parsed[0]['drone-rig'] ? parsed[0]['drone-rig'] : null,
                        parsed[0]['drone-hash'] ? parsed[0]['drone-hash'] : null,
                        (err) => {

                            if (err) {
                                console.error("SQLite insert failed:", err);
                                return;
                            }

                            stmt.finalize(err => {
                                if (err) console.error("Error finalizing statement:", err);
                            });
                        });
                    highscore = true
                });
            } else {
                highscore = false
            }
            db.get(`SELECT * FROM playerprogression WHERE uid = ?`, [uid], (err, row) => {
                if (err || !row) {
                    console.error("Error fetching playerprogression:", err);
                    res.status(500).json({ success: false });
                    return;
                }
                let xpValue = 0
                console.log(Tracks)
                for (let i = 0; i < Tracks.length; i++) {
                    console.log(Tracks[i]['xp_value'])
                    if (Tracks[i].guid === parsed[0]['custom-map']) {
                        xpValue = Tracks[i]['xp_value'];
                    }
                }
                let NEWXP = row.xp + xpValue;
                if (NEWXP >= row.next_level_xp) {
                    row.previous_level_xp = row.next_level_xp;
                    row.level += 1;
                    row.next_level_xp = row.next_level_xp * 1.5;
                }
                const currentTIME = new Date()
                if (currentTIME > new Date(row.weekend)) {
                    xpThisWeek = 0 + xpValue;
                } else {
                    xpThisWeek = row.xp_this_week + xpValue;
                }
                let progression = {
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
                db.run(`INSERT INTO playerprogression (uid, xp, previous_level_xp, next_level_xp, level, rank_name, rank_index, rank_position, rank_round_start, rank_round_end, streak_points, daily_completed_maps, goal_daily_completed_maps, prizes, xp_this_week, weekstart, weekend) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT (uid) DO UPDATE SET xp = excluded.xp, previous_level_xp = excluded.previous_level_xp, next_level_xp = excluded.next_level_xp, level = excluded.level, xp_this_week = excluded.xp_this_week, weekstart = excluded.weekstart, weekend = excluded.weekend;`, [
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
                    JSON.stringify(progression.prizes),
                    xpThisWeek,
                    getEndOfLastISOWeek(),
                    getStartOfNextISOWeek()
                ], err => {
                    if (err) {
                        console.error("SQLite insert failed:", err);
                        res.status(500).json({ success: false });
                        return;
                    } else {
                        db.all(`SELECT * FROM leaderboard ${query}`, inputs,
                            (err, rows) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).json({ success: false });
                                    return;
                                }
                                const position = rows.findIndex(r => r.player_id === uid) + 1;
                                let data = [
                                    {
                                        "player-id": rows[position - 1].player_id,
                                        "map": rows[position - 1].map,
                                        "track": rows[position - 1].track,
                                        "diameter": rows[position - 1].diameter,
                                        "drl-official": rows[position - 1].drl_official,
                                        "drone-name": rows[position - 1].drone_name,
                                        "drone-guid": rows[position - 1].drone_guid,
                                        "profile-platform-id": rows[position - 1].profile_platform_id,
                                        "username": rows[position - 1].username,
                                        "profile-color": rows[position - 1].profile_color,
                                        "profile-thumb": rows[position - 1].profile_thumb,
                                        "profile-name": rows[position - 1].profile_name,
                                        "profile-platform": rows[position - 1].profile_platform,
                                        "is-custom-map": rows[position - 1].is_custom_map,
                                        "custom-map": rows[position - 1].custom_map,
                                        "mission": rows[position - 1].mission,
                                        "group-id": rows[position - 1].group_id,
                                        "region": rows[position - 1].region,
                                        "replay-url": url + rows[position - 1].replay_url,
                                        "game-type": rows[position - 1].game_type,
                                        "drone-thumb": rows[position - 1].drone_thumb,
                                        "multiplayer": rows[position - 1].multiplayer,
                                        "multiplayer-room-id": rows[position - 1].multiplayer_room_id,
                                        "multiplayer-room-size": rows[position - 1].multiplayer_room_size,
                                        "multiplayer-player-id": rows[position - 1].multiplayer_player_id,
                                        "multiplayer-master-id": rows[position - 1].multiplayer_master_id,
                                        "multiplayer-player-position": rows[position - 1].multiplayer_player_position,
                                        "flag-url": rows[position - 1].flag_url,
                                        "score-type": rows[position - 1].score_type,
                                        "match-id": rows[position - 1].match_id,
                                        "tryouts": rows[position - 1].tryouts,
                                        "battery-resistance": rows[position - 1].battery_resistance,
                                        "controller-type": rows[position - 1].controller_type,
                                        "position": position,
                                        "score": rows[position - 1].score,
                                        "score-check": rows[position - 1].score_check,
                                        "score-double-check": rows[position - 1].score_double_check,
                                        "score-cheat": rows[position - 1].score_cheat,
                                        "score-cheat-ratio": rows[position - 1].score_cheat_ratio,
                                        "score-cheat-samples": rows[position - 1].score_cheat_samples,
                                        "crash-count": rows[position - 1].crash_count,
                                        "top-speed": rows[position - 1].top_speed,
                                        "time-in-first": rows[position - 1].time_in_first,
                                        "lap-times": rows[position - 1].lap_times,
                                        "gate-times": rows[position - 1].gate_times,
                                        "fastest-lap": rows[position - 1].fastest_lap,
                                        "slowest-lap": rows[position - 1].slowest_lap,
                                        "total-distance": rows[position - 1].total_distance,
                                        "percentile": rows[position - 1].percentile,
                                        "order-col": rows[position - 1].order_col,
                                        "high-score": rows[position - 1].high_score,
                                        "race-id": rows[position - 1].race_id,
                                        "limit-col": rows[position - 1].limit_col,
                                        "heat": rows[position - 1].heat,
                                        "custom-physics": rows.custom_physics,
                                        "drl-pilot-mode": rows.drl_pilot_mode,
                                        "drone-rig": rows.drone_rig,
                                        "drone-hash": rows.drone_hash,
                                        "progression": progression,
                                        "high-score": highscore
                                    }
                                ]
                                res.status(200).json({
                                    success: true, data: data
                                });
                            });
                    }
                })
            })
        })
    });
})

app.get('/leaderboards/rivals/', (req, res) => {
    const token = req.headers['x-access-jsonwebtoken']
    console.log("req sent to /leaderboards/rivals/ headers are:", req.headers);
    console.log(req.query)
    const uid = req.query['player-id'];
    const diameter = Number(req.query.diameter);
    const drlOfficial = req.query["drl-official"] === "true" ? 1 : 0;
    let query;
    let inputs;
    if (req.query['is-custom-map'] == `true`) {
        query = `WHERE map = ? AND track = ? AND diameter = ? AND drl_official = ? AND custom_map = ? `
        inputs = [req.query.map, req.query.track, diameter, drlOfficial, req.query['custom-map']]
    } else {
        query = `WHERE map = ? AND track = ? AND diameter = ? AND drl_official = ? `
        inputs = [req.query.map, req.query.track, diameter, drlOfficial]
    }
    let player_pos = 0
    db.all(`SELECT * FROM leaderboard ` + query + `ORDER BY score ASC`, inputs, (err, row) => {
        if (err || row.length === 0) {
            console.error("Error fetching leaderboard:", err);
            let jsondata = {
                "top": [
                    null
                ],
                "player": 0,
                "rivals": [null],
                "past": null
            }
            res.status(200).json({
                success: true, data: jsondata
            });
        } else {
            let rivals = []
            row[0].position = 1
            for (let i = 0; i < row.length; i++) {
                if (row[i].player_id == uid) {
                    player_pos = i

                    const RIVAL_WINDOW = 3;
                    let start = player_pos - 1;
                    let end = player_pos + RIVAL_WINDOW;

                    if (start < 0) {
                        end += -start;
                        start = 0;
                    }
                    if (end > row.length) {
                        start -= (end - row.length);
                        start = Math.max(0, start);
                    }

                    for (let i = start; i < end; i++) {
                        if (row[i]) {
                            console.log(i)
                            console.log(row[i])
                            rivals.push(mapLeaderboardSqlToJson(row, i));
                        }
                    }
                    break;
                }
            }
            let jsondata = {
                "top": [
                    mapLeaderboardSqlToJson(row, 0)
                ],
                "player": player_pos,
                "rivals": rivals,
                "past": null // not needed or used
            }
            res.status(200).json({
                success: true, data: jsondata
            });
        }
    });
});

app.get(`/replay/rivals/`, (req, res) => {
    const token = req.headers['x-access-jsonwebtoken']
    console.log("req sent to /leaderboards/rivals/ headers are:", req.headers);
    console.log(req.query)
    const uid = req.query['player-id'];
    const diameter = Number(req.query.diameter);
    const drlOfficial = req.query["drl-official"] === "true" ? 1 : 0;
    let query;
    let inputs;
    if (req.query['is-custom-map'] == `true`) {
        query = `WHERE map = ? AND track = ? AND diameter = ? AND drl_official = ? AND custom_map = ? `
        inputs = [req.query.map, req.query.track, diameter, drlOfficial, req.query['custom-map']]
    } else {
        query = `WHERE map = ? AND track = ? AND diameter = ? AND drl_official = ? `
        inputs = [req.query.map, req.query.track, diameter, drlOfficial]
    }
    let player_pos = 0
    db.all(`SELECT * FROM leaderboard ` + query + `ORDER BY score ASC`, inputs, (err, row) => {
        if (err || row.length === 0) {
            console.error("Error fetching leaderboard:", err);
            let jsondata = {
                "top": [
                    null
                ],
                "player": -1,
                "rivals": [null],
                "past": null
            }
            res.status(200).json({
                success: true, data: jsondata
            });
        } else {
            let rivals = []
            let past = null
            row[0].position = 1
            for (let i = 0; i < row.length; i++) {
                if (row[i].player_id == uid) {
                    player_pos = i
                    past = mapLeaderboardSqlToJson(row, i)
                    if (row[i - 1] && row[i + 1]) {
                        i = i - 1
                        let data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        i++
                        data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        i++
                        data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        break
                    } else if (row[i - 1]) {
                        i = i - 1
                        let data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        i++;
                        data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        break
                    } else {
                        let data = mapLeaderboardSqlToJson(row, i)
                        rivals.push(data)
                        break
                    }
                }
            }
            let jsondata = {
                "top": [
                    row[0]
                ],
                "player": player_pos,
                "rivals": rivals,
                "past": past
            }
            console.log(jsondata)
            res.status(200).json({
                success: true, data: jsondata
            });
        }
    });
})
app.get('/leaderboards/', (req, res) => {
    let limit = 10
    let page = 1
    if (!req.query.limit) {
        limit = 10
    } else {
        limit = req.query.limit
    }
    if (!req.query.page || req.query.page == 0) {
        page = 1
    } else {
        page = req.query.page
    }

    const offset = (page - 1) * limit;
    const isCustomMap = req.query["is-custom-map"] === "true";

    const diameter = Number(req.query.diameter);
    const drlOfficial = req.query["drl-official"] === "true" ? 1 : 0;
    if (isCustomMap) {
        db.all(`SELECT * FROM leaderboard WHERE custom_map = ? AND diameter = ? AND drl_official = ? ORDER BY score ASC LIMIT ? OFFSET ?`, [req.query["custom-map"], diameter, drlOfficial, limit, offset], (err, row) => {
            if (err || row.length === 0) {
                console.error("Error fetching leaderboard:", err);
                res.status(200).json({
                    success: true, data: {
                        "leaderboard": null,
                        "pagging": { "page": page, "limit": limit, "total": 2 }
                    }
                });
            } else {
                let jsondata = []
                for (let i = 0; i < row.length; i++) {
                    let data = mapLeaderboardSqlToJson(row, i)
                    jsondata.push(data)
                }
                res.status(200).json({
                    success: true, data: {
                        "leaderboard": jsondata,
                        "pagging": { "page": page, "limit": limit, "total": Math.ceil(row.length / limit) }
                    }
                });
            }
        });

    } else {
        db.all(`SELECT * FROM leaderboard WHERE map = ? AND track = ? AND diameter = ? AND drl_official = ? ORDER BY score ASC LIMIT ? OFFSET ?`, [req.query.map, req.query.track, diameter, drlOfficial, limit, offset], (err, row) => {
            if (err || row.length === 0) {
                console.error("Error fetching leaderboard:", err);
                res.status(200).json({
                    success: true, data: {
                        "leaderboard": null,
                        "pagging": { "page": page, "limit": limit, "total": 2 }
                    }
                });
            } else {
                let jsondata = []
                for (let i = 0; i < row.length; i++) {
                    let data = mapLeaderboardSqlToJson(row, i)
                    jsondata.push(data)
                }
                res.status(200).json({
                    success: true, data: {
                        "leaderboard": jsondata,
                        "pagging": { "page": page, "limit": limit, "total": Math.ceil(row.length / limit) }
                    }
                });
            }
        });
    }
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

app.get('/experience-points/ranking/', badTokenAuthv2, (req, res) => {
    console.log("req sent to /experience-points/ranking/:", req.headers);
    const uid = req.uid;
    db.get(`SELECT league_guid FROM playerprogression WHERE uid = ?`, [uid], (err, row) => {
        if (err || !row) {
            console.error("Error fetching playerprogression:", err);
            res.status(500).json({ success: false });
            return;
        } else {
            if (row.xp_this_week == 0) {
                res.status(200).json({ success: true, data: null });
            } else {
                const leagueGuid = row.league_guid;
                db.all(`SELECT * FROM playerprogression WHERE league_guid = ?`, [leagueGuid], (err, row) => {
                    if (err || !row) {
                        console.error("Error fetching playerprogression:", err);
                        res.status(500).json({ success: false });
                        return;
                    } else {
                        let ranking = []
                        //TODO: Rework this
                        for (let i = 0; i < row.length; i++) {
                            if (row[i].uid == uid) {
                                let data = {
                                    "is-player": true,
                                    "is-top": i < 3 ? true : false,
                                    "is-bottom": i > row.length - 3 && i > 6 ? true : false,
                                    "profile-color": "3FA9F5",
                                    "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64",
                                    "profile-name": "YOU",
                                    "position": i + 1,
                                    "type": "player",
                                    "xp": row[i].xp_this_week
                                }
                                ranking.push(data)
                            } else {
                                let data = {
                                    "is-player": false,
                                    "is-top": i < 3 ? true : false,
                                    "is-bottom": i > row.length - 3 && i > 6 && leagueGuid !== "LG-1" ? true : false,
                                    "profile-color": "3FA9F5",
                                    "profile-thumb": "https://avatars.githubusercontent.com/u/131718510?v=4&size=64",
                                    "profile-name": "not you",
                                    "position": i + 1,
                                    "type": "player",
                                    "xp": row[i].xp_this_week
                                }
                                ranking.push(data)
                            }
                        }
                        let jsondata = {
                            "league": {
                                "name": "filler",
                                "guid": row.league_guid
                            },
                            "start-at": row.weekstart,
                            "end-at": row.weekend,
                            "ranking": ranking
                        };
                        res.status(200).json({ success: true, data: jsondata });
                    }
                });
            }
        }
    });
})


app.get('/experience-points/progression/', badTokenAuthv2, (req, res) => {
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
    const uid = req.uid;
    db.get(`SELECT * FROM playerprogression WHERE uid = ?`, [uid], (err, row) => {
        if (err) {
            console.error("Error fetching playerprogression:", err);
            res.status(500).json({ success: false });
            return;
        } else if (!row) {
            console.log("No player progression found for UID:", uid);
            db.run(`INSERT INTO playerprogression (uid, xp, previous_level_xp, next_level_xp, level, rank_name, rank_index, rank_position, rank_round_start, rank_round_end, streak_points, daily_completed_maps, goal_daily_completed_maps, prizes, league_guid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
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
                    JSON.stringify(payload.prizes),
                    "LG-1"
                ], err => {
                    if (err) {
                        console.error("Error inserting default progression:", err);
                        res.status(500).json({ success: false });
                        return
                    } else {
                        console.log("Inserted default progression for UID:", uid);
                        res.status(200).json({ success: true, data: payload });
                        return
                    }
                })
        } else {
            let jsondata = {
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
})

/*
-----------------------------------------------------
██╗     ██╗ ██████╗███████╗███╗   ██╗███████╗███████╗
██║     ██║██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝
██║     ██║██║     █████╗  ██╔██╗ ██║███████╗█████╗
██║     ██║██║     ██╔══╝  ██║╚██╗██║╚════██║██╔══╝
███████╗██║╚██████╗███████╗██║ ╚████║███████║███████╗
╚══════╝╚═╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝
-----------------------------------------------------
*/

app.get(`/player/license/`, (req, res) => {
    console.log("NEW LICENSE REQUEST:", req.headers);
    const base64Data = Buffer.from(JSON.stringify({ exists: true })).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
});

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


app.post('/drones/', express.urlencoded({ extended: true }), badTokenAuthv2, (req, res) => {
    console.log("req sent to /drones/ headers are: ", req.headers);
    console.log(req.body);
    const uid = req.uid;
    db.get(`SELECT json FROM playerstate WHERE uid = ?`, [uid], (err, row) => {
        if (err) {
            console.error("Error fetching JSON:", err);
            res.status(500).json({ success: false });
            return;
        }
        let jsondata = {};
        if (row) {
            jsondata = JSON.parse(row.json);
        }
        db.run(`INSERT INTO drone (
                    guid,
                    player_id,
                    profile_platform_id,
                    profile_platform,
                    profile_color,
                    profile_thumb,
                    profile_name,
                    score,
                    rating,
                    rating_count,
                    thumb_url,
                    name,
                    is_public,
                    is_official,
                    is_custom_physics,
                    flight_time,
                    flight_total,
                    size,
                    thrust,
                    speed,
                    weight,
                    rpm,
                    frame_id,
                    motor_id,
                    prop_id,
                    battery_id,
                    rig_data,
                    profile_data,
                    physics_data
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                ON CONFLICT (guid) DO UPDATE SET
                    player_id           = excluded.player_id,
                    profile_platform_id = excluded.profile_platform_id,
                    profile_platform    = excluded.profile_platform,
                    profile_color       = excluded.profile_color,
                    profile_thumb       = excluded.profile_thumb,
                    profile_name        = excluded.profile_name,
                    score               = excluded.score,
                    rating              = excluded.rating,
                    rating_count        = excluded.rating_count,
                    thumb_url           = excluded.thumb_url,
                    name                = excluded.name,
                    is_public            = excluded.is_public,
                    is_official          = excluded.is_official,
                    is_custom_physics    = excluded.is_custom_physics,
                    flight_time          = excluded.flight_time,
                    flight_total         = excluded.flight_total,
                    size                 = excluded.size,
                    thrust               = excluded.thrust,
                    speed                = excluded.speed,
                    weight               = excluded.weight,
                    rpm                  = excluded.rpm,
                    frame_id             = excluded.frame_id,
                    motor_id             = excluded.motor_id,
                    prop_id              = excluded.prop_id,
                    battery_id           = excluded.battery_id,
                    rig_data             = excluded.rig_data,
                    profile_data         = excluded.profile_data,
                    physics_data         = excluded.physics_data;`,
            [
                req.body.guid,
                uid,
                jsondata['profile-platform-id'],
                jsondata['profile-platform'],
                jsondata['profile-color'],
                jsondata['profile-thumb'],
                req.body['profile-name'],
                req.body.score,
                req.body.rating,
                req.body['rating-count'],
                req.body['thumb-url'],
                req.body.name,
                req.body['is-public'],
                req.body['is-official'],
                req.body['is-custom-physics'],
                req.body['flight-time'],
                req.body['flight-total'],
                req.body.size,
                req.body.thrust,
                req.body.speed,
                req.body.weight,
                req.body.rpm,
                req.body['frame-id'],
                req.body['motor-id'],
                req.body['prop-id'],
                req.body['battery-id'],
                JSON.stringify(req.body['rig-data']),
                JSON.stringify(req.body['profile-data']),
                JSON.stringify(req.body['physics-data'])
            ], err => {
                if (err) {
                    console.error("Error inserting/updating drone:", err);
                    res.status(500).json({ success: false });
                    return;
                } else {
                    res.status(200).json({ success: true, data: req.body })
                }
            })
    });
});

app.get('/drones/:guid/remove/', badTokenAuthv2, (req, res) => {
    const uid = req.uid;
    db.run(`DELETE FROM drone WHERE guid = ? AND player_id = ?`, [req.params.guid, uid], function (err) {
        if (err) {
            console.error("Error deleting drone:", err);
            res.status(500).json({ success: true });
            return
        }
        res.status(200).json({ success: true });
    });
});

app.get('/drones/', (req, res) => {
    console.log(req.query)
    let data = []
    let sql = "SELECT * FROM drone";
    let params = [];

    if (req.query["is-public"] != null) {
        const isPublic = req.query["is-public"] === "true" ? "true" : "false";
        sql += " WHERE is_public = ?";
        params.push(isPublic);
    } else {
        const pub = true
    }
    db.all(sql, params, (err, row) => {
        if (err || row.length === 0) {
            console.error("Error fetching drones:", err);
        } else {
            for (let i = 0; i < row.length; i++) {
                let dat = {
                    "guid": row[i].guid,
                    "player-id": row[i].player_id,
                    "profile-platform-id": row[i].profile_platform_id,
                    "profile-platform": row[i].profile_platform,
                    "profile-color": row[i].profile_color,
                    "profile-thumb": row[i].profile_thumb,
                    "profile-name": row[i].profile_name,
                    "score": row[i].score,
                    "rating": row[i].rating,
                    "rating-count": row[i].rating_count,
                    "thumb-url": url + row[i].thumb_url,
                    "name": row[i].name,
                    "is-public": row[i].is_public,
                    "is-official": row[i].is_official,
                    "is-custom-physics": row[i].is_custom_physics,
                    "flight-time": row[i].flight_time,
                    "flight-total": row[i].flight_total,
                    "size": row[i].size,
                    "thrust": row[i].thrust,
                    "speed": row[i].speed,
                    "weight": row[i].weight,
                    "rpm": row[i].rpm,
                    "frame-id": row[i].frame_id,
                    "motor-id": row[i].motor_id,
                    "prop-id": row[i].prop_id,
                    "battery-id": row[i].battery_id,
                    "rig-data": JSON.parse(row[i].rig_data),
                    "profile-data": JSON.parse(row[i].profile_data),
                    "physics-data": JSON.parse(row[i].physics_data),
                }
                data.push(dat);
                console.log(dat)
            }
        }
        res.status(200).json({
            success: true,
            "data": {
                "data": data,
                pagging: { page: req.query.page, limit: req.query.limit, total: row.length }
            }
        });
    });
});

app.get('/time/', (req, res) => {
    res.status(200).json({ success: true, data: getTimeBase64() });
})

//filler data
app.get('/crash-settings', (req, res) => {
    res.status(200).json({ success: true, data: null });
});


app.get('/circuits/', (req, res) => {
    const payload = [];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true });
})

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
    today.setHours(23, 59, 59, 999);


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

function decryptDRL(token, keyString, ivString) {
    const key = Buffer.from(keyString, 'utf8');
    const iv = Buffer.from(ivString, 'utf8');
    const encrypted = Buffer.from(token, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    if (decrypted[0] === 0xEF && decrypted[1] === 0xBB && decrypted[2] === 0xBF) {
        decrypted = decrypted.slice(3);
    }

    const decryptedText = decrypted.toString('utf8');
    return JSON.parse(decryptedText);
}


app.use(session({
    secret: process.env.SESSION_SECRET || 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));


app.use(express.urlencoded({ extended: true }))

app.use(csrf({
    whitelist: ['/adminlogin']
}));

const protect = (req, res, next) => {
    if (req.session && req.session.adminId) {
        next();
    } else {
        res.redirect('/adminlogin');
    }
};

app.use('/admin', protect);

app.use('/admin', express.static('admin'));

app.use('/adminlogin', express.static('adminlogin'));

app.post(`/adminlogin`, express.urlencoded({ extended: true }), (req, res) => {
    const { username, password } = req.body
    db.get('SELECT * FROM adminusers WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).send("Database error");
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.adminId = user.id;
                return res.redirect(`/admin/dashboard`)
            }
        }
        res.status(401).send("<h1>Invalid username or password</h1>");
    });
})


app.post(`/admin/changepassword`, express.urlencoded({ extended: true }), (req, res) => {
    const { username, new_username, password, new_password } = req.body
    db.get('SELECT * FROM adminusers WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).send("Database error");
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const userId = user.id
                if (new_username != "" && new_password != "") {
                    db.run('UPDATE adminusers SET username = ?, password = ? WHERE id = ?', [new_username, await bcrypt.hash(new_password, 10), userId], function (err) {
                        if (err) {
                            console.error("Error updating admin user:", err);
                            return res.status(500).send("Database error");
                        }
                        req.session.destroy(err => {
                            if (err) {
                                console.error("Error destroying session:", err);
                                return res.status(500).send("Error updating credentials, please try again");
                            }
                            return res.redirect('/adminlogin');
                        });
                    })
                } else if (new_username != "" && new_password == "") {
                    db.run('UPDATE adminusers SET username = ? WHERE id = ?', [new_username, userId], function (err) {
                        if (err) {
                            console.error("Error updating admin user:", err);
                            return res.status(500).send("Database error");
                        }
                        req.session.destroy(err => {
                            if (err) {
                                console.error("Error destroying session:", err);
                                return res.status(500).send("Error updating credentials, please try again");
                            }
                            return res.redirect('/adminlogin');
                        });
                    })
                } else if (new_username == "" && new_password != "") {
                    db.run('UPDATE adminusers SET password = ? WHERE id = ?', [await bcrypt.hash(new_password, 10), userId], function (err) {
                        if (err) {
                            console.error("Error updating admin user:", err);
                            return res.status(500).send("Database error");
                        }
                        req.session.destroy(err => {
                            if (err) {
                                console.error("Error destroying session:", err);
                                return res.status(500).send("Error updating credentials, please try again");
                            }
                            return res.redirect('/adminlogin');
                        });
                    })
                }
            } else {
                res.status(401).send("<h1>Invalid username or password</h1>");
            }
        } else {
            res.status(401).send("<h1>Invalid username or password</h1>");
        }
    });
})

app.post(`/admin/reboot`, express.urlencoded({ extended: true }), (req, res) => {
    pm2.connect((err) => {
        if (err) {
            res.status(500).json({ success: false, message: "Error connecting to pm2" });
            return;
        }

        pm2.reload('all', (err, proc) => {
            if (err) {
                pm2.disconnect();
                res.status(500).json({ success: false, message: "Error restarting process" });
            } else {
                res.status(200).json({ success: true, message: "Process restarted successfully" });
            }

            setTimeout(() => {
                pm2.disconnect();
            }, 1000);
        });
    });
})


app.post(`/admin/add-map-pool/`, express.json(), (req, res) => {
    db.run("INSERT INTO map_pools (pool_name) VALUES (?)", [req.body.pool_name], function (err) {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        } else {
            res.status(200).json({ success: true, message: "Map pool added successfully", poolId: this.lastID });
        }
    })
})

app.post(`/admin/add-map-to-map-pool/`, express.json(), (req, res) => {
    const { map_guid, pool_name, map, track } = req.body
    db.get("SELECT id FROM map_pools WHERE pool_name = ?", [pool_name], (err, row) => {
        if (err || !row) {
            res.status(404).json({ success: false, message: "Map pool not found" });
            return;
        } else {
            const id = row.id
            if (track != "null") {
                console.log(track)
                db.run(`INSERT INTO poolmaps (pool_id, map, track, is_custom_map) VALUES (?, ?, ?, ?)`, [id, map, track, false], (err) => {
                    if (err) {
                        res.status(500).json({ success: false, message: "Database error on hard coded maps: " + err });
                        return;
                    }
                    res.status(200).json({ success: true, message: "Hard coded map added to pool successfully" });
                });
            } else {
                db.get(`SELECT map_title FROM communitytracks WHERE guid = ?`, [map_guid], (err, row) => {
                    if (err || !row) {
                        res.status(500).json({ success: false, message: "Database error on finding map" })
                        return
                    } else {
                        db.run(`INSERT INTO poolmaps (pool_id, map, is_custom_map, custom_map, custom_map_title) VALUES (?, ?, ?, ?, ?)`, [id, map, true, map_guid, row.map_title], (err) => {
                            if (err) {
                                res.status(500).json({ success: false, message: "Database error on inserting custom map" });
                                return;
                            }
                            res.status(200).json({ success: true, message: "Map added to pool successfully" });
                        });
                    }
                })
            }
        }
    })
})

app.get(`/admin/map-pool/`, express.json(), (req, res) => {
    db.all("SELECT map_pools.pool_name, COUNT(poolmaps.id) AS map_count FROM map_pools LEFT JOIN poolmaps ON map_pools.id = poolmaps.pool_id GROUP BY map_pools.id", [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        } else {
            res.status(200).json({ success: true, data: rows });
        }
    })
})


app.post(`/admin/pull-updates/`, express.urlencoded({ extended: true }), (req, res) => {
    exec('git pull', (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ success: false, message: `Error: ${error.message}` });
            return;
        }
        if (stderr) {
            res.status(500).json({ success: false, message: `Stderr: ${stderr}` })
        }
        res.status(200).json({ success: true, message: `Stdout: ${stdout}` });
    });
})

app.get(`/admin/maps-count`, (req, res) => {
    db.get(`SELECT COUNT(*) as total FROM communitytracks`, (err, result) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        }
        res.status(200).json({ success: true, count: result.total });
    });
});

app.get(`/admin/users-count`, (req, res) => {
    db.get(`SELECT COUNT(*) as total FROM user`, (err, result) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        }
        res.status(200).json({ success: true, count: result.total });
    });
});

app.get(`/admin/tournaments-count`, (req, res) => {
    db.get(`SELECT COUNT(*) as total FROM tournaments`, (err, result) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        }
        res.status(200).json({ success: true, count: result.total });
    });
});



app.get('/admin/maps/', (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    let sqlSort = "";
    let filters = []
    let filtersP = []
    filters.push(" AND is_race_allowed = 1");
    if (req.query['map-difficulty']) {
        filters.push(`AND map_difficulty = ?`);
        filtersP.push(parseInt(req.query['map-difficulty']));
    }
    if (req.query['map-id']) {
        filters.push("AND map_id = ?");
        filtersP.push(req.query['map-id']);
    }
    if (req.query.q) {
        if (req.query.q.startsWith("@")) {
            filters.push("AND profile_name = ?");
            filtersP.push(req.query.q.toLowerCase().substring(1));
        } else {
            filters.push("AND map_title LIKE ?");
            filtersP.push(`%${req.query.q}%`);
        }
    }
    if (req.query.sort && req.query.order) {
        const normalizedSort = req.query.sort.replace(/-/g, '_');
        const allowedSortFields = ['score', 'rating_count', 'created_at', 'updated_at'];
        const sortField = allowedSortFields.includes(normalizedSort) ? normalizedSort : 'score';

        const sortOrder = req.query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        sqlSort = `ORDER BY ${sortField} ${sortOrder}`;
        filters.push(sqlSort)
    }
    db.get(
        `SELECT COUNT(*) as total FROM communitytracks WHERE is_public = 1`,
        [],
        (err, countResult) => {
            if (err) {
                console.error("Error counting tracks:", err);
                return res.status(500).json({ success: false });
            }
            const totalCount = countResult.total;
            const totalPages = Math.ceil(totalCount / limit);
            db.all(
                `SELECT *
                FROM communitytracks
                WHERE is_public = 1
                ${filters.join(' ')} LIMIT ? OFFSET ? `,
                [...filtersP, limit, offset],
                (err, rows) => {
                    if (err) {
                        console.error("Error fetching community tracks:", err);
                        return res.status(500).json({ success: false });
                    }
                    const payload = rows.map(row => mapCTracksqlToJson(row));
                    res.status(200).json({ success: true, data: { data: payload, pagging: { page: page, "page-total": totalPages } } });
                    console.log("Returned", payload.length, "tracks for page", page, "of", totalPages);
                }
            );
        }
    );
});

app.get(`/admin/leaderboard-entries-count`, (req, res) => {
    db.get(`SELECT COUNT(*) as total FROM leaderboard`, (err, result) => {
        if (err) {
            res.status(500).json({ success: false, message: "Database error" });
            return;
        }
        res.status(200).json({ success: true, count: result.total });
    });
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.send("Error logging out");
        res.redirect('/adminlogin');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on [${url}](${url})`);
});