# Drone Racing League Community Server

Back in December of 2025 the servers for DRL Sim (Drone Racing League Simulator) got shut down along with the company. This erased over 7 years of data like maps, leaderboard entries, and custom drones. It also made the game basically unplayable: can't race against yourself, can't create maps, and can't make custom drones, can't play with other players (ofc), and your settings don't even save. Most of the community just thought that was it, no more DRL Sim. After all the company is gone, why would the game not be?

But I, a Clippy and a Stop Killing Games supporter, decided that I was going to do what DRL didn't and make a way for the community to bring the game back online. I started by decompiling the game and just took a look around the code. Then I just tried to send false data to the game to "login".

It worked and from there I just sent it and tried to rebuild as much of the server as possible. 

## Just want to Fix it?
### Go [Here](/docs/Install.md)

## List Of Public Servers

```https://api.drl-game.com```

## Docs (WIP)
Docs for Functions and data sent by the game can be found [here](/docs/MainDocs.md)

## Instructions

### Requirements
- [Node.js with NPM](https://nodejs.org/en/download)

### Getting Started
> [!NOTE]
> If you run this on your machine you will only get your own data, IE you will be the only person on the leaderboard

> [!WARNING]
> Before you start I HIGHLY RECOMMEND BACKING UP YOUR GAME!!! This will make sure that you have something to fall back to if it breaks - it probably will - and the game will clear all of your saved data, IE controllers settings, graphics settings, maps, ect.

You are going to also need to install some npm packages to run this. You can run this comand below
```
npm install express express-rate-limit sqlite3 dotenv pm2 express-session lusca bcrypt sharp
```

You are also going to need the code which you can grab with git
```
git clone https://github.com/Mr-milky-way/Custom-DRL-Server.git
```
or download from github up at the top here.

### DLL setup
Go over to [this release](https://github.com/Mr-milky-way/Custom-DRL-Server/releases/tag/V1-DLLS) and follow the instructions there (you will need to change the API URL in apiurl.txt)

### Running the server

Go into what ever folder you downloaded this repo into and run it with
```
node index.js
```
wait for it to say:
```
Server is running on [http://localhost:8080](http://localhost:8080)
```
then run the game.

**Now you are done and can play the game**

> [!NOTE]
> Some things are still broken and do not work right. If something fails make an issue on this repo. I should get to it at somepoint

### Environment Variables

There are 5 environment variables as of apr 28, 2026
```
PORT
URL
STEAM_API_KEY
SESSION_SECRET
NODE_ENV
```

```STEAM_API_KEY``` Is required and is an apikey from steam
```SESSION_SECRET``` Is advised and is the secret for admin sessions
Everything else is optional or is set to a default
```PORT``` defaults to 8080
```URL``` defaults to http://localhost
```NODE_ENV``` unset, when set to production it enables secure for admin seestions
