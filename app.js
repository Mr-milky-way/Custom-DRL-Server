const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database('main.db');

// Initialize database once at startup
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");
});

app.get('/drop', (req, res) => {
    db.serialize(() => { 
        db.run("DROP TABLE lorem")
    });
    res.send("DROPED TABLE")
});

app.get('/', (req, res) => {
    db.serialize(() => {
        // Insert data
        const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        for (let i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }
        stmt.finalize();

        // Retrieve data
        db.all("SELECT rowid AS id, info FROM lorem", [], (err, rows) => {
            if (err) {
                res.status(500).send("Database error");
                return;
            }
            console.log(rows);
            res.send(`Inserted 10 rows. Total rows in DB: ${rows.length}`);
        });
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
