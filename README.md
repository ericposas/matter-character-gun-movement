# Game: Powered by Matter.js javascript physics engine

## NOTES
- ._this on a matter body refers to the class/prototype function that controls it so that we can call our custom methods
- game_state git branch is the latest feature branch
- could make the menu using standard html or pixi.js graphics

## BUGS
- player 'drifts' towards the direction of the mouse cursor when he's idle.. maybe its a "feature"

## TODO

### general
- look into 'unsticking' character from platforms/walls when trying to jump on them (and missing)
- game works fine in an embedded html iframe

### platforms
- add destructible cover
- cover can be walked through, but stop bullets until they are destroyed

### items
- add grenade item
- add shotgun item
- add smg item

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
