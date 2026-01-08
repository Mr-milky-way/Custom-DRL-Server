const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const querystring = require('querystring');
const db = new sqlite3.Database('main.db');


db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS user (token TEXT, time INT, version TEXT, os TEXT)");
});


// Helper: timestamp as Base64
function getTimeBase64() {
    const payload = {
        time: Math.floor(Date.now() / 1000)
    };
    const base64Data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    return base64Data
}

function dummyStateData(res) {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: base64Data }));
}

function dummyProgressionData(res) {
    const payload = [
        {
            guid: "track-001",
            name: "Beginner Track",
            "xp-value": 100,
            "xp-min-time": 45
        },
        {
            guid: "track-002",
            name: "Advanced Track",
            "xp-value": 300,
            "xp-min-time": 40
        }
    ]; // can be empty array
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: base64Data }));
}

function dummyMapData(res) {
    const payload = [];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: base64Data }));
}

// Respond functions
function respondTime(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: getTimeBase64() }));
}

function respondLogin(req, res) {
    if (req.method !== 'POST' || req.url !== '/v2/login') {
        res.writeHead(404);
        return res.end();
    }

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
            const stmt = db.prepare("INSERT INTO user (token, time, version, os) VALUES (?)");
            for (let i = 0; i < 10; i++) {
                stmt.run(parsed.token, parsed.time, parsed.version, parsed.os);
            }
            stmt.finalize();
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            token: parsed.token,   // DRL reuses this
            data: base64Data
        }));
    });
}

function respondStorage(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
}

function dummyXPprogData( res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
}

function dummyCircuitsData( res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
}

// Server
const server = http.createServer((req, res) => {
    console.log('==============================');
    console.log('METHOD:', req.method);
    console.log('URL:', req.url);
    console.log('HEADERS:', req.headers);


    if (req.method === "GET" && req.url === "/time/") {
        respondTime(res);
    } else if (req.method === "POST" && req.url === "/v2/login") {
        respondLogin(req, res);
    } else if (req.method === "POST" && (req.url.startsWith("/storage/logs/"))) {
        respondStorage(res);
    } else if (req.method === "POST" && (req.url.startsWith("/storage/image/"))) {
        respondStorage(res);
    } else if (req.method === "GET" && (req.url.startsWith("/progression/"))) {
        dummyProgressionData(res);
    } else if (req.method === "GET" && (req.url.startsWith("/state/"))) {
        dummyStateData(res);
    } else if (req.method === "GET" && (req.url.startsWith("/maps/"))) {
        dummyMapData(res);
    } else if (req.method === "GET" && (req.url.startsWith("/experience-points/progression/"))) {
        dummyXPprogData(res);
    } else if (req.method === "GET" && (req.url.startsWith("/circuits/"))) {
        dummyCircuitsData(res);
    } else {
        console.log("404 sent")
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: "Not Found" }));
    }
});

server.listen(8080, () => {
    console.log("Server listening on http://192.168.1.34:8080"); // THIS WILL BE DIFFERENT IF ON A DIFFERENT COMPUTER
});