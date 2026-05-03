const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('main.db');
const Tracks = require('./tracks.json');
const Ctracks = require('./CtracksC.json')
const fs = require('fs');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS communitytracks (
            guid TEXT UNIQUE,
            root TEXT,
            root_full TEXT,
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
    db.run("CREATE TABLE IF NOT EXISTS trackcolab (uid TEXT, guid TEXT, PRIMARY KEY (uid, guid))");
});

function toJSON(value) {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
}

const full = Ctracks.concat(Tracks)

const guids = new Set(full.map(t => t.guid));
console.log("Unique GUIDs:", guids.size);
console.log("Total tracks:", full.length);

const stmt = db.prepare(
    `INSERT INTO communitytracks (
            guid,
            root,
            root_full,
            prefs,
            allow_copy,
            base_assets_enabled,
            exclusive_by_platform,
            is_race_allowed,
            is_public,
            is_public_for_drlpilots,
            is_drl_official,
            is_featured,
            is_multigp,
            is_tryouts,
            is_virtual_season,
            map_category,
            map_difficulty,
            map_distance,
            map_dirty,
            map_lighting,
            map_laps,
            map_stats_triangle_count,
            map_stats_object_count,
            map_asset_layers,
            map_styles,
            categories,
            prefs_auto_save,
            rating_count,
            score,
            track_id,
            xp_value,
            xp_min_time,
            cm_collectable_count,
            collaborators,
            map_mode_type,
            map_id,
            map_title,
            steam_id,
            created_at,
            updated_at,
            version,
            title_translations,
            images,
            map_thumb,
            avatar,
            player_id,
            profile_name,
            profile_thumb,
            profile_color,
            profile_platform,
            profile_platform_id,
            flag_url,
            is_avatar_blocked,
            full_track_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(guid) DO NOTHING;`
);

db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    for (let i = 0; i < full.length; i++) {
        const track = full[i];
        const rawData = fs.readFileSync(`./tracks/${track.guid}.cmp`, 'utf8');
        const jsonData = JSON.parse(rawData);
        console.log(jsonData.data.data[0].root);
        try {
            stmt.run(
                track.guid,
                toJSON(track.root),
                toJSON(jsonData.data.data[0].root),
                toJSON(track.prefs),
                track["allow-copy"],
                track["base-assets-enabled"],
                toJSON(track["exclusive-by-platform"]),
                track["is-race-allowed"],
                track["is-public"],
                track["is-public-for-drlpilots"],
                track["is-drl-official"],
                track["is-featured"],
                track["is-multigp"],
                track["is-tryouts"],
                track["is-virtual-season"],
                track["map-category"],
                track["map-difficulty"],
                track["map-distance"],
                track["map-dirty"],
                track["map-lighting"],
                track["map-laps"],
                track["map-stats-triangle-count"],
                track["map-stats-object-count"],
                toJSON(track["map-asset-layers"]),
                toJSON(track["map-styles"]),
                toJSON(track["categories"]),
                track["prefs-auto-save"],
                track["rating-count"],
                track["score"],
                track["track-id"],
                track["xp-value"],
                track["xp-min-time"],
                track["cm-collectable-count"],
                JSON.stringify(track["collaborators"]),
                track["map-mode-type"],
                track["map-id"],
                track["map-title"],
                track["steam-id"],
                track["created-at"],
                track["updated-at"],
                track["version"],
                toJSON(track["title-translations"]),
                toJSON(track["images"]),
                track["map-thumb"],
                track["avatar"],
                track["player-id"],
                track["profile-name"],
                track["profile-thumb"],
                track["profile-color"],
                track["profile-platform"],
                track["profile-platform-id"],
                track["flag-url"],
                track["is-avatar-blocked"],
                track["full-track-url"]
            );
            db.run(`INSERT OR IGNORE INTO trackcolab (uid, guid) VALUES (?, ?)`, [track["player-id"], track.guid], function (err) {
                if (err) {
                    console.error("Error inserting into trackcolab:", err);
                }
            });
            if (Array.isArray(track.collaborators)) {
                for (let j = 0; j < track.collaborators.length; j++) {
                    const collaboratorUid = track.collaborators[j]['player-id'];
                    if (collaboratorUid) {
                        db.run(
                            `INSERT OR IGNORE INTO trackcolab (uid, guid) VALUES (?, ?)`,
                            [collaboratorUid, track.guid]
                        );
                    }
                }
            }
            console.log(`Inserted track ${i + 1}/${full.length}: ${track.guid}`);
        } catch (err) {
            console.error("Error inserting track:", err);
        }
        console.log(JSON.stringify(track["collaborators"]))
    }

    stmt.finalize();

    db.run("COMMIT");
});

db.close();