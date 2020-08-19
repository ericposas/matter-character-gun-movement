import './index.scss'
import { width, height } from './config'
import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import { createPlayer, createEnemy } from './modules/Entities'
import { createGround } from './modules/Platforms'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './modules/CollisionFilterConstants'
import {
	HEAD_DAMAGE, BODY_DAMAGE
} from './modules/DamageConstants'
import {
	renderMouse,
	toggleCrouch,
	renderPlayerMovementViaKeyInput,
	calcMovingReticlePosition,
	positionEnemyAim
} from './modules/PlayerControls'
import {
	checkPlayerIsOnGroundBegin, checkPlayerIsOnGroundEnd,
	enemyBulletHittestBegin, enemyBulletHittestEnd,
	bulletGroundHittest,
	removeOutOfBoundsBullets, positionEnemyLifebar
} from './modules/CollisionMethods'


window.start = () => {

	let keys = []
	let crouched = false
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bullets = []
	let bulletForce = 0.015
	let bulletForceAngle = { x: 0, y: 0 }
	let bulletForceMultiplier = 6 // TIMES SIX!!
	let enemies = []

	let { world, render, engine } = boilerplate(width, height)
	world.bounds = {
		min: { x: 0, y: 0 },
		max: { x: width * 2, y: height * 1.5 },
	}

	let { player, playerProps, mouse_point, mouse_control, swapBod: playerSwapBod, addSwappedBody } = createPlayer(world, 'player', null, {x:50,y:0})
	let ground = createGround(world, width, height)
	// enemies are auto-added to the world in the createEnemy() method
	let enemy1 = createEnemy(enemies, bullets, player, world, null, { x: 250, y: 0 })
	let enemy2 = createEnemy(enemies, bullets, player, world, null, { x: 450, y: 0 })
	let enemy3 = createEnemy(enemies, bullets, player, world, null, { x: 1000, y: 0 })


	const registerDOMEventListeners = () => {
		// EVENT LISTENERS
		render.canvas.addEventListener('mousemove', e => {
			reticlePos = {
				x: e.clientX,
				y: e.clientY
			}
		})
		render.canvas.addEventListener('click', e => {
			let playerArm = player.bodies[3]
			let bullet = Bodies.circle(playerArm.position.x, playerArm.position.y, 6, {
				restitution: .5,
				collisionFilter: {
					category: BULLET | BOX
				}
			})
			bullet.label = 'bullet'
			World.add(world, bullet)
			bullets.push(bullet)
			Body.applyForce(bullet, bullet.position, calculateBulletAngle())
		})
		document.body.addEventListener("keydown", e => {
			keys[e.keyCode] = true
			// clever use of javascript closure to pass these variables to another function for setting
			const setCrouched = (swapped) => {
				crouched = !crouched;
				player = swapped.player // reassign player variable to the new swapped player
				playerProps = swapped.playerProps
				mouse_point = swapped.mouse_point
			}
			if (keys[83]) {
				toggleCrouch(crouched, setCrouched, player, addSwappedBody, playerSwapBod)
			}
		})
		document.body.addEventListener("keyup", e => { keys[e.keyCode] = false })

	}

	registerDOMEventListeners()

	const calculateBulletAngle = () => {
		let playerPos = player.bodies[0].position
		let targetAngle = Vector.angle(playerPos, {
			x: reticlePos.x + calcMovingReticlePosition(player, render),
			y: reticlePos.y
		})
		bulletForceAngle = {
			x: Math.cos(targetAngle) * bulletForce,
			y: Math.sin(targetAngle) * bulletForce
		}
		return bulletForceAngle
	}

	const removeOutOfBoundsBullets = () => {
		// remove out-of-bounds bullets
		for (let i = 0; i < bullets.length; ++i) {
			let bullet = bullets[i]
			if (bullet.position.x > world.bounds.max.x || bullet.position.x < 0 || bullet.position.y < 0 ) {
					World.remove(world, bullet)
					bullets = bullets.filter(b => b != bullet)
			}
		}
	}

	const checkCollisions = e => {
		// LOOP THROUGH ALL COLLISION TYPES
		for (let i = 0; i < e.pairs.length; ++i) {
			// CHECK IF PLAYER IS ON GROUND
			checkPlayerIsOnGroundBegin(e, i, player)
			// BULLET ENEMY HITTEST BEGIN
			enemyBulletHittestBegin(e, i, world, bulletForceAngle, bulletForceMultiplier)
			// BULLETS GROUND HITTEST -- REMOVE
			bulletGroundHittest(e, i, world)
		}
	}

	const checkCollisionsEnd = e => {
		for (let i = 0; i < e.pairs.length; ++i) {
			// SET PLAYER IS ON GROUND
			checkPlayerIsOnGroundEnd(e, i, player)
			// BULLET ENEMY HITTEST END
			enemyBulletHittestEnd(e, i, enemies, world, bulletForceAngle, bulletForceMultiplier)
		}
	}

	const renderEntities = () => {
		// keep enemy lifebar positions in-sync with enemies
		enemies.forEach((enemy, i) => {
			positionEnemyLifebar(enemy, render)
			positionEnemyAim(enemy, player)
			

		})

	}

	Events.on(engine, 'collisionStart', e => checkCollisions(e))
	// Events.on(engine, 'collisionActive', e => checkCollisions(e))
	Events.on(engine, 'collisionEnd', e => checkCollisionsEnd(e))
	Events.on(engine, 'beforeTick', e => {

		renderMouse(player, lastDirection, render, mouse_point, reticlePos) // renderMouse() will draw the white line if it is in the requestAnimationFrame() loop

		renderEntities()

		removeOutOfBoundsBullets()

		renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)

	})

}
