# Game: Powered by Matter.js javascript physics engine

## Controls
- W, A, S, D for movement
- [ SPACEBAR ] to change weapon
- mouse for aim

## NOTES
- game development halted due to architectural issues
- ._this on a matter body refers to the class/prototype function that controls it so that we can call our custom methods
- game_state git branch is the latest feature branch
- could make the menu using standard html or pixi.js graphics

## BUGS
- player 'drifts' towards the direction of the mouse cursor when he's idle.. maybe its a "feature"

## TODO

### general
- if a grenade hits the player, it make his arm go all wonky
- look into 'unsticking' character from platforms/walls when trying to jump on them (and missing)
- game works fine in an embedded html iframe

### weapons
- weapons are unlocked depending on the wave level and have unlimited usage
- Or... there's an upgrade shop where you can purchase new weapons or upgrade ones that you already have
- can also upgrade damage or impact force on weapons to make things more interesting
- add shotgun
- maybe change cursor depending on the weapon equipped

### platforms
- add destructible cover
- cover can be walked through, but stop bullets until they are destroyed

### items
- add timeout for health drops to disappear

### enemies
- add variance to enemy lifebar and damage rates

### player
- smooth out player platforming / controls

### gameplay
- blood effects will consist of a bunch of circle particles spilling around the dead enemy
- add different death types; for instance, an explosion death that send body parts flying around
- use boxes for cover from enemy bullets
- possibly have the game be "arena-like" where mobs or waves of enemies spawn on each level
- level layout could change up every 5 "levels" or so possibly
- add different gun types, each with unique effects or fire rates: shotgun, grenade (should use variable force on the angle of the grenade trajectory), smg, assault rifle
