// updates the enemy count score UI
export const UPDATE_ENEMY_COUNT = 'update enemy count'
export const UpdateEnemyCount = new Event(UPDATE_ENEMY_COUNT)
// decreases the number of kill required in the current enemy wave
export const DECREMENT_ENEMY_KILL_COUNT = 'decrement enemy kill count'
export const DecrementEnemyKillCount = new Event(DECREMENT_ENEMY_KILL_COUNT)
// export const ENEMY_COUNT_INCREMENT = 'increment enemy count'
// export const ENEMY_COUNT_DECREMENT = 'decrement enemy count'
// export const incrementScore = new Event(ENEMY_COUNT_INCREMENT)
// export const decrementScore = new Event(ENEMY_COUNT_DECREMENT)
export const UPDATE_WAVE = 'update wave'
export const UpdateWave = new Event(UPDATE_WAVE)
