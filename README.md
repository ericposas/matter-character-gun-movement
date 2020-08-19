# Game: Powered by Matter.js javascript physics engine

## BUGS
- shooting enemy arm still not damaging correctly

## TODO
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
- figure out if we need a ducking mechanic, use of boxes for cover, or both in order to dodge enemy bullets
- crouching/ducking is working, need to re-align player limbs; also x. y coords of last player instance position
