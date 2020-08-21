import { World, Body, Composite } from 'matter-js'
import { BODY_DAMAGE, HEAD_DAMAGE, LIMB_DAMAGE, PLAYER_LIFEBAR_MULTIPLIER } from './DamageConstants'
import { BULLET_FORCE_MULTIPLIER, BULLET_IMPACT, RAGDOLL_REMOVAL_TIMEOUT } from './GameConstants'
import { GAME_OVER, MENU } from './GameStates'
import { createRagdoll } from './Ragdoll'


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

const killPlayer = (player, world, destroyGameObjects, changeGameState) => {
	let lifebar = document.getElementById('player-lifebar-inner')
	let lifeAmt = parseInt(lifebar.style.width, 10)
	if (lifeAmt <= 0) {
		destroyGameObjects()
		changeGameState(GAME_OVER)
		document.getElementById('player-lifebar').style.display = 'none'
	}
}

const removePlayerFromWorld = (player, world) => {
	World.remove(world, player)

}

const killEnemy = (player, enemies, enemy, world) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		if (lifeAmt <= 0) {
			enemy._composite.stopShooting()
			removeEnemyFromWorld(player, enemies, enemy, world)
		}
	}
}

const removeEnemyFromWorld = (player, enemies, enemy, world) => {
	if (enemy._outerLifebar.parentNode == document.body) {
		let enIdx = enemies.indexOf(enemy._composite)
		let _x = (
			enemy.position.x < player.bodies[0].position.x ? -BULLET_IMPACT : BULLET_IMPACT
		)
		enemies.splice(enIdx, 1)
		World.remove(world, enemy._composite)
		document.body.removeChild(enemy._outerLifebar)
		// add a ragdoll in place of enemy character!
		let ragdoll = createRagdoll(world, 1)
		Composite.translate(ragdoll, { x: enemy.position.x, y: enemy.position.y - 100 })
		Body.applyForce(ragdoll.bodies[0], ragdoll.bodies[0].position, {
			x: _x,
			y: BULLET_IMPACT/2
		})
		// set time limit for ragdoll body to be removed from scene
		setTimeout(() => {
			World.remove(world, ragdoll)
		}, RAGDOLL_REMOVAL_TIMEOUT) // 10 seconds

	}
}

export const checkPlayerIsOnGroundBegin = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = true
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = true
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

export const playerBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('player') > -1 && e.pairs[i].bodyB.label == 'enemy bullet') {
		let player = e.pairs[i].bodyA
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		processDamageType(player)
		// Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('player') > -1 && e.pairs[i].bodyA.label == 'enemy bullet') {
		let player = e.pairs[i].bodyB
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		processDamageType(player)
		// Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
}

export const enemyBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
	// if enemies shoot each other, remove the bullet
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
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

export const checkPlayerIsOnGroundEnd = (e, i, player) => {
	if (player) {
		if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
			player.ground = false
		} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
			player.ground = false
		}
	}
}

export const enemyBulletHittestEnd = (e, i, player, enemies, world) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		killEnemy(player, enemies, enemy, world)
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		killEnemy(player, enemies, enemy, world)
	}
}

export const playerBulletHittestEnd = (e, i, player, world, destroyGameObjects, changeGameState) => {
	if (e.pairs[i].bodyA.label.indexOf('player') > -1 && e.pairs[i].bodyB.label == 'enemy bullet') {
		let playerBody = e.pairs[i].bodyA
		killPlayer(player, world, destroyGameObjects, changeGameState)
	} else if (e.pairs[i].bodyB.label.indexOf('player') > -1 && e.pairs[i].bodyA.label == 'enemy bullet') {
		let playerBody = e.pairs[i].bodyB
		killPlayer(player, world, destroyGameObjects, changeGameState)
	}
}
