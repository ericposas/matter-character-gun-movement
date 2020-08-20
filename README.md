# Game: Powered by Matter.js javascript physics engine

## BUGS
- shooting enemy arm still not damaging correctly
- player 'drifts' when he's idle
- not all bullets are getting removed when out-of-bounds

## TODO

### general
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
- use boxes for cover from enemy bullets
