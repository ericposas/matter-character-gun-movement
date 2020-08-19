import { World, Body, Composite } from 'matter-js'
import { BODY_DAMAGE, HEAD_DAMAGE, LIMB_DAMAGE } from './DamageConstants'
import { createRagdoll } from './Ragdoll'


export const positionEnemyLifebar = (enemy, render) => {
	let lifebar = enemy.bodies[0]._outerLifebar
	let headHt = enemy.bodies[0].bounds.max.y - enemy.bodies[0].bounds.min.y
	lifebar.style.left = enemy.bodies[0].position.x - (enemy.bodies[0]._barsize.w/2) - render.bounds.min.x + 'px'
	lifebar.style.top = enemy.bodies[0].position.y - headHt - enemy.bodies[0]._barsize.h - render.bounds.min.y + 'px'
}

const damageEnemy = (enemy, dmg) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		let lifeBar = enemy._lifebar
		if (lifeAmt < dmg) {
			lifeAmt = 0
		} else {
			lifeAmt -= dmg
		}
		lifeBar.style.width = lifeAmt + 'px'
	}
}

const killEnemy = (enemies, enemy, world, bulletForceAngle, bulletForceMultiplier) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		if (lifeAmt <= 0) {
			removeEnemyFromWorld(enemies, enemy, world, bulletForceAngle, bulletForceMultiplier)
		}
	}
}

const removeEnemyFromWorld = (enemies, enemy, world, bulletForceAngle, bulletForceMultiplier) => {
	if (enemy._outerLifebar.parentNode == document.body) {
		let enIdx = enemies.indexOf(enemy._composite)
		enemies.splice(enIdx, 1)
		World.remove(world, enemy._composite)
		document.body.removeChild(enemy._outerLifebar)
		// add a ragdoll in place of enemy character!
		let ragdoll = createRagdoll(world, 1)
		Composite.translate(ragdoll, { x: enemy.position.x, y: enemy.position.y - 100 })
		Body.applyForce(ragdoll.bodies[0], ragdoll.bodies[0].position, { x: bulletForceAngle.x * bulletForceMultiplier, y: bulletForceAngle.y * bulletForceMultiplier })
	}
}

export const checkPlayerIsOnGroundBegin = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = true
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = true
	}
}

const processDamageType = enemy => {
	enemy.label.indexOf('head') > -1
	? damageEnemy(enemy, HEAD_DAMAGE)
	:
		enemy.label.indexOf('body') > -1
		? damageEnemy(enemy, BODY_DAMAGE)
		: damageEnemy(enemy, LIMB_DAMAGE)
}

export const enemyBulletHittestBegin = (e, i, world, bulletForceAngle, bulletForceMultiplier) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * bulletForceMultiplier })
		let bullet = e.pairs[i].bodyB
		World.remove(world, bullet)
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * bulletForceMultiplier })
		let bullet = e.pairs[i].bodyA
		World.remove(world, bullet)
	}
}

export const bulletGroundHittest = (e, i, world) => {
	if (e.pairs[i].bodyA.label === 'bullet' && e.pairs[i].bodyB.label === 'ground') {
		World.remove(world, e.pairs[i].bodyA)
	} else if (e.pairs[i].bodyB.label === 'bullet' && e.pairs[i].bodyA.label === 'ground') {
		World.remove(world, e.pairs[i].bodyB)
	}
}

export const checkPlayerIsOnGroundEnd = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = false
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = false
	}
}

export const enemyBulletHittestEnd = (e, i, enemies, world, bulletForceAngle, bulletForceMultiplier) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		killEnemy(enemies, enemy, world, bulletForceAngle, bulletForceMultiplier)
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		killEnemy(enemies, enemy, world, bulletForceAngle, bulletForceMultiplier)
	}
}
