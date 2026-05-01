# Dev mode
## Giving Dev Mode
When you are given the attribute of "profile-developer" = true in your state file it unlocks dev mode.

## Dev Mode uses
Dev Mode allows who ever has it to publish maps to the Main tracks thingy more on that [here](/docs/GameReqs/Tracks.md). It also seems to allow for recording of replays in some sort of special way but that needs a program named recorder.exe, which is not present in the game files. May be able to recreate it from function calls. There doesn't seem to be other uses, although I haven't done too much digging.

```
Uploading Crash Report
Win32Exception: ApplicationName='D:/DroneRacingLeagueSim/DRL Simulator_Data/StreamingAssets/game/storage//videos/VideoRecorder/recorder.exe', CommandLine='-y -r 60 -f rawvideo -vcodec rawvideo -pix_fmt rgba -video_size 2560:1440 -i - -vf "vflip,scale=1920:1080" -quality realtime -row-mt 1 -tile-columns 6 -frame-parallel 1 -threads 16 -speed 5 -b:v 12M -crf 20  -vcodec libvpx-vp9 -pix_fmt yuv420p "D:/DroneRacingLeagueSim/DRL Simulator_Data/StreamingAssets/game/storage/videos/20260319040959_Replay_SinglePlayer_MP-23c_MT-fb1.webm"', CurrentDirectory='', Native error= %1 is not a valid Win32 application.
```

recorder.exe is FFmpeg renamed