# Storage

## Notes
- The old servers stored stuff under /storage/{userid}/{FileName}
- Images are pngs


## Endpoints
| URL | Type | Info |
|---|---|---|
| /storage/logs/ | POST | [Info](#storagelogs-post) |
| /replay/ | POST | [Info](#replay-post) |
| /storage/replay-cloud/ | POST | [Info](#storagereplay-cloud-post) |
| /storage/image/ | POST | [Info](#storageimage-post) |

### /storage/logs/ (POST)
Sends over the log from the game to the server

### /replay/ (POST)
Game sends over replay to here after finnshing a track. Should be used over [/storage/replay-cloud/](#storagereplay-cloud-post)

### /storage/replay-cloud/ (POST)
Also sends over a replay but not as much data.

### /storage/image/ (POST)
Where images are sent to, the game wants back a url of where the image is stored