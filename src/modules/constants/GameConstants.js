import { width, height } from '../../config'

export const PLAYER_HEALTHBAR_LENGTH = width-24

export const BULLET_REMOVAL_TIMEOUT = 1000
export const RAGDOLL_REMOVAL_TIMEOUT = 5000
export const BULLET_FORCE = 0.015
export const BULLET_IMPACT = 0.075
export const BULLET_FORCE_MULTIPLIER = 6
export const BULLET_SIZE = 6
export const PISTOL_LIMIT_TIME = 150
export const GRENADE_SIZE = 12
export const GRENADE_FORCE = 0.025
export const GRENADE_EXPLOSION_TIME = 2000
export const GRENADE_EXPLOSION_FORCE = .25
export const GRENADE_EXPLOSION_SIZE = 15
export const GRENADE_LIMIT_TIME = 1000

// Enemy Actions Constants
export const ENEMY_BULLET_FORCE = 0.025
export const ENEMY_BULLET_SHOOT_INTERVAL_MIN = 500
export const ENEMY_BULLET_SHOOT_INTERVAL_MAX = 3000
export const ENEMY_CROUCH_INTERVAL_MIN = 3000
export const ENEMY_CROUCH_INTERVAL_MAX = 10000
export const ENEMY_JUMP_INTERVAL_MIN = 3000
export const ENEMY_JUMP_INTERVAL_MAX = 10000
export const ENEMY_SWITCH_DIRECTION_INTERVAL_MIN = 2
export const ENEMY_SWITCH_DIRECTION_INTERVAL_MAX = 4

// Platforms
export const PLATFORM_Y_BUFFER = 200
export const PLATFORM_X_BUFFER = 50

// Player Death Types
export const PLAYER_FELL = 'player fell'
export const PLAYER_SHOT = 'player shot'
