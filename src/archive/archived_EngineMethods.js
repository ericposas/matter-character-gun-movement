import {
	renderMouse,
	toggleCrouch,
	renderPlayerMovementViaKeyInput,
	calcMovingReticlePosition,
	calculateBulletAngle,
	positionEnemyAim,
	removeOutOfBoundsBullets
} from './PlayerControls'
import {
	checkPlayerIsOnGroundBegin, checkPlayerIsOnGroundEnd,
	enemyBulletHittestBegin, enemyBulletHittestEnd,
	bulletGroundHittest,
	positionEnemyLifebar
} from './CollisionMethods'


const EngineMethods = (world, render, player, playerProps, getReticlePos, keys, lastDirection, mouse_point, ground, enemies, bullets, bulletForceAngle, bulletForceMultiplier) => {
	// ENGINE / RENDER EVENTS
	const checkCollisions = e => {
		// LOOP THROUGH ALL COLLISION TYPES
		for (let i = 0; i < e.pairs.length; ++i) {
			// CHECK IF PLAYER IS ON GROUND
			checkPlayerIsOnGroundBegin(e, i, player)
			// BULLET ENEMY HITTEST BEGIN
			enemyBulletHittestBegin(e, i, world, bulletForceAngle)
			// BULLETS GROUND HITTEST -- REMOVE
			bulletGroundHittest(e, i, world)
		}
	}

	const checkCollisionsEnd = e => {
		for (let i = 0; i < e.pairs.length; ++i) {
			// SET PLAYER IS ON GROUND
			checkPlayerIsOnGroundEnd(e, i, player)
			// BULLET ENEMY HITTEST END
			enemyBulletHittestEnd(e, i, enemies, world, bulletForceAngle)
		}
	}

	const renderEntities = () => {
		// keep enemy lifebar positions in-sync with enemies
		enemies.forEach((enemy, i) => {
			positionEnemyLifebar(enemy, render)
			positionEnemyAim(enemy, player)

		})
	}

	const gameTick = e => {
		// renderMouse() will draw the white line if it is in the requestAnimationFrame() loop
		let reticlePos = getReticlePos()
		renderMouse(player, lastDirection, render, mouse_point, reticlePos)
		renderEntities()
		removeOutOfBoundsBullets(world, bullets)
		renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
	}

	return {
		checkCollisions,
		checkCollisionsEnd,
		renderEntities,
		gameTick
	}
}

export default EngineMethods
