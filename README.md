# Game: Powered by Matter.js javascript physics engine

## NOTES
- game_state git branch is the latest feature branch
- could make the menu using standard html or pixi.js graphics

## BUGS
- shooting enemy arm still not damaging correctly
- player 'drifts' when he's idle
- not all bullets are getting removed when out-of-bounds

## TODO

### general
- be sure to go through and remove unused bodies on each level breakdown/setup
- add time limit until bullet objects automatically are removed from the world (to reduce performance issues)
- experiment with level layout, ground width, etc.
- refactor/abstract away all functions except main engine functions

### enemies
- add enemy random movement
- decide on when enemies will shoot (use a random number probably)
- need to remove all enemy bullet references from world

### player
- smooth out player platforming / controls
- create player lifebar and accept damage from enemy bullets

### game
- create game states for menu, pause, in-game, level-transition, game end, etc. and a way to smoothly remove bodies/graphics and build next scene

### gameplay
- add different death types; for instance, an explosion death that send body parts flying around
- use boxes for cover from enemy bullets
- possibly have the game be "arena-like" where mobs or waves of enemies spawn on each level
- level layout could change up every 5 "levels" or so possibly
- add walls or maybe players just die if they fall off the edge?
