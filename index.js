const http = require('http');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const querystring = require('querystring');
const db = new sqlite3.Database('main.db');
const tracks = require('./tracks.json')
const Ctracks = require('./Ctracks.json')

const app = express();
const PORT = 8080;

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS user (token TEXT, time INT, version TEXT, os TEXT)");
});

app.post('/storage/logs/', (req, res) => {
    res.status(200).json({ success: true });
})

app.post('/storage/image/', (req, res) => {
    res.status(200).json({ success: true });
})

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

        db.serialize(() => {
            const stmt = db.prepare(
                "INSERT INTO user (token, time, version, os) VALUES (?, ?, ?, ?)"
            );

            stmt.run(
                parsed.token,
                parsed.time,
                parsed.version,
                parsed.os,
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
    });
});

app.get('/time/', (req, res) => {
    res.status(200).json({ success: true, data: getTimeBase64() });
})

app.get('/progression/maps/', (req, res) => {
    const progressionMaps = [
        {
            guid: "CMP-0b4bad556c75bab6023e1c4a",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-1a79c2484ac359ed8120390c",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-1cb12980a51217c210e8339b",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-1cc2bbd7e8b61df9ccf2bfcb",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-2c2a05b8ee2ee938598ad117",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-2cca00a8a982d1236e8d157a",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-2eb752471d01b43ceb0651e0",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-03eca5ed327327d4957d4d2c",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-3a3d362c2a5058a91c43a701",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-3b1a8c12295620845732a8e9",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-3b5f210d04c5b7fdc75bfa6d",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-3b1318db5ff046a88efca70e",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-3dd16f97c8ae3e5f36470eee",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-3de48bbcd19e9de8841d2584",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-3e9c750ba34ada10dcd7e8bb",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-004cbc546ec06dca564d52b8",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-4a530b1e9d25ab99db03dce8",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-4cd29364c4142b14c6a3179a",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-4dbda7541c347b41b72b0d84",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-4de34c061e2226d7edc9d9d0",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "CMP-4ec6dba40a8aa0ddd81be4e9",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        },
        {
            guid: "CMP-5a02b53793c7e083c1971eb2",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        }
    ];

    res.status(200).json({ success: true, encoded: true, data: progressionMaps });
})

app.get('/state/game/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/state/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/maps/updated/', (req, res) => {
    console.log("/maps/updated/ MAPS")
    const payload = tracks;
    res.status(200).json({ success: true, data: payload });
})


app.use('/tracks', express.static(path.join(__dirname, 'tracks')));

app.get('/maps/user/updated/', (req, res) => {
    console.log("/maps/user/updated/ MAPS")
    const payload = Ctracks;
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/experience-points/progression/', (req, res) => {
    const payload = [];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true });
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

app.listen(PORT, () => {
    console.log(`Server is running on [http://localhost:${PORT}](http://localhost:${PORT})`);
});