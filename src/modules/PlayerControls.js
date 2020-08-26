import { Render, Body, Composite, Vector, World } from 'matter-js'
import { BULLET_FORCE } from './constants/GameConstants'
import { width, height } from '../config'

export const calcMovingReticlePosition = (player, render) => {
	return {
		x: player.bodies[0].position.x - ((render.bounds.max.x - render.bounds.min.x)/2),
		y: player.bodies[0].position.y - ((render.bounds.max.y - render.bounds.min.y)/2)
	}
}

export const calculateBulletAngle = (player, render, reticlePos) => {
	if (player) {
		let playerPos = player.bodies[0].position
		let movingReticle = calcMovingReticlePosition(player, render)
		let targetAngle = Vector.angle(playerPos, {
			x: reticlePos.x + movingReticle.x,
			y: reticlePos.y + movingReticle.y
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

export const renderMouse = (player, lastDirection, render, mouse_point, reticlePos, domCursor) => { // called in the 'beforeTick' Engine event
	let movingReticle = calcMovingReticlePosition(player, render)
	mouse_point.position.x = reticlePos.x + movingReticle.x
	mouse_point.position.y = reticlePos.y + movingReticle.y
	domCursor.style.left = reticlePos.x + 'px'
	domCursor.style.top = reticlePos.y + 'px'
	if (mouse_point.position.x > player.bodies[1].position.x) { lastDirection = 'left' }
	else { lastDirection = 'right' }
}

export const toggleCrouch = (crouched, setCrouched, player, addSwappedBody, playerSwapBod, uncrouchBool) => {
	if (player) {
		let swapped
		let x = player.bodies[0].position.x
		let y = (
			player.onPlatform && player._currentPlatform
			? player._currentPlatform.bounds.min.y - 20
			: height - 40
		)
		if (!crouched) {
			swapped = addSwappedBody(playerSwapBod('short', player, x, y))
			setCrouched(swapped, true)
		}
		if (uncrouchBool) {
			swapped = addSwappedBody(playerSwapBod('normal', player, x, y))
			setCrouched(swapped, false)
		}
	}
}

export const renderPlayerMovementViaKeyInput = (world, render, keys, player, playerProps, ground, lastDirection, crouched, setCrouched, addSwappedBody, playerSwapBod) => {
	if (player) {
		let playerPos = player.bodies[0].position
		let playerHead = player.bodies[0]
		let playerBod = player.bodies[1]
		let playerShortHt = (playerBod.bounds.max.y - playerBod.bounds.min.y) + (playerHead.bounds.max.y - playerHead.bounds.min.y)
		let playerNormalHt = ((playerBod.bounds.max.y - playerBod.bounds.min.y)/2) + (playerHead.bounds.max.y - playerHead.bounds.min.y)
		// try to keep render view in-step with player character
		Render.lookAt(render, {
			min: {
				x: playerPos.x + width/2,
				y: (
					player.crouched
					? playerPos.y - playerNormalHt - height/2
					: playerPos.y - height/2
				)
			},
			max: {
				x: playerPos.x - width/2,
				y: (
						player.crouched
						? playerPos.y + playerNormalHt + height/2
						: playerPos.y + height/2
					)
			}
		})

		// math calculating size / pos of elms
		let playerHeight = (playerBod.bounds.max.y - playerBod.bounds.min.y)
		let groundHeight = (height - (ground.bounds.max.y - ground.bounds.min.y))
		groundHeight -= (ground.position.y - groundHeight)
		
		// jump key
		if (
				(keys[87] && player.ground) || (keys[87] && player.onPlatform)
			 ) {
				if (!crouched) {
					player.bodies[1].force = (
						lastDirection == 'left'
						?	{ x: -0.1, y: playerProps.jumpForce }
						: { x: 0.1, y: playerProps.jumpForce }
					)
				} else {
					toggleCrouch(crouched, setCrouched, player, addSwappedBody, playerSwapBod, true)
				}
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
				if (player.ground || player.onPlatform) {
					Composite.translate(player, { x: -playerProps.acceleration, y: 0 })
				} else {
					Composite.translate(player, { x: -playerProps.inAirMovementSpeed, y: 0 })
				}
			} else {
				if (keys[68]) {
					lastDirection = 'right'
					if (player.ground || player.onPlatform) {
						Composite.translate(player, { x: playerProps.acceleration, y: 0 })
					} else {
						Composite.translate(player, { x: playerProps.inAirMovementSpeed, y: 0 })
					}
				}
			}
	}
}
