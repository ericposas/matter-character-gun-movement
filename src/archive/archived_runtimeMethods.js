import { World } from 'matter-js'

// PHYSICS RENDERING, HELPER METHODS
const calcMovingReticlePosition = (player, render) => {
	return player.bodies[0].position.x + ((render.bounds.min.x - render.bounds.max.x)/2)
}

export const calculateBulletAngle = (reticlePos) => {
	let playerPos = player.bodies[0].position
	let targetAngle = Vector.angle(playerPos, {
		x: reticlePos.x + calcMovingReticlePosition(),
		y: reticlePos.y
	})
	let force = .01
	return {
		x: Math.cos(targetAngle) * force,
		y: Math.sin(targetAngle) * force
	}
}

export const checkGround = (e, player, bool) => {
	var pairs = e.pairs
	for (var i = 0, j = pairs.length; i != j; ++i) {
		var pair = pairs[i]
		if (pair.bodyA === player.bodies[1]) {
			player.ground = bool
		} else if (pair.bodyB === player.bodies[1]) {
			player.ground = bool
		}
	}
}

export const checkBulletCollisionGroundRemove = (e, world) => {
	for (let i = 0; i < e.pairs.length; ++i) {
		if (e.pairs[i].bodyA.label === 'bullet' && e.pairs[i].bodyB.label === 'ground') {
			World.remove(world, e.pairs[i].bodyA)
		} else if (e.pairs[i].bodyB.label === 'bullet' && e.pairs[i].bodyA.label === 'ground') {
			World.remove(world, e.pairs[i].bodyB)
		}
	}
}

// render mouse
export const renderMouse = (player, render, mouse_point, reticlePos, lastDirection) => {
	requestAnimationFrame(renderMouse)
	mouse_point.position.x = reticlePos.x + calcMovingReticlePosition(player, render)
	mouse_point.position.y = reticlePos.y
	if (mouse_point.position.x > player.bodies[1].position.x) {
		lastDirection = 'left'
	} else {
		lastDirection = 'right'
	}
}
