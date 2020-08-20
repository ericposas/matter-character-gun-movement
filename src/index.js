import './index.scss'
import { width, height } from './config'
import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
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
	// Game world variables
	let gameState = 'menu'
	let keys = []
	let crouched = false
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bullets = []
	let bulletForce = 0.015
	let bulletForceAngle = { x: 0, y: 0 }
	let bulletImpact = 0.05 // force on ragdoll death
	let bulletForceMultiplier = 6 // TIMES SIX!!
	let enemies = []
	let ground
	// generate Matter world and player entity
	let { world, render, engine } = boilerplate(width, height)
	let { player, playerProps, mouse_point, mouse_control, swapBod: playerSwapBod, addSwappedBody } = createPlayer(world, 'player', null, {x:50,y:0})

	const changeGameState = state => {
		switch (state) {
			case 'gameplay':
				gameState = state
				registerEventListeners()
				break;
			default:
				gameState = state
		}
	}

	const buildLevel = lvl => {
		if (lvl == 1) {
			ground = createGround(world, width, height)
			let enemy1 = createEnemy(enemies, bullets, player, world, null, { x: 250, y: 0 })
			let enemy2 = createEnemy(enemies, bullets, player, world, null, { x: 450, y: 0 })
			let enemy3 = createEnemy(enemies, bullets, player, world, null, { x: 1000, y: 0 })
			// we are adding entities to the world explicitly here instead of in the create methods above
			World.add(world, [
				ground,
				player,
				enemy1,
				enemy2,
				enemy3
			])

			changeGameState('gameplay')
		}
	}

	const registerEventListeners = () => {
		// EVENT LISTENERS
		render.canvas.addEventListener('mousemove', e => {
			reticlePos = {
				x: e.clientX,
				y: e.clientY
			}
			// create a DOM crosshair
			// if (!document.getElementById('game-crosshair')) {
			// 	let crosshair = document.createElement('div')
			// 	crosshair.id = 'game-crosshair'
			// 	let cvert = document.createElement('div')
			// 	cvert.id = 'game-crosshair-vertical'
			// 	let choriz = document.createElement('div')
			// 	choriz.id = 'game-crosshair-horizontal'
			// 	crosshair.appendChild(cvert)
			// 	crosshair.appendChild(choriz)
			// 	document.body.appendChild(crosshair)
			// } else {
			// 	let crosshair = document.getElementById('game-crosshair')
			// 	crosshair.style.left = e.clientX + 'px'
			// 	crosshair.style.top = e.clientY + 'px'
			// }
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
			Body.applyForce(bullet, bullet.position, calculateBulletAngle(player, render, reticlePos, bulletForce))
		})
		document.body.addEventListener('keydown', e => {
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
		document.body.addEventListener('keyup', e => { keys[e.keyCode] = false })
	}

	const checkCollisions = e => {
		if (gameState == 'gameplay') {
			// LOOP THROUGH ALL COLLISION TYPES
			for (let i = 0; i < e.pairs.length; ++i) {
				checkPlayerIsOnGroundBegin(e, i, player)
				enemyBulletHittestBegin(e, i, world, bulletForceAngle, bulletForceMultiplier)
				bulletGroundHittest(e, i, world)
			}
		}
	}

	const checkCollisionsEnd = e => {
		if (gameState == 'gameplay') {
			for (let i = 0; i < e.pairs.length; ++i) {
				// LOOP THROUGH ALL COLLISION TYPES
				checkPlayerIsOnGroundEnd(e, i, player)
				enemyBulletHittestEnd(e, i, player, enemies, world, bulletImpact)
			}
		}
	}

	const renderEntities = () => {
		if (gameState == 'gameplay') {
			// keep enemy lifebar positions in-sync with enemies
			enemies.forEach((enemy, i) => {
				positionEnemyLifebar(enemy, render)
				positionEnemyAim(enemy, player)

			})
		}
	}

	const gameTick = e => {
		if (gameState == 'gameplay') {
			renderMouse(player, lastDirection, render, mouse_point, reticlePos)
			renderEntities()
			removeOutOfBoundsBullets(world, bullets)
			renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
		}
	}

	Events.on(engine, 'collisionStart', checkCollisions)
	Events.on(engine, 'collisionEnd', checkCollisionsEnd)
	Events.on(engine, 'beforeTick', gameTick)

	buildLevel(1)
	// registerEventListeners()

}
