import {
	Render, Body, Composite
} from 'matter-js'
import { width, height } from '../config'

export const renderPlayerMovementViaKeyInput = (render, keys, player, playerProps, ground, lastDirection) => {
	let playerPos = player.bodies[0].position
	let playerBod = player.bodies[1]
	// try to keep render view in-step with player character
	Render.lookAt(render, {
		min: { x: playerPos.x + width/2, y: 0 },
		max: { x: playerPos.x - width/2, y: height }
	})

	// math calculating size / pos of elms
	let playerHeight = (playerBod.bounds.max.y - playerBod.bounds.min.y)
	let groundHeight = (height - (ground.bounds.max.y - ground.bounds.min.y))
	groundHeight -= (ground.position.y - groundHeight)

	// jump key
	if (keys[87] &&
			(player.bodies[1].position.y - playerHeight) > (groundHeight-15) &&
			player.ground) {
		player.bodies[1].force = (
			lastDirection == 'left'
			?	{ x: -0.1, y: playerProps.jumpForce }
			: { x: 0.1, y: playerProps.jumpForce }
		)
	} else {
		Body.setAngle(player.bodies[1], 0)
		Body.setDensity(player.bodies[1], .025)
	}

	if (keys[65] || keys[68]) {
		if (playerProps.acceleration < playerProps.movementSpeed) {
			playerProps.acceleration += 0.2
		}
	} else {
		playerProps.acceleration = 0
	}

	if (keys[65]) {
		lastDirection = 'left'
		if (player.ground) {
			Composite.translate(player, { x: -playerProps.acceleration, y: 0 })
		} else {
			Composite.translate(player, { x: -playerProps.inAirMovementSpeed, y: 0 })
		}
	} else {
		if (keys[68]) {
			lastDirection = 'right'
			if (player.ground) {
				Composite.translate(player, { x: playerProps.acceleration, y: 0 })
			} else {
				Composite.translate(player, { x: playerProps.inAirMovementSpeed, y: 0 })
			}
		}
	}
}
