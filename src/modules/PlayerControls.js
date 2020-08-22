import { Render, Body, Composite, Vector, World } from 'matter-js'
import { BULLET_FORCE } from './constants/GameConstants'
import { width, height } from '../config'

export const calculateBulletAngle = (player, render, reticlePos) => {
	if (player) {
		let playerPos = player.bodies[0].position
		let targetAngle = Vector.angle(playerPos, {
			x: reticlePos.x + calcMovingReticlePosition(player, render),
			y: reticlePos.y
		})
		return {
			x: Math.cos(targetAngle) * BULLET_FORCE,
			y: Math.sin(targetAngle) * BULLET_FORCE
		}
	} else {
		return {
			x: 0,
			y: 0
		}
	}
}

export const renderMouse = (player, lastDirection, render, mouse_point, reticlePos) => { // called in the 'beforeTick' Engine event
	mouse_point.position.x = reticlePos.x + calcMovingReticlePosition(player, render)
	mouse_point.position.y = reticlePos.y
	if (mouse_point.position.x > player.bodies[1].position.x) { lastDirection = 'left' }
	else { lastDirection = 'right' }
}

export const calcMovingReticlePosition = (player, render) => {
	return player.bodies[0].position.x + ((render.bounds.min.x - render.bounds.max.x)/2)
}

export const toggleCrouch = (crouched, setCrouched, player, addSwappedBody, playerSwapBod) => {
	if (player && player.ground) {
		let swapped
		let x = player.bodies[0].position.x, y = player.bodies[0].position.y
		if (!crouched) {
			swapped = addSwappedBody(playerSwapBod('short', player, x, y))
		} else {
			swapped = addSwappedBody(playerSwapBod('normal', player, x, y))
		}
		setCrouched(swapped)
	}
}

export const renderPlayerMovementViaKeyInput = (render, keys, player, playerProps, ground, lastDirection) => {
	if (player) {
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
}
