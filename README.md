# Game: Powered by Matter.js javascript physics engine

## NOTES
- game_state git branch is the latest feature branch
- could make the menu using standard html or pixi.js graphics

## BUGS
- player 'drifts' towards the direction of the mouse cursor when he's idle.. maybe its a "feature"

## TODO

### general
- incorporate additional platforms to jump on
- game works fine in an embedded html iframe

### items
- make random health drops in different sizes (drop between waves)

### enemies
- add variance to enemy lifebar and damage rates

### player
- smooth out player platforming / controls

### game
- create game states for menu, pause, in-game, level-transition, game end, etc. and a way to smoothly remove bodies/graphics and build next scene

### gameplay
- blood effects will consist of a bunch of circle particles spilling around the dead enemy
- add different death types; for instance, an explosion death that send body parts flying around
- use boxes for cover from enemy bullets
- possibly have the game be "arena-like" where mobs or waves of enemies spawn on each level
- level layout could change up every 5 "levels" or so possibly
- add walls or maybe players just die if they fall off the edge?
- add different gun types, each with unique effects or fire rates: shotgun, grenade (should use variable force on the angle of the grenade trajectory), smg, assault rifle
