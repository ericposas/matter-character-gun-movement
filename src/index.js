import './index.scss'
import { width, height } from './config'
import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import { createPlayer, createEnemy } from './modules/Entities'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './modules/CollisionFilterConstants'
import {
	HEAD_DAMAGE, BODY_DAMAGE
} from './modules/DamageConstants'
import { renderPlayerMovementViaKeyInput } from './modules/GameLoopMethods'
import {
	checkPlayerIsOnGroundBegin, checkPlayerIsOnGroundEnd,
	enemyBulletHittestBegin, enemyBulletHittestEnd,
	bulletGroundHittest,
	removeOutOfBoundsBullets, positionEnemyLifebar
} from './modules/CollisionMethods'
// import { getAngleBetweenTwoPoints } from './modules/Utilities'


window.start = () => {

	let keys = []
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
	let { player, playerProps, mouse_point, mouse_control } = createPlayer(world, 'player', null, {x:50,y:0})
	let ground = Bodies.rectangle(width, height, width * 2, 100, {
		label: 'ground',
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	// enemies are auto-added to the world in the createEnemy() method
	let enemy1 = createEnemy(enemies, bullets, player, world, null, { x: 250, y: 0 })
	let enemy2 = createEnemy(enemies, bullets, player, world, null, { x: 450, y: 0 })
	let enemy3 = createEnemy(enemies, bullets, player, world, null, { x: 1000, y: 0 })

	World.add(world, [
		ground
	])

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
		document.body.addEventListener("keydown", e => { keys[e.keyCode] = true })
		document.body.addEventListener("keyup", e => { keys[e.keyCode] = false })

	}

	registerDOMEventListeners()

	const calcMovingReticlePosition = () => {
		return player.bodies[0].position.x + ((render.bounds.min.x - render.bounds.max.x)/2)
	}

	const renderMouse = () => {
		// requestAnimationFrame(renderMouse)
		mouse_point.position.x = reticlePos.x + calcMovingReticlePosition()
		mouse_point.position.y = reticlePos.y
		if (mouse_point.position.x > player.bodies[1].position.x) { lastDirection = 'left' }
		else { lastDirection = 'right' }
	}

	const calculateBulletAngle = () => {
		let playerPos = player.bodies[0].position
		let targetAngle = Vector.angle(playerPos, {
			x: reticlePos.x + calcMovingReticlePosition(),
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

	const positionEnemyAim = enemy => {
		let arm = enemy.bodies[2],
		plHeadHeight = player.bodies[1].bounds.max.y - player.bodies[1].bounds.min.y
		let playerPos = {
			x: player.bodies[0].position.x,
			y: player.bodies[0].position.y - (plHeadHeight * 2)
		}
		let armAngle = Vector.angle(arm.position, playerPos)
		Body.setAngle(arm, armAngle)
	}

	const renderEntities = () => {
		// keep enemy lifebar positions in-sync with enemies
		enemies.forEach((enemy, i) => {
			positionEnemyLifebar(enemy, render)
			positionEnemyAim(enemy)

		})

	}

	Events.on(engine, 'collisionStart', e => checkCollisions(e))
	// Events.on(engine, 'collisionActive', e => checkCollisions(e))
	Events.on(engine, 'collisionEnd', e => checkCollisionsEnd(e))
	Events.on(engine, 'beforeTick', e => {

		renderMouse() // renderMouse() will draw the white line if it is in the requestAnimationFrame() loop

		renderEntities()

		removeOutOfBoundsBullets()

		renderPlayerMovementViaKeyInput(render, keys, player, playerProps, ground, lastDirection)

	})

}
