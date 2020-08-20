import './index.scss'
import { width, height } from './config'
import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
// import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import { matterBoilerplate as boilerplate } from './modules/MatterBoilerplate'
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
	calculateBulletAngle,
	positionEnemyAim,
	removeOutOfBoundsBullets,
} from './modules/PlayerControls'
import {
	checkPlayerIsOnGroundBegin, checkPlayerIsOnGroundEnd,
	enemyBulletHittestBegin, enemyBulletHittestEnd,
	bulletGroundHittest,
	positionEnemyLifebar
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
			Body.applyForce(bullet, bullet.position, calculateBulletAngle(player, render, reticlePos, bulletForce, bulletForceAngle))
		})
		document.body.addEventListener("keydown", e => {
			keys[e.keyCode] = true
			// clever use of javascript closure to pass these variables to another function for setting
			const setCrouched = (swapped) => {
				crouched = !crouched;
				player = swapped.player // reassign player variable to the new swapped player
				playerProps = swapped.playerProps
				let mx = mouse_point.position.x
				let my = mouse_point.position.y
				mouse_point = swapped.mouse_point
				mouse_point.position.x = mx
				mouse_point.position.y = my
			}
			if (keys[83]) {
				toggleCrouch(crouched, setCrouched, player, addSwappedBody, playerSwapBod)
			}
		})
		document.body.addEventListener("keyup", e => { keys[e.keyCode] = false })

	}

	registerDOMEventListeners()


	const checkCollisions = e => {
		// LOOP THROUGH ALL COLLISION TYPES
		for (let i = 0; i < e.pairs.length; ++i) {
			checkPlayerIsOnGroundBegin(e, i, player)
			enemyBulletHittestBegin(e, i, world, bulletForceAngle, bulletForceMultiplier)
			bulletGroundHittest(e, i, world)
		}
	}

	const checkCollisionsEnd = e => {
		for (let i = 0; i < e.pairs.length; ++i) {
			// LOOP THROUGH ALL COLLISION TYPES
			checkPlayerIsOnGroundEnd(e, i, player)
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
	
	const gameTick = e => {
		// renderMouse() will draw the white line if it is in the requestAnimationFrame() loop
		renderMouse(player, lastDirection, render, mouse_point, reticlePos)
		renderEntities()
		removeOutOfBoundsBullets(world, bullets)
		renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
	}

	Events.on(engine, 'collisionStart', checkCollisions)
	Events.on(engine, 'collisionEnd', checkCollisionsEnd)
	Events.on(engine, 'beforeTick', gameTick)

}
