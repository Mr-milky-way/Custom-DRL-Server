## THIS GUIDE WAS MADE BY @nri4040-dev [HERE](https://github.com/Mr-milky-way/Drone-Racing-League-Community-Server/issues/39)


1. Download [BepInEx](https://github.com/BepInEx/BepInEx/releases)

Even though this guide is for linux, you MUST use the windows .zip file, DO NOT use the linux version (this is because DRL Sim is a windows game)

Also, enable viewing hidden files by pressing Ctrl+H while in your file manager.

<img width="626" height="460" alt="Image" src="https://github.com/user-attachments/assets/1b7d1d2a-5db6-4b6b-ace0-539d17fbc98b" />

2.Download [ProtonUp-Qt](https://flathub.org/en/apps/net.davidotek.pupgui2)

This software lets you download, install and manage multiple compatibility tools (Proton and Wine based)

The easiest way to do this is through Flatpak (if you haven't configured flatpak on your device, make sure you follow the [setup guide for your Linux distribution](https://flathub.org/en/setup) before installing)

Open your terminal and type `flatpak install flathub net.davidotek.pupgui2`
then `flatpak run net.davidotek.pupgui2`

This will run the program (do not close the terminal, the program is running IN the terminal)

3. Install GE-Proton-10

A small pop up will appear

<img width="604" height="554" alt="Image" src="https://github.com/user-attachments/assets/379c9185-56a7-4c9f-afc8-4057ab5b1da8" />

(I have already installed it before, but when you open it there will be no tools installed)

Click on "Add", another pop up menu will appear

<img width="596" height="526" alt="Image" src="https://github.com/user-attachments/assets/2631380c-5c38-4239-bea6-cb9f5db7acce" />

Click on "Install" (do not change anything, just install the default tool. Do not worry if the name of the version is different from the image that I have posted here, it is just a newer version, please proceed as normal)

It might take a while to download, once finished, it will be automatically installed into steam compatibility tools

4. Set up DRL Simulator
If you have the game on steam, make sure steam is fully closed (do not let it run in the background). If not, steam will not be able to recognize the tool we have just installed.
Wait a few seconds, and open again steam.

Go to Library -> Right-click DRL Simulator -> Properties -> Compatibility.

Check the box next to "Force the use of a specific Steam Play compatibility tool

Scroll down on the list until you find the tool we recently downloaded (it might be at the bottom of the list)

<img width="844" height="597" alt="Image" src="https://github.com/user-attachments/assets/b23d963f-e145-404d-bf8b-f070a1f51be5" />

(If you have just installed DRL sim recently, or you haven't opened it yet, run it once before proceeding, this will let some initial files be downloaded and/or configured without any issues later on)

5. Disable Steam Overlay

On that same menu, go to General -> Enable the Steam Overlay while in-game

Disable it (It can cause issues later on, I'm not really sure if it's necessary but from what I've read it's better to be safe than sorry)

<img width="834" height="587" alt="Image" src="https://github.com/user-attachments/assets/fada8679-e80a-4afd-92cb-edbaf3e9058e" />

6. [Configure the DDL forwarding](https://docs.bepinex.dev/articles/advanced/proton_wine.html)

You will need to install [Protontricks](https://flathub.org/en/apps/com.github.Matoking.protontricks) on your device (it's a version of winetricks tweaked to be easier to use with Proton)

The easiest way to do this is through flatpak (once again, if you have not configured flatpak on your device, make sure you follow the [setup guide for your Linux distribution](https://flathub.org/en/setup) before installing)

Open your terminal and type `flatpak install flathub com.github.Matoking.protontricks`
then `flatpak run com.github.Matoking.protontricks`
(Do not close the terminal, the program is running IN the terminal)

A pop up will appear. Select DRL Sim, then click "Ok"

<img width="687" height="473" alt="Image" src="https://github.com/user-attachments/assets/c59c8f0d-3d0e-4464-8ec1-4e81fa61dd4c" />

then, on the following menu, select "Select default wineprefix" option and press OK

<img width="1037" height="576" alt="Image" src="https://github.com/user-attachments/assets/427dde19-551f-4dda-ac03-1f8a71deeff8" />

next, select "Run winecfg" and press OK

<img width="1010" height="531" alt="Image" src="https://github.com/user-attachments/assets/9c7b9708-0425-440b-94b5-e96bbfd82fab" />

Finally, In winecfg, select the "Libraries" tab. Under "New override for library" dropbox, select "winhttp" and click "Add"

<img width="407" height="206" alt="Image" src="https://github.com/user-attachments/assets/817f805d-9265-4890-a28a-bcfef2f0d171" />

Click "Apply", and now you can safely close all the pop ups and the terminal.

Explanation: If you are playing a Windows game on an Unix system (Linux/Mac/SteamOS/etc.) the game will have to run through a compatibility layer (Proton, or its predecessor Wine) which at the moment will likely prevent BepInEx from starting. This is because UnityDoorstop relies on dll files inside the game directory being loaded instead of system dlls, but under Proton/Wine this behavior does not happen by default. To make BepInEx work it's necessary to configure this DLL forwarding to work correctly.

7. Set up BepInEx

Open Steam, Go to Library and  right-click DRL Sim -> Properties -> Installed Files -> Browse
This will take you to the game root

<img width="833" height="585" alt="Image" src="https://github.com/user-attachments/assets/cf8cd05a-2b0b-4f90-8022-c68438d7d7d3" />

Extract the .zip file, and paste its contents onto the game root (DO NOT paste the folder containing the .zip file's contents, but rather the contents themselves)

<img width="954" height="687" alt="Image" src="https://github.com/user-attachments/assets/fe8e18cd-71aa-4b04-9f75-5466d502e37a" />

Now, close the file manager and close steam. Reopen steam and run the game once. Select "Start Offline" and wait until the main menu loads. Wait a couple of seconds and exit the game. (this will create some important files in the simulator's root)

8. Install DRL Patch

Download the zip file from this github page, and extract its contents.

<img width="602" height="649" alt="Image" src="https://github.com/user-attachments/assets/0238fc4d-6050-4d9d-8619-c2987edd2ecb" />

As you can see, the contents of the .zip patch have many files which we have already downloaded before.
Move the file `apiurl.txt` to the root.

From your location, navigate to /BepInEx/plugins/

There will be a file called `DRL_DLL_Hooks.dll`
From your game root, navigate to /BepInEx/plugins
Move the `DRL_DLL_Hooks.dll` file to the `plugins` folder

<img width="956" height="1030" alt="Image" src="https://github.com/user-attachments/assets/a4186801-b983-4916-a503-9f4d69a2f348" />



Once again, close your file manager, close steam completely, reopen it, and run the game.

Repeat the same process as before, and open the game's root. 
    
You should see `[Info   : DRL Hooks] DRL hook loaded` in BepInEx/LogOutput.log

This means you have succesfully installed the DRL Sim patch, and now you can use this program as usual as well as connect to servers.

I hope this guide helps and have a nice day :)

PD: sorry if this guide seems a bit messy, I know next to nothing about coding (actually i created this account with the sole purpose of posting this guide) and also I'm not a native speaker and my english is a bit rusty


Sources:
https://docs.bepinex.dev/articles/user_guide/installation/index.html
https://docs.bepinex.dev/articles/advanced/proton_wine.html
https://steamcommunity.com/sharedfiles/filedetails/?id=2939364481
https://www.reddit.com/r/cities2modding/comments/17yn7iv/how_do_i_install_bepinex_for_linux_which_uses/
