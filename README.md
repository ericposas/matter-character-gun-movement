# Game: Powered by Matter.js javascript physics engine

## NOTES
- game_state git branch is the latest feature branch
- could make the menu using standard html or pixi.js graphics

## BUGS
- adding an extra check, checkGameEntitiesReady() seems to prevent multiple calls to destroyGameObjects() and createGameObjects()
- "obj is null" error when we get to the GAME_OVER screen and playerObjects are removed
- shooting enemy arm still not damaging correctly
- player 'drifts' when he's idle

## TODO

### general
- create total enemy count for the level, you win when all enemies are cleared
- experiment with level layout, ground width, etc.

### enemies
- make enemies crouch randomly
- add variance to enemy lifebar and damage rates

### player
- smooth out player platforming / controls
- create player lifebar and accept damage from enemy bullets

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
