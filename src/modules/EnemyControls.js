import { Vector, Body, Composite } from 'matter-js'
import { width, height } from '../config'

export const positionEnemyLifebar = (enemy, render) => {
	let lifebar = enemy.bodies[0]._outerLifebar
	let headHt = enemy.bodies[0].bounds.max.y - enemy.bodies[0].bounds.min.y
	lifebar.style.left = enemy.bodies[0].position.x - (enemy.bodies[0]._barsize.w/2) - render.bounds.min.x + 'px'
	lifebar.style.top = enemy.bodies[0].position.y - headHt - enemy.bodies[0]._barsize.h - render.bounds.min.y + 'px'
}

export const positionEnemyAim = (enemy, player) => {
	let arm = enemy.bodies[2]
	if (player) {
		let defaultRadians = { left: -2.45, right: -0.75 }
		let defaultDistance = width * .75
		let enemyWidth = enemy.bodies[1].bounds.max.x - enemy.bodies[1].bounds.min.x
		let plHeight = player.bodies[1].bounds.max.y - player.bodies[1].bounds.min.y
		let armAngle
		let playerPos = {
			x: player.bodies[0].position.x,
			y: player.bodies[0].position.y - (plHeight * 2)
		}
		armAngle = Vector.angle(arm.position, playerPos)
		Body.setAngle(arm, armAngle)
	} else {
		Body.setAngle(arm, { x: 0, y: 0 })
	}
}
