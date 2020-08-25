import { World, Body, Composite } from 'matter-js'
import { BODY_DAMAGE, HEAD_DAMAGE, LIMB_DAMAGE, PLATFORM_DAMAGE, PLAYER_LIFEBAR_MULTIPLIER } from './constants/DamageConstants'
import { BULLET_FORCE_MULTIPLIER, BULLET_IMPACT, RAGDOLL_REMOVAL_TIMEOUT } from './constants/GameConstants'
import { GAME_OVER, MENU } from './constants/GameStates'
import { PLAYER_FELL, PLAYER_SHOT } from './constants/GameConstants'
import { createRagdoll } from './Ragdoll'
import { UpdateEnemyCount, DecrementEnemyKillCount } from './events/EventTypes'

export const removeOutOfBoundsPlayer = (player, world, destroyGameObjects, changeGameState) => {
	if (player.bodies[0].position.x > world.bounds.max.x || player.bodies[0].position.x < world.bounds.min.x || player.bodies[0].position.y > world.bounds.max.y) {
		killPlayer(player, world, destroyGameObjects, changeGameState, true, PLAYER_FELL)
		// console.log(true)
	}
}

export const removeOutOfBoundsRagdolls = (world, ragdolls) => {
	for (let i = 0; i < ragdolls.length; ++i) {
		let ragdoll = ragdolls[i]
		let ragdollBody = ragdoll.bodies[0]
		if (ragdollBody.position.x > world.bounds.max.x || ragdollBody.position.x < world.bounds.min.x || ragdollBody.position.y > world.bounds.max.y) {
			let idx = ragdolls.indexOf(ragdoll)
			if (idx > -1) {
				World.remove(world, ragdoll)
				ragdolls.splice(idx, 1)
				// console.log('ragdoll fell out of bounds and was removed', ragdolls)
			}
		}
	}
}

export const removeOutOfBoundsEnemies = (world, enemies) => {
	for (let i = 0; i < enemies.length; ++i) {
		let enemy = enemies[i]
		let enemyBody = enemy.bodies[0]
		if (enemyBody.position.x > world.bounds.max.x || enemyBody.position.x < world.bounds.min.x || enemyBody.position.y > world.bounds.max.y) {
			let idx = enemies.indexOf(enemy)
			if (idx > -1) {
				enemy.stopShooting(enemies)
				enemy.removeLifebar()
				World.remove(world, enemy)
				enemies.splice(idx, 1)
				dispatchEvent(DecrementEnemyKillCount)
				dispatchEvent(UpdateEnemyCount)
				// console.log('enemy fell out of bounds and was removed', enemies)
			}
		}
	}
}

export const removeOutOfBoundsBullets = (world, bullets) => {
	// remove out-of-bounds bullets
	for (let i = 0; i < bullets.length; ++i) {
		let bullet = bullets[i]
		if (bullet.position.x > world.bounds.max.x || bullet.position.x < world.bounds.min.x || bullet.position.y < world.bounds.min.y ) {
				let idx = bullets.indexOf(bullet)
				if (idx > -1) {
					World.remove(world, bullet)
					bullets.splice(idx, 1)
				}
		}
	}
}

const causeDamage = (elm, dmg) => {
	if (elm) {
		let lifeAmt = parseInt(elm.style.width, 10)
		let lifeBar = elm
		if (lifeAmt < dmg) {
			lifeAmt = 0
		} else {
			lifeAmt -= dmg
		}
		lifeBar.style.width = lifeAmt + 'px'
	}
}

const killPlayer = (player, world, destroyGameObjects, changeGameState, forceDeath, deathType) => {
	let lifebar = document.getElementById('player-lifebar-inner')
	let lifeAmt = parseInt(lifebar.style.width, 10)
	if (lifeAmt <= 0 || forceDeath == true) {
		destroyGameObjects()
		displayDeathMsg(deathType)
		changeGameState(GAME_OVER)
		document.getElementById('player-lifebar').style.display = 'none'
	}
	function displayDeathMsg(deathType) {
		let msg = document.getElementById('game-over-text')
		switch (deathType) {
			case PLAYER_FELL:
				msg.innerHTML = 'You fell to your death!'
				break;
			default:
				msg.innerHTML = 'You got murked!'
		}
	}
}

const removePlayerFromWorld = (player, world) => {
	World.remove(world, player)
}

const killEnemy = (player, enemies, enemy, world, ragdolls, bulletForceAngle) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		if (lifeAmt <= 0) {
			enemy._composite.stopShooting()
			// below function adds a ragdoll
			removeEnemyFromWorld(player, enemies, enemy, world, ragdolls, bulletForceAngle)
		}
	}
}

const removeEnemyFromWorld = (player, enemies, enemy, world, ragdolls, bulletForceAngle) => {
	if (enemy._outerLifebar.parentNode == document.body) {
		// console.log(bulletForceAngle)
		let enIdx = enemies.indexOf(enemy._composite)
		if (enIdx > -1) {
			dispatchEvent(DecrementEnemyKillCount)
			dispatchEvent(UpdateEnemyCount)
			enemies.splice(enIdx, 1)
			World.remove(world, enemy._composite)
			if (enemy._outerLifebar.parentNode == document.body) {
				document.body.removeChild(enemy._outerLifebar)
			}
		}
		// add a ragdoll in place of enemy character!
		let ragdoll = createRagdoll(world, 1)
		ragdolls.push(ragdoll)
		// console.log('enemy killed, ragdoll added to world..')
		// console.log('enemy count:', enemies)
		// console.log('ragdolls', ragdolls)
		Composite.translate(ragdoll, { x: enemy.position.x, y: enemy.position.y - 100 })
		Body.applyForce(ragdoll.bodies[0], ragdoll.bodies[0].position, {
			x: (bulletForceAngle.x * BULLET_FORCE_MULTIPLIER),
			y: -(bulletForceAngle.y * BULLET_FORCE_MULTIPLIER)
		})
		// set time limit for ragdoll body to be removed from scene
		setTimeout(() => {
			let idx = ragdolls.indexOf(ragdoll)
			if (idx > -1) {
				World.remove(world, ragdoll)
				ragdolls.splice(idx, 1)
				// console.log('ragdoll removed', ragdolls)
			}
		}, RAGDOLL_REMOVAL_TIMEOUT)
	}
}

export const checkPlayerIsOnGroundBegin = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = true
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = true
	}
}

export const checkPlayerIsOnPlatformBegin = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('platform') > -1) {
		let pBod = player.bodies[1]
		let platform = e.pairs[i].bodyB
		if (pBod.position.y < (platform.position.y - (platform.bounds.max.y - platform.bounds.min.y))) {
			// check if player position is between platfom width
			if (
					(pBod.position.x - ((pBod.bounds.max.x - pBod.bounds.min.x) + 10)) > platform.bounds.min.x ||
					(pBod.position.x + ((pBod.bounds.max.x - pBod.bounds.min.x) + 10)) < platform.bounds.max.x
				 ) {
				player.onPlatform = true
				player._currentPlatform = platform
				console.log('player is on platform')
			}
		}
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('platform') > -1) {
		let pBod = player.bodies[1]
		let platform = e.pairs[i].bodyA
		if (pBod.position.y < (platform.position.y - (platform.bounds.max.y - platform.bounds.min.y))) {
			if (
					(pBod.position.x - ((pBod.bounds.max.x - pBod.bounds.min.x) + 10)) > platform.bounds.min.x ||
					(pBod.position.x + ((pBod.bounds.max.x - pBod.bounds.min.x) + 10)) < platform.bounds.max.x
				 ) {
				player.onPlatform = true
				player._currentPlatform = platform
				console.log('player is on platform')
			}
		}
	}
}

export const checkEnemiesAreOnGround = (e, i, enemies) => {
	for (let j = 0; j < enemies.length; ++j) {
		if (e.pairs[i].bodyA === enemies[j].bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
			enemies[j].setGround(true)
		} else if (e.pairs[i].bodyB === enemies[j].bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
			enemies[j].setGround(true)
		}
	}
}

const processDamageType = (entity) => {
	if (entity.label.indexOf('enemy') > -1) {
		entity.label.indexOf('head') > -1
		? causeDamage(entity._lifebar, HEAD_DAMAGE)
		:
		entity.label.indexOf('body') > -1
		? causeDamage(entity._lifebar, BODY_DAMAGE)
		: causeDamage(entity._lifebar, LIMB_DAMAGE)
	} else if (entity.label.indexOf('player') > -1) {
		let bar = document.getElementById('player-lifebar-inner')
		entity.label.indexOf('head') > -1
		? causeDamage(bar, HEAD_DAMAGE * PLAYER_LIFEBAR_MULTIPLIER)
		:
		entity.label.indexOf('body') > -1
		? causeDamage(bar, BODY_DAMAGE * PLAYER_LIFEBAR_MULTIPLIER)
		: causeDamage(bar, LIMB_DAMAGE * PLAYER_LIFEBAR_MULTIPLIER)
	}
}

export const ragdollBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	let ragdoll, bullet
	if (e.pairs[i].bodyA.label.indexOf('ragdoll') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		ragdoll = e.pairs[i].bodyA._composite
		bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	} else if (e.pairs[i].bodyB.label.indexOf('ragdoll') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		ragdoll = e.pairs[i].bodyB._composite
		bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	}
}

export const playerBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('player') > -1 && e.pairs[i].bodyB.label == 'enemy bullet') {
		let player = e.pairs[i].bodyA
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		processDamageType(player)
		// Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	} else if (e.pairs[i].bodyB.label.indexOf('player') > -1 && e.pairs[i].bodyA.label == 'enemy bullet') {
		let player = e.pairs[i].bodyB
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		processDamageType(player)
		// Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	}
}

export const enemyBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	}
	// if enemies shoot each other, remove the bullet
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		if (idx > -1) {
			World.remove(world, bullet)
			bullets.splice(idx, 1)
		}
	}
}

export const bulletGroundHittest = (e, i, world, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('bullet') > -1  && e.pairs[i].bodyB.label === 'ground') {
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('bullet') > -1  && e.pairs[i].bodyA.label === 'ground') {
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
}

export const bulletDestructiblePlatformHittest = (e, i, world, bullets, dPlatArray) => {
	if (e.pairs[i].bodyA.label.indexOf('bullet') > -1  && e.pairs[i].bodyB.label === 'destructible platform') {
		let bullet = e.pairs[i].bodyA
		let dPlatform = e.pairs[i].bodyB
		dPlatform._this.damageHealthbar(PLATFORM_DAMAGE)
		if (dPlatform._this.getHealth() <= 0) {
			dPlatform._this.destroy()
		}
	} else if (e.pairs[i].bodyB.label.indexOf('bullet') > -1  && e.pairs[i].bodyA.label === 'destructible platform') {
		let bullet = e.pairs[i].bodyB
		let dPlatform = e.pairs[i].bodyA
		dPlatform._this.damageHealthbar(PLATFORM_DAMAGE)
		if (dPlatform._this.getHealth() <= 0) {
			dPlatform._this.destroy()
		}
	}
}

export const checkPlayerIsOnPlatformEnd = (e, i, player) => {
	if (player) {
		if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('platform') > -1) {
			player.onPlatform = false
			player._currentPlatform = null
		} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('platform') > -1) {
			player.onPlatform = false
			player._currentPlatform = null
		}
	}
}

export const checkPlayerIsOnGroundEnd = (e, i, player) => {
	if (player) {
		if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
			player.ground = false
		} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
			player.ground = false
		}
	}
}

export const ragdollBulletHittestEnd = (e, i, player, ragdolls, world) => {
	if (e.pairs[i].bodyA.label.indexOf('ragdoll') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let ragdollPart = e.pairs[i].bodyA
		let ragdoll = ragdollPart._composite
		// Body.applyForce(ragdollPart, ragdollPart.position, { x: 0, y: -BULLET_IMPACT })
	} else if (e.pairs[i].bodyB.label.indexOf('ragdoll') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let ragdollPart = e.pairs[i].bodyB
		let ragdoll = ragdollPart._composite
		// Body.applyForce(ragdollPart, ragdollPart.position, { x: 0, y: -BULLET_IMPACT })
	}
}

export const enemyBulletHittestEnd = (e, i, player, enemies, world, ragdolls, bulletForceAngle) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		killEnemy(player, enemies, enemy, world, ragdolls, bulletForceAngle)
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		killEnemy(player, enemies, enemy, world, ragdolls, bulletForceAngle)
	}
}

export const playerBulletHittestEnd = (e, i, player, world, destroyGameObjects, changeGameState) => {
	if (e.pairs[i].bodyA.label.indexOf('player') > -1 && e.pairs[i].bodyB.label == 'enemy bullet') {
		let playerBody = e.pairs[i].bodyA
		killPlayer(player, world, destroyGameObjects, changeGameState, null, PLAYER_SHOT)
	} else if (e.pairs[i].bodyB.label.indexOf('player') > -1 && e.pairs[i].bodyA.label == 'enemy bullet') {
		let playerBody = e.pairs[i].bodyB
		killPlayer(player, world, destroyGameObjects, changeGameState, null, PLAYER_SHOT)
	}
}
