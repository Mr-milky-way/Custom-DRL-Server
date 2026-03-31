const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('main.db', err => {
    if (err) {
        console.error("SQLite open error:", err);
    } else {
        console.log("SQLite database connected");
    }
});

db.run(`CREATE TABLE IF NOT EXISTS tournaments (
    players-size INT,
    max-players INT,
    id TEXT,
    guid TEXT UNIQUE,
    title TEXT,
    region TEXT,
    lan-support BOOLEAN,
    server-ip TEXT,
    call-to-action TEXT,
    description TEXT,
    prize-description TEXT,
    prize-url TEXT,
    image-url TEXT,
    video-url TEXT,
    allow-new-registration BOOLEAN,
    disable-public-spectators BOOLEAN,
    register-start DATETIME,
    register-end DATETIME,
    current-time DATETIME,
    penalty BOOLEAN,
    status TEXT,
    progression TEXT,
    drone-guid TEXT,
    drl-pilot-mode BOOLEAN,
    default-drone-class INT,
    minimum-skill INT,
    streaming-url TEXT,
    private BOOLEAN,
    dawc-seeding BOOLEAN,
    countdown BOOLEAN,
    rounds TEXT,
    rankings TEXT,
    age-check BOOLEAN,
    age-check-number INT,
    terms-and-conditions-url TEXT,
    type TEXT,
    player-ids TEXT,
    ranking TEXT,
    )`);


