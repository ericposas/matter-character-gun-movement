import './index.scss'
import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
import { width, height } from './config'
import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import { createPlayer, createEnemy, makeStacks } from './modules/Abstractions'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './modules/CollisionFilterConstants'
import {
	HEAD_DAMAGE, BODY_DAMAGE
} from './modules/DamageConstants'
import { createRagdoll } from './modules/Ragdoll'
import { renderPlayerMovementViaKeyInput } from './modules/GameLoopMethods'


window.start = () => {

	let { world, render, engine } = boilerplate(width, height)
	world.bounds = {
		min: { x: 0, y: 0 },
		max: { x: width * 2, y: height * 1.5 },
	}
	// console.log(world.bounds)

	let ground = Bodies.rectangle(width, height, width * 2, 100, {
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	ground.label = 'ground'

	let { player, playerProps, mouse_point, mouse_control } = createPlayer(world, 'player', null, {x:50,y:0})
	let { stacks: { stack1, stack2, stack3, stack4, stack5 } } = makeStacks()
	let enemies = []
	// enemies are added to the world in the createEnemy() method
	let enemy1 = createEnemy(enemies, world, null, { x: 250, y: 0 })
	let enemy2 = createEnemy(enemies, world, null, { x: 450, y: 0 })
	let enemy3 = createEnemy(enemies, world, null, { x: 1000, y: 0 })

	World.add(world, [
		ground,

	])

	let keys = []
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bullets = [],
	bulletForce = 0.0075,
	bulletForceAngle = { x: 0, y: 0 },
	bulletForceMultiplier = 10

	const calcMovingReticlePosition = () => {
		return player.bodies[0].position.x + ((render.bounds.min.x - render.bounds.max.x)/2)
	}

	const renderMouse = () => {
		// requestAnimationFrame(renderMouse)
		mouse_point.position.x = reticlePos.x + calcMovingReticlePosition()
		mouse_point.position.y = reticlePos.y
		if (mouse_point.position.x > player.bodies[1].position.x) {
			lastDirection = 'left'
		} else {
			lastDirection = 'right'
		}
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

	renderMouse()

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
	})
	document.body.addEventListener("keyup", e => {
  	keys[e.keyCode] = false
	})

	// ENGINE EVENTS
	// const checkGround = (event, bool) => {
	// 	var pairs = event.pairs
	// 	for (var i = 0, j = pairs.length; i != j; ++i) {
	// 		var pair = pairs[i]
	// 		if (pair.bodyA === player.bodies[1]) {
	// 			player.ground = bool
	// 		} else if (pair.bodyB === player.bodies[1]) {
	// 			player.ground = bool
	// 		}
	// 	}
	// }

	// const checkBulletCollisionGroundRemove = e => {
	// 	for (let i = 0; i < e.pairs.length; ++i) {
	// 		if (e.pairs[i].bodyA.label === 'bullet' && e.pairs[i].bodyB.label === 'ground') {
	// 			World.remove(world, e.pairs[i].bodyA)
	// 		} else if (e.pairs[i].bodyB.label === 'bullet' && e.pairs[i].bodyA.label === 'ground') {
	// 			World.remove(world, e.pairs[i].bodyB)
	// 		}
	// 	}
	// }

	const damageEnemy = (enemy, dmg) => {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		let lifeBar = enemy._lifebar
		if (lifeAmt < dmg) {
			lifeAmt = 0
		} else {
			lifeAmt -= dmg
		}
		lifeBar.style.width = lifeAmt + 'px'
	}

	let lastRagAdded = null
	const killEnemy = (enemy) => {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		if (lifeAmt <= 0) {
			// add a ragdoll in place of enemy character! xxx
			let ragdoll = createRagdoll(world, 1)
			Composite.translate(ragdoll, { x: enemy.position.x, y: enemy.position.y - 100 })
			Body.applyForce(ragdoll.bodies[0], ragdoll.bodies[0].position, { x: bulletForceAngle.x * bulletForceMultiplier, y: bulletForceAngle.y * bulletForceMultiplier })
			World.remove(world, enemy._composite)
			if (enemy._outerLifebar) {
				document.body.removeChild(enemy._outerLifebar)
			}
		}
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

	const positionEnemyLifebar = enemy => {
		let lifebar = enemy.bodies[0]._outerLifebar
		let headHt = enemy.bodies[0].bounds.max.y - enemy.bodies[0].bounds.min.y
		lifebar.style.left = enemy.bodies[0].position.x - (enemy.bodies[0]._barsize.w/2) - render.bounds.min.x + 'px'
		lifebar.style.top = enemy.bodies[0].position.y - headHt - enemy.bodies[0]._barsize.h - render.bounds.min.y + 'px'
	}

	const checkPlayerIsOnGroundBegin = (e, i) => {
		if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
			player.ground = true
		} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
			player.ground = true
		}
	}

	const enemyBulletHittestBegin = (e, i) => {
		if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
			let enemy = e.pairs[i].bodyA
			enemy.label.indexOf('head') > -1 ? damageEnemy(enemy, HEAD_DAMAGE) : damageEnemy(enemy, BODY_DAMAGE)
			let bullet = e.pairs[i].bodyB
			World.remove(world, bullet)
		} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
			let enemy = e.pairs[i].bodyB
			enemy.label.indexOf('head') > -1 ? damageEnemy(enemy, HEAD_DAMAGE) : damageEnemy(enemy, BODY_DAMAGE)
			let bullet = e.pairs[i].bodyA
			World.remove(world, bullet)
		}
	}

	const bulletGroundHittest = (e, i) => {
		if (e.pairs[i].bodyA.label === 'bullet' && e.pairs[i].bodyB.label === 'ground') {
			World.remove(world, e.pairs[i].bodyA)
		} else if (e.pairs[i].bodyB.label === 'bullet' && e.pairs[i].bodyA.label === 'ground') {
			World.remove(world, e.pairs[i].bodyB)
		}
	}

	// for performance, we may need to check all collision types in one function
	// instead of running separate loops for all collision types
	const checkCollisions = e => {
		// LOOP THROUGH ALL COLLISION TYPES
		for (let i = 0; i < e.pairs.length; ++i) {
			// CHECK IF PLAYER IS ON GROUND
			checkPlayerIsOnGroundBegin(e, i)
			// BULLET ENEMY HITTEST BEGIN
			enemyBulletHittestBegin(e, i)
			// BULLETS GROUND HITTEST -- REMOVE
			bulletGroundHittest(e, i)
		}
	}

	const checkPlayerIsOnGroundEnd = (e, i) => {
		if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
			player.ground = false
		} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
			player.ground = false
		}
	}

	const enemyBulletHittestEnd = (e, i) => {
		if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
			let enemy = e.pairs[i].bodyA
			World.remove(world, enemy)
			killEnemy(enemy)
		} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
			let enemy = e.pairs[i].bodyB
			World.remove(world, enemy)
			killEnemy(enemy)
		}
	}

	const checkCollisionsEnd = e => {
		for (let i = 0; i < e.pairs.length; ++i) {
			// SET PLAYER IS ON GROUND
			checkPlayerIsOnGroundEnd(e, i)
			// BULLET ENEMY HITTEST END
			enemyBulletHittestEnd(e, i)
		}
	}

	const renderEntities = () => {
		// keep enemy lifebar positions in-sync with enemies
		enemies.forEach((enemy, i) => positionEnemyLifebar(enemy))

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
