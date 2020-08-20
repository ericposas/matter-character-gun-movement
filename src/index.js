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
import { BULLET_REMOVAL_TIMEOUT } from './modules/GameConstants'
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
	let gameState = ''
	let keys = []
	let enemies = [], bullets = []
	let crouched = false
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bulletForceAngle = { x: 0, y: 0 }
	let ground
	// generate Matter world and player entity
	let { world, render, engine } = boilerplate(width, height)
	let player, playerProps, mouse_point, mouse_control, playerSwapBod, addSwappedBody

	changeGameState('menu')

	function changeGameState (state) {
		gameState = state
		if (gameState == 'menu') {
			// build a temporary game menu, or just show/hide an html block
			let startBtn = document.getElementById('menu-button')
			document.getElementById('menu').style.display = 'block'
			startBtn.style.left = (width/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('width'))/2) + 'px'
			startBtn.style.top = (height/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('height'))/2) + 'px'
			startBtn.addEventListener('click', startGame)
			function startGame(e) {
				changeGameState('gameplay')
				startBtn.style.display = 'none'
				startBtn.removeEventListener('click', startGame)
			}
		}
		if (gameState == 'gameplay') {
			buildLevel(1)
			registerEventListeners()
		}
	}

	const buildLevel = lvl => {
		if (lvl == 1) {
			let playerObj = createPlayer(world, 'player', null, { x:50, y:0 })
			player = playerObj.player
			playerProps = playerObj.playerProps
			mouse_point = playerObj.mouse_point
			mouse_control = playerObj.mouse_control
			addSwappedBody = playerObj.addSwappedBody
			playerSwapBod = playerObj.swapBod
			ground = createGround(world, width, height)
			let enemy1 = createEnemy(enemies, bullets, player, world, null, { x: 250, y: 0 })
			let enemy2 = createEnemy(enemies, bullets, player, world, null, { x: 450, y: 0 })
			let enemy3 = createEnemy(enemies, bullets, player, world, null, { x: 1000, y: 0 })
		}
	}

	const registerEventListeners = () => {
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
			Body.applyForce(bullet, bullet.position, calculateBulletAngle(player, render, reticlePos))
			// set time to remove bullet automatically
			setTimeout(() => {
				let idx = bullets.indexOf(bullet)
				if (idx) {
					World.remove(world, bullet)
					bullets.splice(idx, 1)
				}
			}, BULLET_REMOVAL_TIMEOUT)
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

	const checkGameEntitiesReady = () => {
		if (player && playerProps && mouse_point && mouse_control && ground) {
			return true
		} else {
			return false
		}
	}

	const checkCollisions = e => {
		if (gameState == 'gameplay') {
			// LOOP THROUGH ALL COLLISION TYPES
			for (let i = 0; i < e.pairs.length; ++i) {
				checkPlayerIsOnGroundBegin(e, i, player)
				enemyBulletHittestBegin(e, i, world, bulletForceAngle, bullets)
				bulletGroundHittest(e, i, world, bullets)
			}
		}
	}

	const checkCollisionsEnd = e => {
		if (gameState == 'gameplay') {
			for (let i = 0; i < e.pairs.length; ++i) {
				// LOOP THROUGH ALL COLLISION TYPES
				checkPlayerIsOnGroundEnd(e, i, player)
				enemyBulletHittestEnd(e, i, player, enemies, world, bullets)
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
			if (checkGameEntitiesReady() === true) {
				renderMouse(player, lastDirection, render, mouse_point, reticlePos)
				renderEntities()
				removeOutOfBoundsBullets(world, bullets)
				renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
			}
		}
	}

	Events.on(engine, 'collisionStart', checkCollisions)
	Events.on(engine, 'collisionEnd', checkCollisionsEnd)
	Events.on(engine, 'beforeTick', gameTick)

	// buildLevel(1)
	// registerEventListeners()

}
