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
	let enemy1 = createEnemy(enemies, world, null, { x: 250, y: 0 })
	let enemy2 = createEnemy(enemies, world, null, { x: 450, y: 0 })
	
	World.add(world, [
		ground
	])

	let keys = []
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bullets = [], bulletForce = 0.0075

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
		return {
			x: Math.cos(targetAngle) * bulletForce,
			y: Math.sin(targetAngle) * bulletForce
		}
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
	const checkGround = (event, bool) => {
		var pairs = event.pairs
		for (var i = 0, j = pairs.length; i != j; ++i) {
			var pair = pairs[i]
			if (pair.bodyA === player.bodies[1]) {
				player.ground = bool
			} else if (pair.bodyB === player.bodies[1]) {
				player.ground = bool
			}
		}
	}

	const checkBulletCollisionGroundRemove = e => {
		for (let i = 0; i < e.pairs.length; ++i) {
			if (e.pairs[i].bodyA.label === 'bullet' && e.pairs[i].bodyB.label === 'ground') {
				World.remove(world, e.pairs[i].bodyA)
			} else if (e.pairs[i].bodyB.label === 'bullet' && e.pairs[i].bodyA.label === 'ground') {
				World.remove(world, e.pairs[i].bodyB)
			}
		}
	}

	const removeOutOfBoundsBullets = () => {
		// remove out-of-bounds bullets
		for (let i = 0; i < bullets.length; ++i) {
			let bullet = bullets[i]
			if (bullet.position.x > world.bounds.max.x ||
					bullet.position.x < 0 ||
					bullet.position.y < 0 ) {
				World.remove(world, bullet)
				bullets = bullets.filter(b => b != bullet)
			}
		}
	}

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

	// const positionEnemyLifebar = (enemy) => {
	// 	let lifebar = enemy.bodies[0]._outerLifebar
	// 	let size = enemy.bodies[0]._barsize
	// 	let renderBoundsX = ((render.bounds.max.x - render.bounds.min.x)/2)
	// 	let enemyPosX = enemy.bodies[0].position.x - (enemy.bodies[0].bounds.max.x - enemy.bodies[0].bounds.min.x)
	// 	let renderBoundsY = ((render.bounds.max.x - render.bounds.min.y)/2)
	// 	let enemyPosY = enemy.bodies[0].position.y
	// 	let enemyHeadHt = enemy.bodies[0].bounds.max.y - enemy.bodies[0].bounds.min.y
	// 	lifebar.style.left = enemyPosX - size.w + renderBoundsX + 'px'
	// 	lifebar.style.top = enemyPosY - enemyHeadHt - (size.h + (size.h/2)) + 'px'
	// }

	const positionEnemyLifebar = enemy => {
		let lifebar = enemy.bodies[0]._outerLifebar
		let headHt = enemy.bodies[0].bounds.max.y - enemy.bodies[0].bounds.min.y
		lifebar.style.left = enemy.bodies[0].position.x - (enemy.bodies[0]._barsize.w/2) - render.bounds.min.x + 'px'
		lifebar.style.top = enemy.bodies[0].position.y - headHt - enemy.bodies[0]._barsize.h - render.bounds.min.y + 'px'
	}

	// for performance, we may need to check all collision types in one function
	// instead of running separate loops for all collision types
	const checkBulletsHitEnemyStart = (e, bool) => {
		for (let i = 0; i < e.pairs.length; ++i) {
			if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
				let enemy = e.pairs[i].bodyA
				enemy.label.indexOf('head') > -1 ? damageEnemy(enemy, HEAD_DAMAGE) : damageEnemy(enemy, BODY_DAMAGE)
			} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
				let enemy = e.pairs[i].bodyB
				enemy.label.indexOf('head') > -1 ? damageEnemy(enemy, HEAD_DAMAGE) : damageEnemy(enemy, BODY_DAMAGE)
			}
		}
	}

	const checkBulletsHitEnemyEnd = (e, bool) => {
		for (let i = 0; i < e.pairs.length; ++i) {
			if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
				let enemy = e.pairs[i].bodyA
				World.remove(world, enemy)
				// console.log(bool)
			} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
				let enemy = e.pairs[i].bodyB
				World.remove(world, enemy)
				// console.log(bool)
			}
		}
	}

	Events.on(engine, 'collisionStart', e => {
		checkGround(e, true)
		checkBulletsHitEnemyStart(e, true)
	})
	Events.on(engine, 'collisionActive', e => {
		checkGround(e, true)
	})
	Events.on(engine, 'collisionEnd', e => {
		checkGround(e, false)
		// check bullet collision and remove
		checkBulletCollisionGroundRemove(e)
		checkBulletsHitEnemyEnd(e, false)
	})

	// let then = Date.now()
	// main engine update loop
	Events.on(engine, 'beforeTick', e => {

		renderMouse() // renderMouse() will draw the white line if it is in the requestAnimationFrame() loop

		removeOutOfBoundsBullets()

		enemies.forEach((enemy, i) => { positionEnemyLifebar(enemy) })

		// if (Date.now() < then + 2000) {
		// 	console.log(render)
		// }

		let playerPos = player.bodies[0].position
		// try to keep render view in-step with player character
		Render.lookAt(render, {
			min: { x: playerPos.x + width/2, y: 0 },
			max: { x: playerPos.x - width/2, y: height }
		})

		// math calculating size / pos of elms
		let playerHeight = (player.bodies[1].bounds.max.y - player.bodies[1].bounds.min.y)
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

	})

}
