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
import { GAMEPLAY, MENU } from './modules/GameStates'


window.start = () => {
	// Game world variables
	let gameState = ''
	let currentLevel = 0
	let keys = []
	let enemies = [], bullets = []
	let crouched = false
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bulletForceAngle = { x: 0, y: 0 }
	let ground
	// generate Matter world
	let { world, render, engine } = boilerplate(width, height)
	let playerObjects
	let player, playerProps, mouse_point, mouse_control, playerSwapBod, addSwappedBody

	registerEventListeners()

	changeGameState('menu')

	function changeGameState(state) {
		gameState = state
		if (gameState === MENU) {
			// build a temporary game menu, or just show/hide an html block
			let startBtn = document.getElementById('menu-button')
			document.getElementById('menu').style.display = 'block'
			startBtn.style.left = (width/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('width'))/2) + 'px'
			startBtn.style.top = (height/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('height'))/2) + 'px'
			startBtn.addEventListener('click', startGame)
			function startGame(e) {
				changeLevel()
				changeGameState('gameplay')
				startBtn.style.display = 'none'
				startBtn.removeEventListener('click', startGame)
			}
		}
		if (gameState == 'gameplay') {
			buildLevel()
		}
	}

	function changeLevel(lvl) {
		if (currentLevel === 0) { currentLevel = 1 }
		else { currentLevel = lvl }
	}

	function createGameObjects() {
		playerObjects = createPlayer(world, 'player', null, { x:50, y:0 })
		player = playerObjects.player
		playerProps = playerObjects.playerProps
		mouse_point = playerObjects.mouse_point
		mouse_control = playerObjects.mouse_control
		addSwappedBody = playerObjects.addSwappedBody
		playerSwapBod = playerObjects.swapBod
	}

	function destroyGameObjects() {
		World.remove(world, [player, ground])
		let en = []
		enemies.forEach(enemy => {
			enemy.stopShooting(enemies)
			enemy.removeLifebar()
			World.remove(world, enemy)
		})
		enemies = []
		ground = null
		player = null
		playerProps = null
		mouse_point = null
		mouse_control = null
		addSwappedBody = null
		playerSwapBod = null
	}

	const buildLevel = () => {
		if (currentLevel == 1) {
			createGameObjects()
			ground = createGround(world, width, height)
			createEnemy(enemies, bullets, player, world, null, { x: 250, y: 0 })
			createEnemy(enemies, bullets, player, world, null, { x: 450, y: 0 })
			createEnemy(enemies, bullets, player, world, null, { x: 1000, y: 0 })
			// destroyGameObjects()
			// changeLevel(2)
			// buildLevel()
		}
		if (currentLevel == 2) {
			createGameObjects()
			ground = createGround(world, width, height)
			for (let i = 0; i < 10; ++i) {
				createEnemy(enemies, bullets, player, world, null, { x: 150 * i, y: 0 })
			}
			// destroyGameObjects()
			// changeLevel(1)
		}
	}

	function registerEventListeners() {
		// EVENT LISTENERS
		render.canvas.addEventListener('mousemove', e => {
			if (gameState === GAMEPLAY) {
				reticlePos = {
					x: e.clientX,
					y: e.clientY
				}
			}
		})
		render.canvas.addEventListener('click', e => {
			if (gameState === GAMEPLAY && checkGameEntitiesReady()) {
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
			}
		})
		document.body.addEventListener('keydown', e => {
			if (gameState === GAMEPLAY) {
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
			}
		})
		document.body.addEventListener('keyup', e => {
			if (gameState === GAMEPLAY) {
				keys[e.keyCode] = false
			}
		})
	}

	const checkGameEntitiesReady = () => {
		if (player && playerProps && mouse_point && mouse_control && ground) { return true }
		else { return false }
	}

	const checkCollisions = e => {
		if (gameState == GAMEPLAY && checkGameEntitiesReady()) {
			// LOOP THROUGH ALL COLLISION TYPES
			for (let i = 0; i < e.pairs.length; ++i) {
				checkPlayerIsOnGroundBegin(e, i, player)
				enemyBulletHittestBegin(e, i, world, bulletForceAngle, bullets)
				bulletGroundHittest(e, i, world, bullets)
			}
		}
	}

	const checkCollisionsEnd = e => {
		if (gameState == GAMEPLAY && checkGameEntitiesReady()) {
			for (let i = 0; i < e.pairs.length; ++i) {
				// LOOP THROUGH ALL COLLISION TYPES
				checkPlayerIsOnGroundEnd(e, i, player)
				enemyBulletHittestEnd(e, i, player, enemies, world, bullets)
			}
		}
	}

	const renderEntities = () => {
		if (gameState == GAMEPLAY) {
			// keep enemy lifebar positions in-sync with enemies
			enemies.forEach((enemy, i) => {
				positionEnemyLifebar(enemy, render)
				positionEnemyAim(enemy, player)

			})
		}
	}

	const gameTick = e => {
		if (gameState == GAMEPLAY && checkGameEntitiesReady()) {
			renderMouse(player, lastDirection, render, mouse_point, reticlePos)
			renderEntities()
			removeOutOfBoundsBullets(world, bullets)
			renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
		}
	}

	Events.on(engine, 'collisionStart', checkCollisions)
	Events.on(engine, 'collisionEnd', checkCollisionsEnd)
	Events.on(engine, 'beforeTick', gameTick)

	// buildLevel(1)
	// registerEventListeners()

}
