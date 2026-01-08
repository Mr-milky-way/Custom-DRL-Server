const http = require('http');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const querystring = require('querystring');
const db = new sqlite3.Database('main.db');

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
            const stmt = db.prepare("INSERT INTO user (token, time, version, os) VALUES (?)");
            for (let i = 0; i < 10; i++) {
                stmt.run(parsed.token, parsed.time, parsed.version, parsed.os);
            }
            stmt.finalize();
        });

        res.status(200).json({
            success: true,
            token: parsed.token,   // DRL reuses this
            data: base64Data
        });
    });
})

app.get('/time/', (req, res) => {
    res.status(200).json({ success: true, data: getTimeBase64() });
})

app.get('/progression/', (req, res) => {
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
    ];
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/state/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/maps/', (req, res) => {
    const payload = [
        {
            "name": "CATNIP TEA",
            "id": "561324833640502057",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5fc42ed41903f7802cd8c67d/1691928034548.png"
        },
        {
            "name": "ALLIANZ EXPO",
            "id": "451895499715195875",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1675970442964.png"
        },
        {
            "name": "DRL 2017",
            "id": "451895499723571878",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "LONDON 2017 REWIND",
            "id": "451895499715195890",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "LONDON EXPO",
            "id": "451895499727772760",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1617740890510.png"
        },
        {
            "name": "DRL 2020 - LONDON",
            "id": "451895499723571859",
            "mapName": "2017 WORLD CHAMPIONSHIP",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2018",
            "id": "451895499727772740",
            "mapName": "ADVENTUREDOME",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1543852354251.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499731965777",
            "mapName": "ADVENTUREDOME",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684371256323.png"
        },
        {
            "name": "SIM RACING CUP 6",
            "id": "451895499715195892",
            "mapName": "ADVENTUREDOME",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1587589644882.png"
        },
        {
            "name": "DRL 2020 - ADVENTUREDOME",
            "id": "451895499719385545",
            "mapName": "ADVENTUREDOME",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "2023 CHINA NATIONAL CHAMPIONSHIP",
            "id": "561324833648901021",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1686178740413.png"
        },
        {
            "name": "NFL KICKOFF",
            "id": "561324833636307022",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5f58abe21903f7802c12d8e5/1693984242843.png"
        },
        {
            "name": "DRL 2018",
            "id": "451895499731965794",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1547128503997.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499719385555",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684371096560.png"
        },
        {
            "name": "2019 MGP CHAMPIONSHIP - PRO",
            "id": "451895499723571862",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1573579305812.png"
        },
        {
            "name": "2019 MGP CHAMPIONSHIP - SPORT",
            "id": "451895499723571863",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1572963799368.png"
        },
        {
            "name": "DRL 2020 - RIVIERA",
            "id": "451895499727772752",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1598398139828.png"
        },
        {
            "name": "DRL 2021 - ALLIANZ",
            "id": "451895499719385534",
            "mapName": "ALLIANZ RIVIERA",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1638909961759.png"
        },
        {
            "name": "VISIT TO CAR STORAGE",
            "id": "561324833644697181",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1688564079688.png"
        },
        {
            "name": "APOCALYPSE",
            "id": "451895499715195882",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373531613.png"
        },
        {
            "name": "DRL 2017",
            "id": "451895499727772735",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "IMPACT",
            "id": "451895499727772759",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373313855.png"
        },
        {
            "name": "SIM RACING CUP 2",
            "id": "451895499719385557",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1588712680961.png"
        },
        {
            "name": "DRL 2020 - ATLANTA",
            "id": "451895499727772742",
            "mapName": "ATLANTA AFTERMATH",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2018",
            "id": "479439185240011276",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "ECOSYSTEM",
            "id": "451895499727772756",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684374535314.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499731965776",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684374650638.png"
        },
        {
            "name": "SIM RACING CUP 1",
            "id": "451895499715195891",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1587785665758.png"
        },
        {
            "name": "DRL 2020 - BIOSPHERE",
            "id": "451895499727772743",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1609772902876.png"
        },
        {
            "name": "DRL 2021 - BIOSPHERE",
            "id": "451895499719385540",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1638332102370.png"
        },
        {
            "name": "DRL 2022-23 BIOSPHERE",
            "id": "451895499719385543",
            "mapName": "BIOSPHERE 2",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1673361302515.png"
        },
        {
            "name": "DRL 2018",
            "id": "451895499727772739",
            "mapName": "BMW WELT",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1547164726772.png"
        },
        {
            "name": "FLAGSHIP",
            "id": "451895499727772757",
            "mapName": "BMW WELT",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684372656325.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499719385566",
            "mapName": "BMW WELT",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684372832241.png"
        },
        {
            "name": "DRL 2020 - THE WELT",
            "id": "451895499727772753",
            "mapName": "BMW WELT",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2017",
            "id": "451895499723571858",
            "mapName": "BOSTON FOUNDRY",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "FOUNDRY CIRCUIT",
            "id": "451895499727772758",
            "mapName": "BOSTON FOUNDRY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373038241.png"
        },
        {
            "name": "FULL METAL",
            "id": "451895499723571853",
            "mapName": "BOSTON FOUNDRY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373146702.png"
        },
        {
            "name": "DRL TRYOUTS QUALIFIER 2019",
            "id": "451895499719385564",
            "mapName": "BRIDGE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684375788504.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499719385553",
            "mapName": "BRIDGE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684375975432.png"
        },
        {
            "name": "TRYOUTS LAS VEGAS 2019",
            "id": "451895499731965789",
            "mapName": "BRIDGE",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "SIM RACING CUP 4",
            "id": "451895499731965782",
            "mapName": "BRIDGE",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1589898155835.png"
        },
        {
            "name": "DRL 2020 - BRIDGE",
            "id": "451895499719385539",
            "mapName": "BRIDGE",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2018",
            "id": "451895499719385565",
            "mapName": "CALIFORNIA NIGHTS",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1536344158028.png"
        },
        {
            "name": "DROP IN",
            "id": "451895499727772754",
            "mapName": "CALIFORNIA NIGHTS",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684371668887.png"
        },
        {
            "name": "DRL 2020 - CALIFORNIA NIGHTS",
            "id": "451895499727772744",
            "mapName": "CALIFORNIA NIGHTS",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "SPR: FULL SPEED",
            "id": "561324833678250424",
            "mapName": "CAMPGROUND",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5ca2857bba3bdc580e1368a6/1626628110973.png"
        },
        {
            "name": "ALLIANZ EAGLE",
            "id": "451895499723571872",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1641946711612.png"
        },
        {
            "name": "CAMPFIRE",
            "id": "451895499719385544",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1623245052600.png"
        },
        {
            "name": "DEVILS BACKBONE",
            "id": "451895499715195879",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684376965752.png"
        },
        {
            "name": "FIRST HIKE",
            "id": "451895499715195880",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684376137707.png"
        },
        {
            "name": "SUNRISE PEAK",
            "id": "451895499731965784",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1653686345124.png"
        },
        {
            "name": "THE LAKEHOUSE",
            "id": "451895499719385561",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1623086019012.png"
        },
        {
            "name": "THE WILD",
            "id": "451895499719385551",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1622820446233.png"
        },
        {
            "name": "ZIP LINE",
            "id": "451895499719385532",
            "mapName": "CAMPGROUND",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1656529388953.png"
        },
        {
            "name": "DRL 2021 - CAMPGROUND",
            "id": "451895499719385541",
            "mapName": "CAMPGROUND",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1636748909907.png"
        },
        {
            "name": "DRL 2022-23 ALPINE VALLEY",
            "id": "451895499719385558",
            "mapName": "CAMPGROUND",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1668464615728.png"
        },
        {
            "name": "DRL 2022-23 TEXAS",
            "id": "451895499719385556",
            "mapName": "CAMPGROUND",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1675527289503.png"
        },
        {
            "name": "GAME OF DRONES MK1",
            "id": "561324833686647461",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5e2955dc6ef085dae17cad9d/1613294632788.png"
        },
        {
            "name": "GOLDEN BURST [NIGHT MODE]",
            "id": "561324833648901028",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1685979564438.png"
        },
        {
            "name": "DRL 2018",
            "id": "451895499727772738",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "ROYALTY",
            "id": "451895499731965778",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684374108131.png"
        },
        {
            "name": "SILENT #FREETHEBRIDGE",
            "id": "451895499715195883",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684374327797.png"
        },
        {
            "name": "SIM RACING CUP 7",
            "id": "451895499719385537",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1590681050234.png"
        },
        {
            "name": "DRL 2020 - KINGDOM",
            "id": "451895499727772747",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2021 - KINGDOM",
            "id": "451895499719385570",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1635993417298.png"
        },
        {
            "name": "DRL 2022-23 KINGDOM",
            "id": "451895499719385549",
            "mapName": "CHAMPIONSHIP KINGDOM",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1669338824092.png"
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965795",
            "mapName": "DETROIT",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "DRL 2020 - DETROIT",
            "id": "451895499727772745",
            "mapName": "DETROIT",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL",
            "id": "451895499731965810",
            "mapName": "DRL SANDBOX",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "STRAIGHT LINE",
            "id": "451895499731965811",
            "mapName": "DRL SANDBOX",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "KBEEZ PARK",
            "id": "561324833636307045",
            "mapName": "DRONE PARK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5c902902ba3bdc580e7e875f/1692977797999.png"
        },
        {
            "name": "SWOOPS CASTLEDOME #2",
            "id": "508792601934179728",
            "mapName": "DRONE PARK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a15f75e45fb05001485e91f/1697635526574.png"
        },
        {
            "name": "2020 TRYOUTS FINALS",
            "id": "451895499723571864",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "2020 TRYOUTS QUALIFIER",
            "id": "451895499723571865",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "2020 TRYOUTS WEEK 1",
            "id": "451895499723571866",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1581302550343.png"
        },
        {
            "name": "2020 TRYOUTS WEEK 2",
            "id": "451895499723571867",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1582212721957.png"
        },
        {
            "name": "2020 TRYOUTS WEEK 3",
            "id": "451895499723571868",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1582825719317.png"
        },
        {
            "name": "2020 TRYOUTS WEEK 4",
            "id": "451895499723571869",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1583265414624.png"
        },
        {
            "name": "2020 TRYOUTS WEEK 5",
            "id": "451895499723571870",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1583989096406.png"
        },
        {
            "name": "2020 TRYOUTS WEEK 6",
            "id": "451895499723571871",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "CIRCUIT",
            "id": "451895499723571875",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1572933336920.png"
        },
        {
            "name": "ICEBOX",
            "id": "558681329046276733",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1695920588034.png"
        },
        {
            "name": "TWISTED ARENA",
            "id": "451895499731965790",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1653488262508.png"
        },
        {
            "name": "UPRISING",
            "id": "451895499731965791",
            "mapName": "DRONE PARK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1568830802105.png"
        },
        {
            "name": "HOLE IN 1",
            "id": "561324833640502058",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5c902902ba3bdc580e7e875f/1691858994934.png"
        },
        {
            "name": "JAB - CONTAINER CRUISE",
            "id": "561324833640502068",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/62878b0def1696a091b9f76e/1691587841967.png"
        },
        {
            "name": "PIN STACKS",
            "id": "561324833640502046",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5c902902ba3bdc580e7e875f/1691773602264.png"
        },
        {
            "name": "SWOOPS NV LVL 2",
            "id": "561324833590175997",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a15f75e45fb05001485e91f/1706987321524.png"
        },
        {
            "name": "SWOOPS WATER WORLD",
            "id": "561324833627929549",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a15f75e45fb05001485e91f/1696888271622.png"
        },
        {
            "name": "CITY",
            "id": "451895499731965806",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "CITY REWIND",
            "id": "451895499723571876",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1563215183827.png"
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965808",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "GLENWOOD",
            "id": "451895499715195889",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684378382144.png"
        },
        {
            "name": "SHIPYARD",
            "id": "451895499731965807",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "SHIPYARD DISASTER",
            "id": "451895499731965780",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684378014760.png"
        },
        {
            "name": "SILENT CITY CIRCUIT",
            "id": "451895499715195874",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684377705649.png"
        },
        {
            "name": "SILENT TRAIL",
            "id": "451895499719385552",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684378532614.png"
        },
        {
            "name": "THE CIRCUS YACHT",
            "id": "451895499715195873",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684378701245.png"
        },
        {
            "name": "TREETOPS",
            "id": "451895499715195881",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684378214482.png"
        },
        {
            "name": "WOODS",
            "id": "451895499731965809",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "DRL 2020 - GONY",
            "id": "451895499727772746",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2022-23 DRL SIM LIVE",
            "id": "451895499719385548",
            "mapName": "GATES OF NEW YORK",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1675694628156.png"
        },
        {
            "name": "DRL 2017",
            "id": "451895499727772736",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "DRL 2019",
            "id": "451895499727772741",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "MIAMI EXPO",
            "id": "451895499731965771",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1617742642138.png"
        },
        {
            "name": "SIDELINES",
            "id": "451895499719385573",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684372271572.png"
        },
        {
            "name": "SIDELINES REVERSED",
            "id": "451895499731965781",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684372445083.png"
        },
        {
            "name": "SIM RACING CUP 3",
            "id": "451895499719385536",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1588273581922.png"
        },
        {
            "name": "DRL 2020 - MIAMI",
            "id": "451895499727772750",
            "mapName": "HARD ROCK STADIUM",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965805",
            "mapName": "L.A.POCALYPSE",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "MALL WALKER",
            "id": "451895499727772761",
            "mapName": "L.A.POCALYPSE",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373688904.png"
        },
        {
            "name": "SILENT SHOPPING MALL",
            "id": "451895499719385560",
            "mapName": "L.A.POCALYPSE",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684373986385.png"
        },
        {
            "name": "DRL 2020 - LAPOCALYPSE",
            "id": "451895499727772748",
            "mapName": "L.A.POCALYPSE",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2022-23 L.A.POCALYPSE",
            "id": "451895499719385533",
            "mapName": "L.A.POCALYPSE",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1672760042651.png"
        },
        {
            "name": "DRL 2017",
            "id": "451895499727772734",
            "mapName": "MARDI GRAS WORLD",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "MASQUERADE",
            "id": "451895499719385572",
            "mapName": "MARDI GRAS WORLD",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684375272609.png"
        },
        {
            "name": "PUMPKIN'S REVENGE",
            "id": "451895499715195878",
            "mapName": "MARDI GRAS WORLD",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1603487887189.png"
        },
        {
            "name": "DRL 2020 - MARDI GRAS",
            "id": "451895499727772749",
            "mapName": "MARDI GRAS WORLD",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "BIG CITY BAPPERS",
            "id": "561324833640502086",
            "mapName": "MEGA CITY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5fc42ed41903f7802cd8c67d/1690302901588.png"
        },
        {
            "name": "COMPLEX",
            "id": "451895499719385562",
            "mapName": "MEGA CITY",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1654036509065.png"
        },
        {
            "name": "MONORAIL PARK",
            "id": "451895499731965772",
            "mapName": "MEGA CITY",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684370580391.png"
        },
        {
            "name": "MOONLIGHT",
            "id": "451895499731965773",
            "mapName": "MEGA CITY",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1653963080081.png"
        },
        {
            "name": "SPIRE",
            "id": "451895499719385550",
            "mapName": "MEGA CITY",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "DRL 2022-23 META CITY",
            "id": "451895499723571855",
            "mapName": "MEGA CITY",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1672862356489.png"
        },
        {
            "name": "CITRUS PALM",
            "id": "561324833644697161",
            "mapName": "MIAMI LIGHTS",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1689283099042.png"
        },
        {
            "name": "CTG / 07: TREEHOUSE TANGO",
            "id": "550104814732424791",
            "mapName": "MIAMI LIGHTS",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684372152123.png"
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965804",
            "mapName": "MIAMI LIGHTS",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "MIAMI SUNSET",
            "id": "451895499731965802",
            "mapName": "MIAMI LIGHTS",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "THE END ZONE",
            "id": "451895499731965803",
            "mapName": "MIAMI LIGHTS",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "JAB - LATE NIGHT LAUNCH",
            "id": "561324833619534412",
            "mapName": "MULTIGP",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/62878b0def1696a091b9f76e/1700409950584.png"
        },
        {
            "name": "OCTOBER HARVEST 04 - FARMHOUSE RIPS",
            "id": "561324833619534411",
            "mapName": "MULTIGP",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1699828120319.png"
        },
        {
            "name": "SAY NO TO CHEESE",
            "id": "561324833648900999",
            "mapName": "MULTIGP",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1687303698330.png"
        },
        {
            "name": "SPEC - 2019 AUSTRALIAN DRONE NATIONALS",
            "id": "561324833703418282",
            "mapName": "MULTIGP",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1569516770375.png"
        },
        {
            "name": "[FALL24-01] CONTAIN YOURSELF",
            "id": "623239230028532081",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1726403449795.png"
        },
        {
            "name": "[FALL24-02] ARTILLERY STATION",
            "id": "623314738456281999",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1725509374993.png"
        },
        {
            "name": "[FALL24-03] SILO SPEEDWAY",
            "id": "623971577430797886",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1725921489241.png"
        },
        {
            "name": "[FALL24-04] WELCOME TO PARADISE",
            "id": "624741627431483199",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1725181735012.png"
        },
        {
            "name": "[FALL24-05] BLOODBLITZ",
            "id": "625783497245241385",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1726999827817.png"
        },
        {
            "name": "[FALL24-06] PUMPKIN SPICE",
            "id": "626500736024989905",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1727148462298.png"
        },
        {
            "name": "[FALL24-07] TANKS FOR FLYING",
            "id": "627233050191359089",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1727251919637.png"
        },
        {
            "name": "[FALL24-08] POOL PARTY",
            "id": "628373082935565544",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1727476294229.png"
        },
        {
            "name": "[FALL24-09] GRAVEYARD GLIDE",
            "id": "629037462148776891",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1727669215332.png"
        },
        {
            "name": "[FALL24-10] CONTAINER CRUISIN'",
            "id": "629762218451965517",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1727931574166.png"
        },
        {
            "name": "[FALL24-11] ARMORY APEX",
            "id": "630849387845296115",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1728187207578.png"
        },
        {
            "name": "[FALL24-12] NOW THAT YOU MANSION IT",
            "id": "631596810280546839",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5c919635ba3bdc580e9ce9ae/1728150877660.png"
        },
        {
            "name": "[FALL24-13] FIRST BLOOD",
            "id": "632351787554866019",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/629fdc1c6b1092601af12c93/1727655933891.png"
        },
        {
            "name": "[FALL24-14] CONTAINMENT ZONE",
            "id": "633461595585858653",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1728735919844.png"
        },
        {
            "name": "[FALL24-15] HARVEST-IGATION",
            "id": "634125978448125972",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1728946353518.png"
        },
        {
            "name": "[FALL24-16] NO REST FOR THE WICKED",
            "id": "634835658547882117",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1729136928916.png"
        },
        {
            "name": "[FALL24-17] RENAISSANCE",
            "id": "635922831082741995",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1728146028226.png"
        },
        {
            "name": "[FALL24-18] CONTAINER SALAD",
            "id": "636647597343206822",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1729564597630.png"
        },
        {
            "name": "[FALL24-19] DIZZY LIGHT DELIGHT",
            "id": "638459542488699326",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730025722167.png"
        },
        {
            "name": "[FALL24-20] FASTER FARMING",
            "id": "639222058596648873",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730207857579.png"
        },
        {
            "name": "[FALL24-21] DRACULA DIVE",
            "id": "639954387090765944",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730369497310.png"
        },
        {
            "name": "[FALL24-22] DIRT-DASH",
            "id": "641018902902560677",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730614692056.png"
        },
        {
            "name": "[FALL24-23] TECHNICAL ISSUES",
            "id": "641758775527699960",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730782048152.png"
        },
        {
            "name": "[FALL24-24] THE WAFFLE IRON",
            "id": "642491103610760933",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/63365439f08571d6c9c8dffc/1730947381387.png"
        },
        {
            "name": "[FALL24-25] THE GANSION",
            "id": "653694924103377301",
            "mapName": "MULTIGP",
            "parentCategory": "Featured",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1733686205397.png"
        },
        {
            "name": "2019 MAYHEM TEAM EVENT",
            "id": "451895499723571861",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": null
        },
        {
            "name": "2019 STARMACH EXHIBITION",
            "id": "451895499723571857",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1642716024547.png"
        },
        {
            "name": "FIGURE 8 (3 LAPS)",
            "id": "451895499715195888",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1675883459420.png"
        },
        {
            "name": "MGP 2015 NATIONAL CHAMPIONSHIP",
            "id": "451895499723571848",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548717702063.png"
        },
        {
            "name": "MGP 2016 NATIONAL CHAMPIONSHIP",
            "id": "451895499727772762",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548729281871.png"
        },
        {
            "name": "MGP 2017 REGIONAL FINAL",
            "id": "451895499727772763",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548721254936.png"
        },
        {
            "name": "MGP 2018 IO INTERMEDIATE",
            "id": "451895499727772764",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548717382404.png"
        },
        {
            "name": "MGP 2018 IO MICRO",
            "id": "451895499723571854",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548342969293.png"
        },
        {
            "name": "MGP 2018 IO ROOKIE",
            "id": "451895499723571845",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548354287806.png"
        },
        {
            "name": "MGP 2018 IO SPEC",
            "id": "451895499719385574",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548351438570.png"
        },
        {
            "name": "MGP 2018 IO TEAM",
            "id": "451895499723571856",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548388462988.png"
        },
        {
            "name": "MGP 2018 IO WORLD CUP",
            "id": "451895499727772765",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1563476730011.png"
        },
        {
            "name": "MGP 2018 IO X CLASS",
            "id": "451895499723571849",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548359029970.png"
        },
        {
            "name": "MGP 2018 NATIONAL CHAMPIONSHIP",
            "id": "451895499727772766",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1549593089543.png"
        },
        {
            "name": "MGP 2018 REGIONAL FINAL",
            "id": "451895499723571850",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548365920153.png"
        },
        {
            "name": "MGP 2018 REGIONAL QUALIFIER",
            "id": "451895499719385575",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548344852174.png"
        },
        {
            "name": "MGP 2019 CANADIAN QUALIFIER",
            "id": "451895499727772767",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1565099961005.png"
        },
        {
            "name": "MGP 2019 GLOBAL QUALIFIER",
            "id": "451895499727772768",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1552942721566.png"
        },
        {
            "name": "MGP 2019 IO INTERMEDIATE",
            "id": "451895499727772769",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1560455943554.png"
        },
        {
            "name": "MGP 2019 IO MEGA CLASS",
            "id": "451895499727772770",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": null
        },
        {
            "name": "MGP 2019 IO MICRO",
            "id": "451895499727772771",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1560454943890.png"
        },
        {
            "name": "MGP 2019 IO ROOKIE",
            "id": "451895499723571852",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1565098244985.png"
        },
        {
            "name": "MGP 2019 IO WORLD CUP",
            "id": "451895499727772772",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1560460071070.png"
        },
        {
            "name": "MGP UTT 1",
            "id": "451895499731965768",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548278777953.png"
        },
        {
            "name": "MGP UTT 2: TSUNAMI",
            "id": "451895499731965769",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548278843072.png"
        },
        {
            "name": "MGP UTT 3: BESSEL RUN",
            "id": "451895499723571846",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548278722677.png"
        },
        {
            "name": "MGP UTT 4: HIGH VOLTAGE",
            "id": "451895499719385576",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548279136109.png"
        },
        {
            "name": "MGP UTT 5: NAUTILUS",
            "id": "451895499723571847",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548279468527.png"
        },
        {
            "name": "MGP UTT 6: FURY",
            "id": "451895499723571851",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548280222777.png"
        },
        {
            "name": "MGP UTT 8: REVENGE",
            "id": "451895499731965770",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198023987100/1548282966014.png"
        },
        {
            "name": "MORNING CRUISE",
            "id": "451895499715195885",
            "mapName": "MULTIGP",
            "parentCategory": "MultiGP",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198046438903/1547137720146.png"
        },
        {
            "name": "DRL 2017",
            "id": "451895499727772733",
            "mapName": "MUNICH PLAYOFFS",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "FACTIONS",
            "id": "451895499719385571",
            "mapName": "MUNICH PLAYOFFS",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684375103561.png"
        },
        {
            "name": "WUNDERFLOW",
            "id": "451895499731965793",
            "mapName": "MUNICH PLAYOFFS",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684374840949.png"
        },
        {
            "name": "CONFIRM NOR DENY",
            "id": "451895499731965796",
            "mapName": "OHIO CRASHSITE",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965798",
            "mapName": "OHIO CRASHSITE",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "RESTRICTED AREA",
            "id": "451895499731965797",
            "mapName": "OHIO CRASHSITE",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "SIM RACING CUP 5",
            "id": "451895499731965783",
            "mapName": "OHIO CRASHSITE",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1589831799668.png"
        },
        {
            "name": "DRL 2020 - OHIO CRASH SITE",
            "id": "451895499727772751",
            "mapName": "OHIO CRASHSITE",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "JAB - TOXIC AIRLINES",
            "id": "561324833623726243",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/62878b0def1696a091b9f76e/1671483347199.png"
        },
        {
            "name": "JAB - TWISTED TURNS",
            "id": "561324833640502075",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/62878b0def1696a091b9f76e/1691328302742.png"
        },
        {
            "name": "SKY TRACK // 2",
            "id": "561324833623726258",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a51986555a287000f94e9e4/1697029961054.png"
        },
        {
            "name": "CTG / 02: DERELICT DESERT",
            "id": "451895499711003619",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5c9ecc05ba3bdc580ea260c5/1699744819834.png"
        },
        {
            "name": "DUST TOWN",
            "id": "451895499715195887",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684380597090.png"
        },
        {
            "name": "DUST TOWN PLAZA",
            "id": "451895499727772755",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1652976663713.png"
        },
        {
            "name": "OOS EXPO",
            "id": "451895499731965775",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684380051880.png"
        },
        {
            "name": "SILENT AIRLINES",
            "id": "451895499719385568",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684381553112.png"
        },
        {
            "name": "THE LAYOVER",
            "id": "451895499731965785",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684381144583.png"
        },
        {
            "name": "THE SCRAPIERYARD",
            "id": "479439185235814900",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1692123710953.png"
        },
        {
            "name": "THE SCRAPIESTYARD",
            "id": "479439185235814901",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1692141506845.png"
        },
        {
            "name": "THE SCRAPYARD",
            "id": "451895499719385563",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684379065650.png"
        },
        {
            "name": "THE TERMINAL",
            "id": "451895499731965786",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684380971177.png"
        },
        {
            "name": "THE YARDSCRAP",
            "id": "478714408833517616",
            "mapName": "OUT OF SERVICE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9184c660a9ba18c52840a3/1691968356314.png"
        },
        {
            "name": "SWOOP MANHAT LVL 2",
            "id": "561324833619534410",
            "mapName": "PROJECT MANHATTAN",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a15f75e45fb05001485e91f/1700494582043.png"
        },
        {
            "name": "DRL 2016",
            "id": "451895499731965801",
            "mapName": "PROJECT MANHATTAN",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "PROJECT NOOB",
            "id": "451895499731965799",
            "mapName": "PROJECT MANHATTAN",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "SILENT MANHATTAN",
            "id": "451895499719385554",
            "mapName": "PROJECT MANHATTAN",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1682545024898.png"
        },
        {
            "name": "THE TRINITY TEST",
            "id": "451895499731965800",
            "mapName": "PROJECT MANHATTAN",
            "parentCategory": "DRL Maps",
            "mapThumb": null
        },
        {
            "name": "SILICON SOL NIGHT CIRCUIT",
            "id": "561324833648901039",
            "mapName": "SILICON VALLEY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/6139123c1903f7802cb94ea6/1684716133183.png"
        },
        {
            "name": "SILICON VALLEY CUP",
            "id": "561324833640502077",
            "mapName": "SILICON VALLEY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/614c3d821903f7802c2b4af5/1691164905013.png"
        },
        {
            "name": "SOLCON VALLEY NIGHT",
            "id": "561324833644697151",
            "mapName": "SILICON VALLEY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/6139123c1903f7802cb94ea6/1690150333083.png"
        },
        {
            "name": "SOL FLOW NATIONALS",
            "id": "561324833636307047",
            "mapName": "SILICON VALLEY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/6139123c1903f7802cb94ea6/1692832694077.png"
        },
        {
            "name": "SWOOPS STAIRCASED",
            "id": "561324833602763117",
            "mapName": "SILICON VALLEY",
            "parentCategory": "Community",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5a15f75e45fb05001485e91f/1706381065309.png"
        },
        {
            "name": "CORNER KICK",
            "id": "451895499723571877",
            "mapName": "SILICON VALLEY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684270916270.png"
        },
        {
            "name": "DRL 2022-23 - RACE IN THE CLOUD",
            "id": "451895499719385542",
            "mapName": "SILICON VALLEY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1683466221241.png"
        },
        {
            "name": "SCRIMMAGE",
            "id": "451895499731965779",
            "mapName": "SILICON VALLEY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684271377113.png"
        },
        {
            "name": "TICKET BOOTH",
            "id": "451895499731965788",
            "mapName": "SILICON VALLEY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684275601942.png"
        },
        {
            "name": "VIP SUITE",
            "id": "451895499731965792",
            "mapName": "SILICON VALLEY",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684276963854.png"
        },
        {
            "name": "DRL 2018",
            "id": "451895499719385567",
            "mapName": "SKATEPARK LA",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198092480805/1536713913004.png"
        },
        {
            "name": "RACE2VEGAS",
            "id": "451895499719385559",
            "mapName": "SKATEPARK LA",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/76561198147961226/1542763808310.png"
        },
        {
            "name": "VALKENBURG SESSION",
            "id": "451895499719385569",
            "mapName": "SKATEPARK LA",
            "parentCategory": "DRL Maps",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1684371475926.png"
        },
        {
            "name": "BAD NEIGHBOR",
            "id": "451895499723571873",
            "mapName": "THE HOUSE",
            "parentCategory": "Originals",
            "mapThumb": null
        },
        {
            "name": "STRATOTANKER",
            "id": "451895499723571860",
            "mapName": "U.S. AIR FORCE BONEYARD",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5951aa88d229c24607616861/1593727999748.png"
        },
        {
            "name": "SIM RACING CUP 8",
            "id": "451895499719385538",
            "mapName": "U.S. AIR FORCE BONEYARD",
            "parentCategory": "Sim Racing Cup",
            "mapThumb": null
        },
        {
            "name": "DRL 2020 - USAF",
            "id": "451895499719385546",
            "mapName": "U.S. AIR FORCE BONEYARD",
            "parentCategory": "Virtual Season",
            "mapThumb": null
        },
        {
            "name": "DRL 2021 - USAF",
            "id": "451895499719385547",
            "mapName": "U.S. AIR FORCE BONEYARD",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1637966182475.png"
        },
        {
            "name": "DRL 2022-23 USAF",
            "id": "451895499719385535",
            "mapName": "U.S. AIR FORCE BONEYARD",
            "parentCategory": "Virtual Season",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1670518560839.png"
        },
        {
            "name": "BLACKBIRD",
            "id": "451895499723571874",
            "mapName": "U.S. AIR FORCE NIGHT MODE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1614875387567.png"
        },
        {
            "name": "NIGHTHAWK",
            "id": "451895499731965774",
            "mapName": "U.S. AIR FORCE NIGHT MODE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1623097439268.png"
        },
        {
            "name": "THUNDERBOLT",
            "id": "451895499731965787",
            "mapName": "U.S. AIR FORCE NIGHT MODE",
            "parentCategory": "Originals",
            "mapThumb": "https://drl-game-api.s3.amazonaws.com/storage/5b9190a960a9ba18c52840a8/1623185606514.png"
        }
    ];
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
    const payload = {
        time: Math.floor(Date.now() / 1000)
    };
    const base64Data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    return base64Data
}
/*
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

function respondStorage(req, res) {
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
        respondStorage(req, res);
    } else if (req.method === "POST" && (req.url.startsWith("/storage/image/"))) {
        respondStorage(req, res);
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

server.listen(null, () => {
    console.log("Server listening on http://192.168.1.34:8080"); // THIS WILL BE DIFFERENT IF ON A DIFFERENT COMPUTER
});
*/
app.listen(PORT, () => {
    console.log(`Server is running on [http://localhost:${PORT}](http://localhost:${PORT})`);
});