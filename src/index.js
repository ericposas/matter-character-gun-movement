import './index.scss'
import random from 'random'
// import { TweenLite, Power1 } from 'gsap'
import { width, height } from './config'
import { Bodies, Body, World, Constraint, Composite, Composites, Events,
	Vector, Render } from 'matter-js'
import { matterBoilerplate as boilerplate } from './modules/MatterBoilerplate'
import { createPlayer, createEnemy } from './modules/Entities'
import { createGround } from './modules/Platforms'
import { GROUND, BULLET, BOX, PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY } from './modules/constants/CollisionFilterConstants'
import { BULLET_REMOVAL_TIMEOUT } from './modules/constants/GameConstants'
import { renderMouse, toggleCrouch, renderPlayerMovementViaKeyInput,
	calcMovingReticlePosition, calculateBulletAngle } from './modules/PlayerControls'
import { positionEnemyLifebar, positionEnemyAim } from './modules/EnemyControls'
import { checkPlayerIsOnGroundBegin, checkPlayerIsOnGroundEnd, enemyBulletHittestBegin,
	enemyBulletHittestEnd, ragdollBulletHittestBegin, ragdollBulletHittestEnd,
	bulletGroundHittest, playerBulletHittestBegin, playerBulletHittestEnd,
	removeOutOfBoundsBullets, removeOutOfBoundsEnemies, removeOutOfBoundsRagdolls,
	removeOutOfBoundsPlayer, checkEnemiesAreOnGround
} from './modules/GameTickMethods'
import { GAMEPLAY, MENU, GAME_OVER, WAVE_WON } from './modules/constants/GameStates'
import { UPDATE_ENEMY_COUNT, UpdateEnemyCount, DECREMENT_ENEMY_KILL_COUNT,
	UPDATE_WAVE, UpdateWave } from './modules/events/EventTypes'


window.start = () => {
	// Game world variables
	let gameState = ''
	let currentLevel = 0
	let keys = []
	let enemies = [] // composites
	let bullets = [] // bodies
	let ragdolls = [] // composites
	let enemiesToBeSpawned = [] // composites
	let enemyCountDOM = document.getElementById('enemy-count')
	let enemiesToKillInWave, startWave = false
	let waveLevelDOM = document.getElementById('wave-count')
	let waveWon = document.getElementById('wave-won-msg'), waveWonTweenOut = null
	let tryAgainBtn = document.getElementById('try-again-button')
	let gameover = document.getElementById('game-over-screen')
	let crouched = false
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let ground
	// generate Matter world
	let { world, render, engine } = boilerplate()
	let playerObjects
	let player, playerProps, mouse_point, mouse_control, playerSwapBod, addSwappedBody

	registerEventListeners()

	changeGameState(MENU)

	const setEnemyWaveCountCheck = n => { enemyWaveCount = n; checkEnemyWaveCount = true; }

	function changeGameState(state) {
		gameState = state
		if (gameState === MENU) {
			// build a temporary game menu, or just show/hide an html block
			let startBtn = document.getElementById('menu-button')
			document.getElementById('menu').style.display = 'block'
			startBtn.style.left = (width/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('width'))/2) + 'px'
			startBtn.style.top = (height/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('height'))/2) + 'px'
			function startGame(e) {
				changeLevel()
				changeGameState(GAMEPLAY)
				document.getElementById('menu').style.display = 'none'
			}
			if (!startBtn.clickListenerHasBeenSet) {
				startBtn.addEventListener('click', startGame)
				startBtn.clickListenerHasBeenSet = true
			}
		}
		if (gameState === GAMEPLAY) {
			createGameObjects()
			buildLevel()
		}
		if (gameState === GAME_OVER) {
			if (waveWonTweenOut) { waveWonTweenOut.kill() }
			waveWon.style.display = 'none'
			gameover.style.display = 'block'
			tryAgainBtn.style.display = 'block'
			TweenLite.set(gameover, { left: 0, alpha: 1 })
			TweenLite.from(gameover, 1, { left: -200, alpha: 0 })
			function playAgain(e) {
				changeGameState(GAMEPLAY)
				tryAgainBtn.style.display = 'none'
				gameover.style.display = 'none'
			}
			if (!tryAgainBtn.clickListenerHasBeenSet) {
				tryAgainBtn.addEventListener('click', playAgain)
				tryAgainBtn.clickListenerHasBeenSet = true
			}
		}
	}

	function changeLevel(lvl) {
		if (currentLevel === 0) { currentLevel = 1 }
		else if (!lvl) { currentLevel = currentLevel }
		else { currentLevel = lvl }
	}

	function displayPlayerLifeBar(str) {
		document.getElementById('player-lifebar').style.display = str
		document.getElementById('player-lifebar-inner').style.cssText = "top:2px;left: 2px;width:756px;height:16px;position:relative;background-color:green;"
	}

	function createGameObjects() {
		if (checkGameEntitiesReady() == false) {
			console.log('createGameObjects')
			ground = createGround(world, width, height)
			playerObjects = createPlayer(world, 'player', null, { x:50, y:0 })
			player = playerObjects.player
			playerProps = playerObjects.playerProps
			mouse_point = playerObjects.mouse_point
			mouse_control = playerObjects.mouse_control
			addSwappedBody = playerObjects.addSwappedBody
			playerSwapBod = playerObjects.swapBod
			displayPlayerLifeBar('block')
		}
	}

	function destroyGameObjects() {
		if (checkGameEntitiesReady()) {
			console.log('destroyGameObjects')
			if (player && ground) {
				World.remove(world, [player, ground])
			}
			let en = []
			enemies.forEach(enemy => {
				enemy.stopShooting(enemies)
				enemy.removeLifebar()
				if (enemy) {
					World.remove(world, enemy)
					enemy = null
				}
			})
			bullets.forEach(bullet => {
				if (bullet) {
					World.remove(world, bullet)
					bullet = null
				}
			})
			ragdolls.forEach(ragdoll => {
				if (ragdoll) {
					World.remove(world, ragdoll)
					ragdoll = null
				}
			})
			keys = []
			enemies = []
			bullets = []
			ragdolls = []
			ground = null
			player = null
			playerProps = null
			mouse_point = null
			mouse_control = null
			addSwappedBody = null
			playerSwapBod = null
			destroyEnemiesToBeSpawned()
			displayPlayerLifeBar('none')
		}
	}

	function spawnEnemies(n, rate) {
		if (checkGameEntitiesReady()) {
			console.log('spawning enemies')
			let i
			for (i = 0; i < n; ++i) {
				let timeout = setTimeout(() => {
					// window.dispatchEvent(UpdateEnemyCount)
					createEnemy(
						enemies, bullets, ragdolls, player, world, null,
						{ x: random.int(50, ground.bounds.max.x - 50), y: 0 },
						// enemies references this index.js scope
						// we pass a function that will allow the enemy function to access
						// the index.js scope or 'context'
						(newEnemyBody, enemy) => { enemies[enemies.indexOf(enemy)] = newEnemyBody }
					)
				}, (rate * i))
				enemiesToBeSpawned.push(timeout)
			}
			enemiesToKillInWave = n
			startWave = true
		}
	}
	function destroyEnemiesToBeSpawned() {
		enemiesToBeSpawned.forEach(timeout => {
			clearTimeout(timeout)
			console.log('timeout should clear')
		})
		enemiesToBeSpawned = []
		console.log(enemies, enemiesToBeSpawned)
	}

	const buildLevel = () => {
		console.log('building level..')
		dispatchEvent(UpdateWave)

		if (currentLevel == 1) {
			spawnEnemies(5, 1000)

		}
		if (currentLevel == 2) {
			spawnEnemies(10, 1000)
		}
		if (currentLevel == 3) {
			spawnEnemies(15, 1000)
		}

	}

	function registerEventListeners() {
		// EVENT LISTENERS
		addEventListener(UPDATE_WAVE, e => {
			waveLevelDOM.innerHTML = `wave: ${currentLevel}`
		})

		addEventListener(DECREMENT_ENEMY_KILL_COUNT, e => {
			enemiesToKillInWave -= 1
			console.log(enemiesToKillInWave)
			if (enemiesToKillInWave == 0) {
				waveWon.style.display = 'block'
				TweenLite.set(waveWon, { left: 0, alpha: 1 })
				TweenLite.from(waveWon, 1, { left: -400 })
				TweenLite.delayedCall(3, () => {
					waveWonTweenOut = TweenLite.to(waveWon, 1, {
						alpha: 0,
						ease: Power1.easeIn,
						onComplete: () => {
							changeLevel((currentLevel+1))
							buildLevel()
						}
					})
				})
			}
		})

		addEventListener(UPDATE_ENEMY_COUNT, e => {
			// if (startWave) {
			// console.log('enemies array length', enemies.length)
			// let enemyLen = enemies.length
			enemyCountDOM.innerHTML = `enemies left: ${enemiesToKillInWave}`
			// }
		})

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
					if (idx > -1) {
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
				bulletGroundHittest(e, i, world, bullets)
				checkPlayerIsOnGroundBegin(e, i, player)
				checkEnemiesAreOnGround(e, i, enemies)
				enemyBulletHittestBegin(e, i, world, calculateBulletAngle(player, render, reticlePos), bullets)
				playerBulletHittestBegin(e, i, world, calculateBulletAngle(player, render, reticlePos), bullets)
				ragdollBulletHittestBegin(e, i, world, calculateBulletAngle(player, render, reticlePos), bullets)
			}
		}
	}
	
	const checkCollisionsEnd = e => {
		if (gameState == GAMEPLAY && checkGameEntitiesReady()) {
			for (let i = 0; i < e.pairs.length; ++i) {
				// LOOP THROUGH ALL COLLISION TYPES
				checkPlayerIsOnGroundEnd(e, i, player)
				enemyBulletHittestEnd(e, i, player, enemies, world, ragdolls, calculateBulletAngle(player, render, reticlePos))
				ragdollBulletHittestEnd(e, i, player, ragdolls, world)
				playerBulletHittestEnd(e, i, player, world, destroyGameObjects, changeGameState)
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
			removeOutOfBoundsEnemies(world, enemies)
			removeOutOfBoundsRagdolls(world, ragdolls)
			removeOutOfBoundsPlayer(player, world, destroyGameObjects, changeGameState)
			renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)
		}
	}

	Events.on(engine, 'collisionStart', checkCollisions)
	Events.on(engine, 'collisionEnd', checkCollisionsEnd)
	Events.on(engine, 'beforeTick', gameTick)

}
