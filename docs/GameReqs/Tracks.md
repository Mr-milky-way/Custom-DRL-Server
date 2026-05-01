# Tracks
## Community tracks vs In Game Tracks
When you are given dev mode, you have the ablity to upload your custom tracks into sections. I origanly thought that community tracks were stored in a different table than in game tracks, but it seems like they go in the same table. The main difference seems to be in "map-category". The community tracks all seem to have the category "MapCommon" and the in game tracks have everything else but none use "MapCommon". The Dev mode also allows you to change the category, so they most likely use the same table


## Notes
- The game stores tracks as json
- Wants full tracks as files but doesn't always want full tracks
- Tracks are XOR'ed with the key 63

## End Points 

| URL | Type | Info |
|---|---|---|
| /maps/ | POST | [Info](#maps-post) |
| /maps/updated/ | POST | [Info](#mapsupdated-post) |
| /maps/:guid/rate/ | POST | [Info](#mapsguidrate-post) |
| /maps/:guid/duplicate | POST | [Info](#mapsguidduplicate-post) |
| /progression/maps/ | GET | [Info](#progressionmaps-get) |
| /maps/updated/ | GET | [Info](#mapsupdated-get) |
| /maps/user/updated/ | GET | [Info](#mapsuserupdated-get) |
| /maps/:guid/remove/ | GET | [Info](#mapsguidremove-get) |
| /maps/:guid | GET | [Info](#mapsguid-get) |
| /maps/ | GET | [Info](#maps-get) |


## POST

### /maps/ (POST)
This is where new maps that are created are sent to to be stored, it sends over the whole map as json not a file.

### /maps/updated/ (POST)
This sends over a list of maps, and versions of those maps, that the game has downloaded after [/maps/updated/ GET](#mapsupdated-get)


### /maps/:guid/rate/ (POST)
This sends a rating that the user provides from 0 (or 0.2 haven't checked) to 1, 1 being the highest and 0 (or 0.2) being the lowest. :guid is the map guid

### /maps/:guid/duplicate (POST)
This is for users to duplicate maps currently not know other than :guid being the map guid.

## GET

### /progression/maps/ (GET)
This sends over data to the client about how much XP each map is worth. It's important to note that the client doesn't use this to give XP to the player, the server does that in the leaderboards.

### /maps/updated/ (GET)
This sends over a list of new maps for the game to download for offline play, should only be used on offical maps. Should use the data from [/maps/updated POST](#mapsupdated-post) to only send new maps.

### /maps/user/updated/ (GET)
This sends a list of maps where the user is either a collaborator or creator of the map.

### /maps/:guid/remove/ (GET)
This allows users to delete maps they have. As with all of the others :guid is the guid of the map.

### /maps/:guid (GET)
For some reason this seems to be where the game downloads community tracks from, and the url provided in the file.

### /maps/ (GET)
This sends a list of community tracks to the game.