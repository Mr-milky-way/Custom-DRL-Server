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

app.use('/maps', express.static(path.join(__dirname, 'maps')));

app.post('/storage/logs/', (req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        console.log(body)
    })
    res.status(200).json({ success: true });
})

app.post('/storage/image/', (req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        console.log(body)
    })
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
    const progressionMaps = [];

    res.status(200).json({ success: true, encoded: true, data: progressionMaps });
})

app.get('/state/game/', (req, res) => {
    const payload = { lastState: null };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.get('/state/', (req, res) => {
    const payload = {
        "invalidate-settings-cache": "False",
        "_id": "629fdc1cf9f4670094b5dbb6",
        "createdAt": "2022-06-07T23:15:40.526Z",
        "updatedAt": "2025-06-06T21:25:04.988Z",
        "__v": "0",
        "lastLogin": "2025-06-06T21:25:04.638Z",
        "profile-score": "1",
        "branch-id": "public",
        "circuits-data": "[{\"difficulty\":0,\"track-ids\":[\"5cc737da57316900299e5590\",\"5c9408b015716a003a1a6772\",\"5d163df313232000233bd91d\",\"5cc203dd2d7d64003da13c84\",\"5f999d1285389b00c85f0cc2\"],\"id\":\"60fb42d4525622001100d6cf\",\"name\":\"Round and Round\",\"description\":\"Easy\",\"image-file-name\":\"circuit-a.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":97576,\"image-fingerprint\":\"fa60f1cb7bcc090de00f4ff8e7d1f110\",\"image-updated-at\":\"2021-11-20T20:22:22.917Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/60fb/42d4/5256/2200/1100/d6cf/original/circuit-a.jpg?1637439742\",\"maps-data\":[{\"map-id\":\"MP-3fd\",\"track-id\":\"CMP-af26895e90b0f65bcbc80f14\",\"is-custom\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-d74a7b93f15431314fcafa63\",\"is-custom\":true},{\"map-id\":\"MP-693\",\"track-id\":\"CMP-60da79544961bced88e1e769\",\"is-custom\":true},{\"map-id\":\"MP-df5\",\"track-id\":\"CMP-bc8c43f123bf70b0708cccd8\",\"is-custom\":true},{\"map-id\":\"MP-3fd\",\"track-id\":\"CMP-c5ea414071e5d108d6d555b4\",\"is-custom\":true}]},{\"difficulty\":1,\"track-ids\":[\"6390d28940f4db00173a9fc3\",\"6392153805f39200184cf77d\",\"63a32e10506ba80018d09fb0\",\"63cb0dcc3f40fc001763e0fc\",\"638f9044db297c0017aebb7b\"],\"id\":\"649f0c2f421aa90014b4b3bc\",\"name\":\"2023 SIM TRYOUTS\",\"description\":\"2023 SIM TRYOUTS\",\"image-file-name\":\"tryouts-2023-card.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":182849,\"image-fingerprint\":\"3d83bec875f60a36efa263837cd21317\",\"image-updated-at\":\"2023-06-30T18:06:19.921Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/649f0c2f421aa90014b4b3bc/original/tryouts-2023-card.jpg?1688148379\",\"maps-data\":[{\"map-id\":\"MP-693\",\"track-id\":\"CMP-6ba465387ca55861c929bb5e\",\"is-custom\":true},{\"map-id\":\"MP-f95\",\"track-id\":\"CMP-041761a1de63902e52304637\",\"is-custom\":true},{\"map-id\":\"MP-bf7\",\"track-id\":\"CMP-873899440387945b47438ca5\",\"is-custom\":true},{\"map-id\":\"MP-2cb\",\"track-id\":\"CMP-4301a83126bb59eb3d13c270\",\"is-custom\":true},{\"map-id\":\"MP-50c\",\"track-id\":\"CMP-3947963bc8c42b57e443e670\",\"is-custom\":true}]},{\"difficulty\":1,\"track-ids\":[\"6092f7855d6108001c784d77\",\"5c17cbcdc22833001b528e53\",\"5bbb928668ace47297e8282b\",\"5e221799ad2ed0004781af71\",\"5bbb928668ace47297e8282d\"],\"id\":\"619982b370b24a0009b04ed8\",\"name\":\"Clean Air\",\"description\":\"Medium\",\"image-file-name\":\"circuit-b.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":124668,\"image-fingerprint\":\"4919ba3fae40880bee337c3f6e6ccf80\",\"image-updated-at\":\"2021-11-20T23:20:19.024Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/6199/82b3/70b2/4a00/09b0/4ed8/original/circuit-b.jpg?1637450419\",\"maps-data\":[{\"map-id\":\"MP-50c\",\"track-id\":\"CMP-03eca5ed327327d4957d4d2c\",\"is-custom\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-083a3849284fbb25b734079f\",\"is-custom\":true},{\"map-id\":\"MP-95a\",\"track-id\":\"MT-46e\",\"is-custom\":false},{\"map-id\":\"MP-103\",\"track-id\":\"CMP-e881d92a3b613be559cd4162\",\"is-custom\":true},{\"map-id\":\"MP-95a\",\"track-id\":\"MT-9eb\",\"is-custom\":false}]},{\"difficulty\":2,\"track-ids\":[\"6284f327f2e42a010faa11d5\",\"6287a2066271050084fb7d5c\",\"628d302806805000a6b233b9\",\"628e3cd79293f2002f30b07f\",\"6290eae22c3583003aa49efa\"],\"id\":\"627464ea3de6b20020104b65\",\"name\":\"2022 SIM TRYOUTS \",\"description\":\"2022 SIM TRYOUTS \",\"image-file-name\":\"circuit-e.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":263072,\"image-fingerprint\":\"1c6e0a8144c1fb0b0f1f7ec5b26bf083\",\"image-updated-at\":\"2022-05-05T23:59:38.572Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/627464ea3de6b20020104b65/original/tryouts-card.png?1659468539\",\"maps-data\":[{\"map-id\":\"MP-103\",\"track-id\":\"CMP-71711b4806777c6748aa045e\",\"is-custom\":true},{\"map-id\":\"MP-95a\",\"track-id\":\"CMP-7ab877a2c62446a10c9316a0\",\"is-custom\":true},{\"map-id\":\"MP-615\",\"track-id\":\"CMP-65b9e4d81355bbc6987e28a7\",\"is-custom\":true},{\"map-id\":\"MP-50c\",\"track-id\":\"CMP-ec3987d58e2a4923656d133c\",\"is-custom\":true},{\"map-id\":\"MP-2cb\",\"track-id\":\"CMP-2eb752471d01b43ceb0651e0\",\"is-custom\":true}]},{\"difficulty\":2,\"track-ids\":[\"5bbb928668ace47297e82825\",\"5c898f8117e2c0d3778263a3\",\"5c644ccd9df2d641de446a0e\",\"5e208ed0463e9300466a2ffb\",\"5f2836764b26f9006253bdec\"],\"id\":\"60fb4c40525622000e00d6cf\",\"name\":\"Championship Road\",\"description\":\"Hard\",\"image-file-name\":\"circuit-c.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":120263,\"image-fingerprint\":\"f7a528b94619405d0a9ae3ed9f0aaeff\",\"image-updated-at\":\"2021-11-20T23:09:14.878Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/60fb/4c40/5256/2200/0e00/d6cf/original/circuit-c.jpg?1637449754\",\"maps-data\":[{\"map-id\":\"MP-342\",\"track-id\":\"CMP-a953a1a75b2d615a0213a7dc\",\"is-custom\":true},{\"map-id\":\"MP-693\",\"track-id\":\"CMP-ad9784b026932d04123da653\",\"is-custom\":true},{\"map-id\":\"MP-b59\",\"track-id\":\"CMP-374eda734d9113a2344bdf09\",\"is-custom\":true},{\"map-id\":\"MP-615\",\"track-id\":\"CMP-189046b6b6985c5623e49041\",\"is-custom\":true},{\"map-id\":\"MP-2e1\",\"track-id\":\"CMP-e74536dad8e7791d58d66ad0\",\"is-custom\":true}]},{\"difficulty\":2,\"track-ids\":[\"5f432052ae9ea9001c4af167\",\"603feea4d4d3f300c663e3dc\",\"5bbb928668ace47297e8282a\",\"5fe22e2a6464e8000f3847c9\",\"5be0f0e5f252f00021a1055c\"],\"id\":\"6199838870b24a000ab04ed8\",\"name\":\"No Swimming\",\"description\":\"Hard\",\"image-file-name\":\"circuit-d.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":164927,\"image-fingerprint\":\"294b742ebb88923224faa2e2d9ca64db\",\"image-updated-at\":\"2021-11-20T23:23:52.49Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/6199/8388/70b2/4a00/0ab0/4ed8/original/circuit-d.jpg?1637450632\",\"maps-data\":[{\"map-id\":\"MP-b59\",\"track-id\":\"CMP-558ea06080d14de0d15a5820\",\"is-custom\":true},{\"map-id\":\"MP-50c\",\"track-id\":\"CMP-a88c8801c8d39856a5c164d1\",\"is-custom\":true},{\"map-id\":\"MP-95a\",\"track-id\":\"MT-6b7\",\"is-custom\":false},{\"map-id\":\"MP-0a3\",\"track-id\":\"CMP-5e454d20c0b897a6a1ae8bda\",\"is-custom\":true},{\"map-id\":\"MP-b59\",\"track-id\":\"CMP-4de34c061e2226d7edc9d9d0\",\"is-custom\":true}]},{\"difficulty\":2,\"track-ids\":[\"5f3eb8214531170036887222\",\"5bbb928668ace47297e82827\",\"5f68beb6ce620d003f073a7e\",\"5bbb928668ace47297e82834\",\"5bbb928668ace47297e8282c\"],\"id\":\"61998a5670b24a000ab04ed9\",\"name\":\"The Abandoned\",\"description\":\"Hard\",\"image-file-name\":\"circuit-e.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":263072,\"image-fingerprint\":\"1c6e0a8144c1fb0b0f1f7ec5b26bf083\",\"image-updated-at\":\"2021-11-20T23:52:54.182Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/6199/8a56/70b2/4a00/0ab0/4ed9/original/circuit-e.jpg?1637452374\",\"maps-data\":[{\"map-id\":\"MP-ed5\",\"track-id\":\"CMP-004cbc546ec06dca564d52b8\",\"is-custom\":true},{\"map-id\":\"MP-0b3\",\"track-id\":\"CMP-48ce4155c57415baedaece19\",\"is-custom\":true},{\"map-id\":\"MP-bf7\",\"track-id\":\"CMP-822841be172a5dae822ba773\",\"is-custom\":true},{\"map-id\":\"MP-669\",\"track-id\":\"CMP-da50eba1bdbd4100dd34eac5\",\"is-custom\":true},{\"map-id\":\"MP-95a\",\"track-id\":\"MT-964\",\"is-custom\":false}]},{\"difficulty\":2,\"track-ids\":[\"5ed6729b08e7dc002304d4ee\",\"5bbb928668ace47297e82838\",\"5f970f3c433e940017dd0305\",\"5bbb928668ace47297e82839\",\"6047aa72e0052300adffeaa5\"],\"id\":\"61998e5370b24a0009b04ed9\",\"name\":\"Wheels Up\",\"description\":\"Hard\",\"image-file-name\":\"circuit-f.jpg\",\"image-content-type\":\"image/jpeg\",\"image-file-size\":111591,\"image-fingerprint\":\"6f8994e96f0003bd8ca899a1a7002be2\",\"image-updated-at\":\"2021-11-21T00:09:55.852Z\",\"image-url\":\"https://s3.us-east-1.amazonaws.com/drl-game-dashboard/api/circuits/images/6199/8e53/70b2/4a00/09b0/4ed9/original/circuit-f.jpg?1637453395\",\"maps-data\":[{\"map-id\":\"MP-f95\",\"track-id\":\"CMP-909b60384099d99b03a3e013\",\"is-custom\":true},{\"map-id\":\"MP-103\",\"track-id\":\"CMP-ea59ba2e81b5d7055e324c48\",\"is-custom\":true},{\"map-id\":\"MP-f95\",\"track-id\":\"CMP-8bcca5e4b5350721e2291867\",\"is-custom\":true},{\"map-id\":\"MP-103\",\"track-id\":\"CMP-9d3494209244e3467d263dd8\",\"is-custom\":true},{\"map-id\":\"MP-19c\",\"track-id\":\"CMP-bba477dca256b82d0c76c762\",\"is-custom\":true}]}]",
        "clear-maps-cache": false,
        "player-id": "629fdc1c6b1092601af12c93",
        "profile-color": "8e00ef",
        "profile-country-iso": "US",
        "profile-language-iso": "english",
        "profile-name": "Ninety9prob",
        "settings-controller-profiles": "{\"Version\":3,\"Data\":[{\"hardwareName\":\"frsky simulator\",\"guid\":\"978c63dd2933\",\"isDefault\":false,\"defaultControllerType\":3,\"centerPointMode\":false,\"rawInputMode\":false,\"assignedAxisData\":[{\"ElementID\":3,\"rawAxis\":1,\"assignedAxis\":0,\"center\":-0.00363135338,\"min\":-0.9921111,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":0,\"rawAxis\":4,\"assignedAxis\":1,\"center\":0.0154345036,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":1.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":1,\"rawAxis\":3,\"assignedAxis\":2,\"center\":-0.002342403,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":2,\"rawAxis\":2,\"assignedAxis\":3,\"center\":-0.007799804,\"min\":-0.9527428,\"max\":0.9527428,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":4,\"rawAxis\":27,\"assignedAxis\":4,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":7,\"rawAxis\":28,\"assignedAxis\":5,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005}],\"toggleAsButtonA\":-1,\"toggleAsButtonB\":-1,\"customXMLmap\":\"\",\"usingCustomXMLmap\":true,\"usingAdapter\":false},{\"hardwareName\":\"controller (xbox 360 for windows)\",\"guid\":\"d61d81697dcb\",\"isDefault\":true,\"defaultControllerType\":1,\"centerPointMode\":false,\"rawInputMode\":false,\"assignedAxisData\":[{\"ElementID\":0,\"rawAxis\":1,\"assignedAxis\":0,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":1,\"rawAxis\":4,\"assignedAxis\":1,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":0.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":2,\"rawAxis\":3,\"assignedAxis\":2,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":3,\"rawAxis\":2,\"assignedAxis\":3,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":-1,\"rawAxis\":27,\"assignedAxis\":4,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":-1,\"rawAxis\":28,\"assignedAxis\":5,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005}],\"toggleAsButtonA\":-2,\"toggleAsButtonB\":-2,\"customXMLmap\":\"\",\"usingCustomXMLmap\":false,\"usingAdapter\":false},{\"hardwareName\":\"rm tx16s joystick\",\"guid\":\"WindowsRawInputRMTX16SJoystick203084f541209-0000-0000-0000-504944564944\",\"isDefault\":false,\"defaultControllerType\":3,\"centerPointMode\":false,\"rawInputMode\":false,\"assignedAxisData\":[{\"ElementID\":3,\"rawAxis\":1,\"assignedAxis\":0,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":2,\"rawAxis\":4,\"assignedAxis\":1,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-1.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":0,\"rawAxis\":3,\"assignedAxis\":2,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":1,\"rawAxis\":2,\"assignedAxis\":3,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0005},{\"ElementID\":4,\"rawAxis\":27,\"assignedAxis\":4,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":5,\"rawAxis\":28,\"assignedAxis\":5,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0}],\"toggleAsButtonA\":-1,\"toggleAsButtonB\":-1,\"customXMLmap\":\"\",\"usingCustomXMLmap\":true,\"usingAdapter\":false},{\"hardwareName\":\"controller (xbox one for windows)\",\"guid\":\"WindowsRawInputController(XboxOneForWindows)76702ff045e-0000-0000-0000-504944564944\",\"isDefault\":false,\"defaultControllerType\":1,\"centerPointMode\":false,\"rawInputMode\":false,\"assignedAxisData\":[{\"ElementID\":0,\"rawAxis\":1,\"assignedAxis\":0,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":1,\"rawAxis\":4,\"assignedAxis\":1,\"center\":0.203362942,\"min\":-0.3591618,\"max\":1.0,\"zeroThrottle\":-1.0,\"inverted\":true,\"deadzone\":0.0},{\"ElementID\":2,\"rawAxis\":3,\"assignedAxis\":2,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":3,\"rawAxis\":2,\"assignedAxis\":3,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":true,\"deadzone\":0.0},{\"ElementID\":4,\"rawAxis\":27,\"assignedAxis\":4,\"center\":0.0,\"min\":-1.0,\"max\":0.9414359,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":5,\"rawAxis\":28,\"assignedAxis\":5,\"center\":0.0,\"min\":-1.0,\"max\":0.9960937,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0}],\"toggleAsButtonA\":-1,\"toggleAsButtonB\":-1,\"customXMLmap\":\"\",\"usingCustomXMLmap\":true,\"usingAdapter\":false},{\"hardwareName\":\"radiomaster boxer joystick\",\"guid\":\"WindowsRawInputRadiomasterBoxerJoystick203084f541209-0000-0000-0000-504944564944\",\"isDefault\":false,\"defaultControllerType\":3,\"centerPointMode\":false,\"rawInputMode\":false,\"assignedAxisData\":[{\"ElementID\":3,\"rawAxis\":1,\"assignedAxis\":0,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":2,\"rawAxis\":4,\"assignedAxis\":1,\"center\":-0.00600608252,\"min\":-1.0,\"max\":0.9849918,\"zeroThrottle\":-1.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":0,\"rawAxis\":3,\"assignedAxis\":2,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0102000479},{\"ElementID\":1,\"rawAxis\":2,\"assignedAxis\":3,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0102000479},{\"ElementID\":32,\"rawAxis\":27,\"assignedAxis\":4,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0},{\"ElementID\":33,\"rawAxis\":28,\"assignedAxis\":5,\"center\":0.0,\"min\":-1.0,\"max\":1.0,\"zeroThrottle\":-2.0,\"inverted\":false,\"deadzone\":0.0}],\"toggleAsButtonA\":0,\"toggleAsButtonB\":1,\"customXMLmap\":\"\",\"usingCustomXMLmap\":true,\"usingAdapter\":false}]}",
        "settings-fc-profile-active-guid": "816aa6a57b4b",
        "settings-fc-profiles": "[{\"fcp-guid\":\"c9c95741a820\",\"fcp-rc-rate-pitch-rollp\":0.65,\"fcp-rc-rate-pitch-rollr\":0.65,\"fcp-rc-rate-yaw\":0.65,\"fcp-super-rate-pitch-rollp\":0.65,\"fcp-super-rate-pitch-rollr\":0.65,\"fcp-super-rate-yaw\":0.65,\"fcp-expo-pitch-rollp\":0.0,\"fcp-expo-pitch-rollr\":0.0,\"fcp-expo-yaw\":0.0,\"fcp-expo-throttle\":0.0,\"fcp-super-rate-throttle\":0.5,\"fcp-drone-tilt\":35.0,\"fcp-drone-fov\":90.84043,\"fcp-pid-yaw-p\":55.0,\"fcp-pid-yaw-i\":0.0,\"fcp-pid-yaw-d\":0.0,\"fcp-pid-pitch-p\":40.0,\"fcp-pid-pitch-i\":0.0,\"fcp-pid-pitch-d\":50.0,\"fcp-pid-roll-p\":40.0,\"fcp-pid-roll-i\":0.0,\"fcp-pid-roll-d\":50.0,\"fcp-rc-rate-throttle\":2.5142},{\"fcp-guid\":\"816aa6a57b4b\",\"fcp-rc-rate-pitch-rollp\":0.7,\"fcp-rc-rate-pitch-rollr\":0.93,\"fcp-rc-rate-yaw\":0.539999962,\"fcp-super-rate-pitch-rollp\":0.7,\"fcp-super-rate-pitch-rollr\":0.7,\"fcp-super-rate-yaw\":0.7,\"fcp-expo-pitch-rollp\":0.0,\"fcp-expo-pitch-rollr\":0.0,\"fcp-expo-yaw\":0.0,\"fcp-expo-throttle\":0.0,\"fcp-super-rate-throttle\":0.0,\"fcp-drone-tilt\":46.0,\"fcp-drone-fov\":94.43441,\"fcp-pid-yaw-p\":55.0,\"fcp-pid-yaw-i\":0.0,\"fcp-pid-yaw-d\":0.0,\"fcp-pid-pitch-p\":40.0,\"fcp-pid-pitch-i\":0.0,\"fcp-pid-pitch-d\":50.0,\"fcp-pid-roll-p\":40.0,\"fcp-pid-roll-i\":0.0,\"fcp-pid-roll-d\":50.0,\"fcp-rc-rate-throttle\":2.5142},{\"fcp-guid\":\"747408b3b665\",\"fcp-rc-rate-pitch-rollp\":1.93999994,\"fcp-rc-rate-pitch-rollr\":0.5,\"fcp-rc-rate-yaw\":0.25,\"fcp-super-rate-pitch-rollp\":0.0,\"fcp-super-rate-pitch-rollr\":0.7,\"fcp-super-rate-yaw\":0.7,\"fcp-expo-pitch-rollp\":1.0,\"fcp-expo-pitch-rollr\":0.0,\"fcp-expo-yaw\":0.0,\"fcp-expo-throttle\":0.0,\"fcp-super-rate-throttle\":0.0,\"fcp-pid-yaw-p\":55.0,\"fcp-pid-yaw-i\":0.0,\"fcp-pid-yaw-d\":0.0,\"fcp-pid-pitch-p\":40.0,\"fcp-pid-pitch-i\":0.0,\"fcp-pid-pitch-d\":50.0,\"fcp-pid-roll-p\":40.0,\"fcp-pid-roll-i\":0.0,\"fcp-pid-roll-d\":50.0,\"fcp-rc-rate-throttle\":2.5142,\"fcp-drone-tilt\":46.0,\"fcp-drone-fov\":94.43441},{\"fcp-guid\":\"04c1d0067c95\",\"fcp-rc-rate-pitch-rollp\":0.7,\"fcp-rc-rate-pitch-rollr\":0.7,\"fcp-rc-rate-yaw\":0.7,\"fcp-super-rate-pitch-rollp\":0.099999994,\"fcp-super-rate-pitch-rollr\":0.099999994,\"fcp-super-rate-yaw\":0.099999994,\"fcp-expo-pitch-rollp\":0.0,\"fcp-expo-pitch-rollr\":0.0,\"fcp-expo-yaw\":0.0,\"fcp-expo-throttle\":0.0,\"fcp-super-rate-throttle\":0.5},{\"fcp-guid\":\"140555e05021\",\"fcp-rc-rate-pitch-rollp\":0.7,\"fcp-rc-rate-pitch-rollr\":0.7,\"fcp-rc-rate-yaw\":0.7,\"fcp-super-rate-pitch-rollp\":0.1,\"fcp-super-rate-pitch-rollr\":0.1,\"fcp-super-rate-yaw\":0.1,\"fcp-expo-pitch-rollp\":0.0,\"fcp-expo-pitch-rollr\":0.0,\"fcp-expo-yaw\":0.0,\"fcp-expo-throttle\":0.0,\"fcp-super-rate-throttle\":0.5}]",
        "settings-game-race-line-color": "4",
        "steam-id": "76561197962206745",
        "steam-install-path": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\DRL Simulator",
        "steam-purchase-unix-seconds": 1654643572,
        "storage-replay-file-count": 410,
        "storage-replay-memory-usage": "41619816",
        "system-info_win_7815": "{\"version\":\"4.0.d74d.rls-win\",\"operatingSystem\":\"Windows 10  (10.0.19044) 64bit\",\"processorType\":\"AMD Ryzen 9 3900X 12-Core Processor \",\"processorFrequency\":\"3793\",\"processorCount\":\"24\",\"deviceModel\":\"System Product Name (System manufacturer)\",\"deviceName\":\"DESKTOP-CCIFPG5\",\"deviceType\":\"Desktop\",\"graphicsDeviceID\":\"7815\",\"graphicsDeviceName\":\"NVIDIA GeForce RTX 2080\",\"graphicsDeviceType\":\"Direct3D11\",\"graphicsDeviceVersion\":\"Direct3D 11.0 [level 11.1]\",\"graphicsDeviceVendor\":\"NVIDIA\",\"graphicsDeviceVendorID\":\"4318\",\"systemMemorySize\":\"32676\",\"graphicsMemorySize\":\"8010\",\"graphicsMultiThreaded\":\"False\",\"graphicsShaderLevel\":\"50\",\"maxTextureSize\":\"16384\",\"npotSupport\":\"Full\",\"supportedRenderTargetCount\":\"8\",\"copyTextureSupport\":\"Basic, Copy3D, DifferentTypes, TextureToRT, RTToTexture\",\"supports3DTextures\":\"True\",\"supportsImageEffects\":null,\"supportsShadows\":\"True\",\"currentResolutionWidth\":\"2560\",\"currentResolutionHeight\":\"1440\",\"quality\":\"0\",\"hardwareScore\":\"1.00\",\"supportSparseTexture\":\"True\",\"displayCount\":\"1\",\"displayResolutions\":\"2560x1440@True\"}",
        "garage-active-rig": "DRD-fc5bf84d13e5bac67957921c",
        "onboarding-progress-pro": "3",
        "onboarding-progress-proMissions": "0",
        "settings-game-arm-and-turtle": "False",
        "onboarding-started": "True",
        "fcmode-active": 3,
        "settings-battery-resistance": 18.0,
        "flight-time": "64852.43281995596",
        "onboarding-progress-beginner": "10",
        "onboarding-progress-intermediate": "11",
        "onboarding-orientation": "True",
        "circuits-opponent-mode": "1",
        "circuits-opponent-difficulty": "2",
        "circuits-progress": "[{\"circuit-id\":\"60fb42d4525622001100d6cf\",\"circuit-name\":\"Round and Round\",\"circuit-progress\":5,\"circuit-times\":\"[54.29098,52.07131,116.024879,39.8380928,53.9172974]\",\"drl-official\":true,\"has-finished\":true,\"replay-urls\":\"[\\\"races/629fdc1c6b1092601af12c93/1655310114553.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655310314470.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655310486183.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655310689736.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655310782130.race\\\"]\",\"circuit-attempts\":3},{\"circuit-id\":\"619982b370b24a0009b04ed8\",\"circuit-name\":\"Clean Air\",\"circuit-progress\":5,\"circuit-times\":\"[53.7342567,86.97074,95.9796143,58.104187,55.23736]\",\"drl-official\":true,\"has-finished\":true,\"replay-urls\":\"[\\\"races/629fdc1c6b1092601af12c93/1655311171715.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655311317192.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655311583277.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655311823646.race\\\",\\\"races/629fdc1c6b1092601af12c93/1655313849726.race\\\"]\",\"circuit-attempts\":4},{\"circuit-id\":\"627464ea3de6b20020104b65\",\"circuit-name\":\"2022 SIM TRYOUTS \",\"circuit-progress\":0,\"circuit-times\":\"[]\",\"drl-official\":true,\"has-finished\":false,\"replay-urls\":\"[\\\"races/629fdc1c6b1092601af12c93/1655309562269.race\\\"]\"},{\"circuit-id\":\"649f0c2f421aa90014b4b3bc\",\"circuit-name\":\"2023 SIM TRYOUTS\",\"circuit-progress\":1,\"circuit-times\":\"[70.0126]\",\"drl-official\":true,\"has-finished\":false,\"replay-urls\":\"[\\\"races/629fdc1c6b1092601af12c93/1688677720595.race\\\",\\\"races/629fdc1c6b1092601af12c93/1688420013448.race\\\",\\\"races/629fdc1c6b1092601af12c93/1688425808191.race\\\",\\\"races/629fdc1c6b1092601af12c93/1688421306527.race\\\",\\\"races/629fdc1c6b1092601af12c93/1688427973427.race\\\"]\",\"circuit-attempts\":4}]",
        "settings-audio-volume-music": "0",
        "maps-favorite": "[{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-1630238b227713aeed900973\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-0c57443b36b17c5022130b5a\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-5b51d87190a67ac5a77b2a7b\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-4c20deeb4304b493988b3e3d\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-ae5d571a0b5b974b084a01b8\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-23de760d2bd13aa9b7d202a3\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-74c6de0729a214441de20a20\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-67d38758d82651e3419885c7\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-3a0bc8b68127e36379772151\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-8877310adc119b55d0434817\",\"custom-map\":true},{\"map-id\":\"MP-50c\",\"track-id\":\"CMP-b694e12ecdb24c0c412de494\",\"custom-map\":true},{\"map-id\":\"MP-2cb\",\"track-id\":\"CMP-93771758b22661c6aa6d658d\",\"custom-map\":true},{\"map-id\":\"MP-2cb\",\"track-id\":\"CMP-156dcd04c33d3dda3c079e62\",\"custom-map\":true},{\"map-id\":\"MP-0c6\",\"track-id\":\"CMP-7475484814761170aa5061ec\",\"custom-map\":true},{\"map-id\":\"MP-23c\",\"custom-map\":true,\"track-id\":\"CMP-b28561d9e3bd175ba80460ed\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-664129bfae422d001140f635\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-66404e20b71bbe001865c46e\"},{\"map-id\":\"MP-95a\",\"custom-map\":true,\"track-id\":\"CMP-66412969d704af0009048c79\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-66632cbe215582000ae296ac\"},{\"map-id\":\"MP-103\",\"custom-map\":true,\"track-id\":\"CMP-66412b15b126ac0024e7a0d0\"},{\"map-id\":\"MP-103\",\"custom-map\":true,\"track-id\":\"CMP-66412ac35f7e22003215a97e\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-66404e547022a500349d8562\"},{\"map-id\":\"MP-103\",\"custom-map\":true,\"track-id\":\"CMP-669717878e497a0009b24801\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-66eff3c32521e90017be347e\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-6704ad39e26b730040e4d27c\"},{\"map-id\":\"MP-0c6\",\"custom-map\":true,\"track-id\":\"CMP-6707588c1e0228002bee3b7e\"}]",
        "settings-game-tuning-promode": "False",
        "settings-audio-volume-sfx": "0.240285248",
        "network-server-region": "1",
        "network-connected-region": "1",
        "fcmode-active-missions": "3",
        "settings-game-crosshair": "True",
        "settings-game-race-fast-reset": "True",
        "settings-game-lens-distortion": "False",
        "settings-audio-volume-main": "0.2031153",
        "profile-affiliation-ama": "no",
        "profile-affiliation-military": "no",
        "profile-age": "",
        "profile-country": "US",
        "profile-data-completion": "1",
        "profile-email": "",
        "profile-experience-built-own-drone": "no",
        "profile-experience-fpv": "never flown",
        "profile-experience-non-fpv": "never flown",
        "profile-full-name": "",
        "profile-gender": "male",
        "profile-watch-drl": "social media",
        "profile-experience-fpv-years": "1",
        "profile-experience-non-fpv-years": "1",
        "profile-experience-preference-fpv": "freestyle",
        "settings-game-controller-overlay": "False",
        "profile-photo-url": "https://avatars.steamstatic.com/6d6ccc63d22e35f262daf4b872212ac63b8eb722_full.jpg",
        "system-info_win_8726": "{\"version\":\"4.2.ee16.rls-win\",\"operatingSystem\":\"Windows 10  (10.0.19045) 64bit\",\"processorType\":\"AMD Ryzen 9 3900X 12-Core Processor \",\"processorFrequency\":\"3793\",\"processorCount\":\"24\",\"deviceModel\":\"System Product Name (System manufacturer)\",\"deviceName\":\"DESKTOP-CCIFPG5\",\"deviceType\":\"Desktop\",\"graphicsDeviceID\":\"8726\",\"graphicsDeviceName\":\"NVIDIA GeForce RTX 3080\",\"graphicsDeviceType\":\"Direct3D11\",\"graphicsDeviceVersion\":\"Direct3D 11.0 [level 11.1]\",\"graphicsDeviceVendor\":\"NVIDIA\",\"graphicsDeviceVendorID\":\"4318\",\"systemMemorySize\":\"32676\",\"graphicsMemorySize\":\"10053\",\"graphicsMultiThreaded\":\"False\",\"graphicsShaderLevel\":\"50\",\"maxTextureSize\":\"16384\",\"npotSupport\":\"Full\",\"supportedRenderTargetCount\":\"8\",\"copyTextureSupport\":\"Basic, Copy3D, DifferentTypes, TextureToRT, RTToTexture\",\"supports3DTextures\":\"True\",\"supportsImageEffects\":null,\"supportsShadows\":\"True\",\"currentResolutionWidth\":\"2560\",\"currentResolutionHeight\":\"1440\",\"quality\":\"0\",\"hardwareScore\":\"1.00\",\"supportSparseTexture\":\"True\",\"displayCount\":\"1\",\"displayResolutions\":\"2560x1440@True\"}",
        "settings-notification-state-menu": "2",
        "settings-game-check-point-color": "5",
        "settings-game-chat": "False",
        "settings-notification-state-ingame": "2",
        "settings-radio-noise": "False",
        "settings-game-propwash": "0",
        "settings-game-race-guide": "False",
        "settings-game-gate-markers": "False",
        "profile-block-list": "[]",
        "profile-secondary-color": "",
        "settings-game-race-stats": "True",
        "hasReview": "true",
        "settings-game-race-auto-standings": "True",
        "settings-game-trails": "False",
        "settings-graphics-advanced-rendering": "True",
        "settings-graphics-ambient-occlusion": "1",
        "settings-graphics-antialias": "0",
        "settings-graphics-details-quality": "1",
        "settings-graphics-dof": "0",
        "settings-graphics-effects-quality": "0",
        "settings-graphics-exclusive-mode": "False",
        "settings-graphics-fps-limit": "358",
        "settings-graphics-fullscreen": "True",
        "settings-graphics-mode": "1",
        "settings-graphics-motion-blur": "False",
        "settings-graphics-post-processing": "0",
        "settings-graphics-quality": "-1",
        "settings-graphics-render-scale": "1",
        "settings-graphics-resolution-x": "2560",
        "settings-graphics-resolution-y": "1440",
        "settings-graphics-shadows": "1",
        "settings-graphics-texture": "2",
        "settings-graphics-tier": "0",
        "settings-graphics-vsync": "0",
        "settings-graphics-water-reflection": "False",
        "profile-inventory": "[\"SK-3e1\",\"SK-c96\",\"SK-7e3\",\"SK-0a1\"]"
    };
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})

app.use(express.json());

app.post('/state/', (req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
        console.log(body)
    })
    res.status(200).json({ success: true });
})

app.get('/maps/updated/', (req, res) => {
    console.log("/maps/updated/ MAPS")
    const payload = tracks;
    res.status(200).json({ success: true, data: payload });
})


app.get('/maps/user/updated/', (req, res) => {
    console.log("/maps/user/updated/ MAPS")
    const payload = Ctracks;
    const base64Data = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.status(200).json({ success: true, data: base64Data });
})


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


app.get('/experience-points/progression/', (req, res) => {
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
        "prizes": [
            { "id": "prize1", "name": "Golden Badge", "amount": 1 },
            { "id": "prize2", "name": "XP Boost", "amount": 100 }
        ]
    };

    res.status(200).json({ success: true, data: payload });
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