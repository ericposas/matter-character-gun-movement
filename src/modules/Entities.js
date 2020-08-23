import { Composite, Composites, Constraint, Bodies, World, Body, Vector } from 'matter-js'
import { GROUND, BULLET, BOX, PLAYER_HEAD, PLAYER_BODY, ENEMY_HEAD, ENEMY_BODY } from './constants/CollisionFilterConstants'
import { BULLET_REMOVAL_TIMEOUT, ENEMY_BULLET_FORCE } from './constants/GameConstants'
import { UpdateEnemyCount } from './events/EventTypes'
import random from 'random'
// import { TweenLite } from 'gsap'

// ragdollsArray is not used here, but is now available to the enemy instance
export const createEnemy = (enemiesArray, bulletsArray, ragdollsArray, player, world, mouse_point, position, swapEnemyBody) => {

	let { player: enemy, swapBod, addSwappedBody } = createPlayer(world, 'enemy', mouse_point, position)

	const createEnemyLifeBar = () => {
		let barWd = 60, barHt = 10
		let outerbar = document.createElement('div')
		let bar = document.createElement('div')
		let outerbarStyle = `position:absolute;border:1px solid black;width:${barWd}px;height:${barHt}px;pointer-events:none;`
		let barStyle = `position:absolute;background-color:red;width:${barWd}px;height:${barHt}px;pointer-events:none;`;
		outerbar.style = outerbarStyle
		bar.style = barStyle
		document.body.appendChild(outerbar)
		outerbar.appendChild(bar)
		return {
			bar,
			outerbar,
			size: { w: barWd, h: barHt}
		}
	}
	let { outerbar, bar, size } = createEnemyLifeBar()
	// set enemy part to reference the DOM lifebar element
	const processEnemyFromPlayer = () => {
		Composite.remove(enemy, [
			enemy.bodies[3],
			enemy.constraints[3],
			enemy.constraints[4]
		])
		// enemy.bodies[0]._lifebar = bar
		// enemy.bodies[1]._lifebar = bar
		// enemy.bodies[0]._outerLifebar = outerbar
		// enemy.bodies[1]._outerLifebar = outerbar
		// enemy.bodies[0]._barsize = size
		// enemy.bodies[1]._barsize = size
		// enemy.bodies[0]._composite = enemy
		// enemy.bodies[1]._composite = enemy
		// enemy.bodies[2]._composite = enemy
		enemy.bodies.forEach(body => {
			body._lifebar = bar
			body._outerLifebar = outerbar
			body._barsize = size
			body._composite = enemy
		})
		enemy.stopShooting = () => {
			shouldShoot = false
		}
		enemy.removeLifebar = () => {
			if (outerbar.parentNode == document.body) {
				document.body.removeChild(outerbar)
			}
		}
	}
	processEnemyFromPlayer()

	let shouldShoot = true
	const bulletHandler = () => {
		if (shouldShoot) {
			let playerPos
			if (player) {
				playerPos = player.bodies[0].position
			} else { playerPos = { x: 0, y: 0 } }
			let arm = enemy.bodies[2]
			let armWidth = arm.bounds.max.x - arm.bounds.min.x
			let armHeight = arm.bounds.max.y - arm.bounds.min.y
			let bulletOptions = {
				collisionFilter: { category: BULLET | ENEMY_BODY | ENEMY_HEAD, filter: PLAYER_BODY | PLAYER_HEAD }
			}
			let enBulletPos = {
				x: enemy.bodies[1].position.x - enemy.constraints[2].pointA.x,
				y: arm.position.y + ((arm.bounds.max.y - arm.bounds.min.y)/2)
			}
			let enemyBullet = Bodies.circle(enBulletPos.x, enBulletPos.y, 6, bulletOptions)
			enemyBullet.label = 'enemy bullet'
			World.add(world, enemyBullet)
			bulletsArray.push(enemyBullet)
			Body.applyForce(enemyBullet, enBulletPos, {
				x: Math.cos(arm.angle) * ENEMY_BULLET_FORCE,
				y: Math.sin(arm.angle) * ENEMY_BULLET_FORCE
			})
			// set time to remove bullet automatically
			setTimeout(() => {
				let idx = bulletsArray.indexOf(enemyBullet)
				if (idx > -1) {
					World.remove(world, enemyBullet)
					bulletsArray.splice(idx, 1)
				}
			}, BULLET_REMOVAL_TIMEOUT)
			setTimeout(bulletHandler, random.int(500, 3000))
		}
	}
	// test enemy shooting code
	// using setTimeout instead of setInterval to get a new random number each time
	setTimeout(bulletHandler, random.int(500, 3000)) // shoot a bullet randomly between .5 to 3.0 seconds

	// create random enemy movement
	let directionChangeInterval = setInterval(() => {
		if (shouldShoot) {
			if (enemy._direction == undefined || enemy._direction == 'undefined' || enemy._direction == 'right') {
				enemy._direction = 'left'
			} else {
				enemy._direction = 'right'
			}
		} else {
			clearInterval(directionChangeInterval)
		}
	}, random.int(3000, 6000)) // change up directional flag every 3 to 6 seconds
	// create random enemy crouching
	let crouched = false
	let crouchInterval = setInterval(() => {
		if (shouldShoot) {
			let swapped
			let x = enemy.bodies[0].position.x, y = enemy.bodies[0].position.y
			if (!crouched) {
				swapped = addSwappedBody(swapBod('short', enemy, x, y))
			} else {
				swapped = addSwappedBody(swapBod('normal', enemy, x, y))
			}
			crouched = !crouched
			let { player: _enemy, playerProps: enemyProps,  } = swapped
			swapEnemyBody(_enemy, enemy)
			enemy = _enemy
			enemy.playerProps = enemyProps
			processEnemyFromPlayer()
		} else {
			clearInterval(crouchInterval)
		}
	}, random.int(3000, 6000))
	// create a translation object
	// using gsap, update the position of the enemy onUpdate() and change x value dep. on direction
	const moveEnemy = () => {
		let tween
		if (shouldShoot && tween != 'undefined') {
			let translation = { x: 0, y: 0 }
			tween = TweenLite.to(translation, random.int(2, 5), {
				x: enemy._direction == 'left' ? -1 : 1,
				onUpdate: () => {
					Composite.translate(enemy, translation)
				},
				onComplete: () => { if (shouldShoot) { moveEnemy() } }
			})
		} else {
			if (tween) { tween.kill() }
		}
	}
	moveEnemy()
	enemiesArray.push(enemy)
	dispatchEvent(UpdateEnemyCount)
	return enemy

}

const getShortBody = (type, btype, mouse_point, x, y) => {
	let player = Composite.create({
		ground: false
	})
	let head = Bodies.rectangle(x, 400, 25, 30, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	head.label = type == 'player' ? 'player head' : 'enemy head'
	let playerProps = {
		radius: 25,
		jumpForce: -4,
		defaultVelocity: .2,
		velocity: .2,
		inAirMovementSpeed: 3,
		movementSpeed: 6,
		acceleration: 0
	}
	let bod = Bodies.rectangle(x, 450, 60, 50, {
		inertia: Infinity,
		density: .25,
		friction: 1,
		frictionStatic: 1,
		restitution: 0,
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	bod.label = type == 'player' ? 'player body' : 'enemy body'
	let head_to_bod1 = Constraint.create({
		bodyA: head,
		bodyB: bod,
		pointA: { x: -10, y: 10 },
		pointB: { x: -10, y: -25 },
		length: 0
	})
	let head_to_bod2 = Constraint.create({
		bodyA: head,
		bodyB: bod,
		pointA: { x: 10, y: 10 },
		pointB: { x: 10, y: -25 },
		length: 0
	})
	let upperarm = Bodies.rectangle(x, 400, type == 'player' ? 20 : 40, 15, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	upperarm.label = type == 'player' ? 'player arm' : 'enemy arm'
	let lowerarm = Bodies.rectangle(x, 400, 20, 12, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	lowerarm.label = type == 'player' ? 'player arm' : 'enemy arm'
	let upperarm_to_lowerarm = Constraint.create({
		bodyA: upperarm,
		bodyB: lowerarm,
		pointA: { x: 10, y: 0 },
		pointB: { x: 10, y: 0 },
		length: 0,
		stiffness: 1.0
	})
	let bod_to_upperarm = Constraint.create({
		bodyA: bod,
		bodyB: upperarm,
		pointA: { x: 0, y: -15 },
		pointB: { x: type == 'player' ? -10 : -15, y: 0 },
		length: 0,
		stiffness: 1.0
	})
	mouse_point = mouse_point || Bodies.circle(120, 20, 1)
	let mouse_control = Constraint.create({
		bodyA: lowerarm,
		bodyB: mouse_point,
		pointA: { x: -15, y: 0 },
		stiffness: 1.0,
		length: 1,
		render: {
			visible: true
		}
	})
	Composite.add(player, [
		head, bod,
		head_to_bod1, head_to_bod2,
		upperarm, bod_to_upperarm,
		lowerarm, upperarm_to_lowerarm,
		// mouse_point,
		mouse_control,
	])

	return {
		player,
		playerProps,
		mouse_point,
		mouse_control,
		bodyType: btype
	}

}

const getNormalBody = (type, btype, mouse_point, x, y) => {
	let player = Composite.create({
		ground: false
	})
	let head = Bodies.rectangle(x, 400, 25, 30, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	head.label = type == 'player' ? 'player head' : 'enemy head'
	let playerProps = {
		radius: 25,
		jumpForce: -8,
		defaultVelocity: .2,
		velocity: .2,
		inAirMovementSpeed: 3,
		movementSpeed: 6,
		acceleration: 0
	}
	let bod = Bodies.rectangle(x, 450, 60, 100, {
		inertia: Infinity,
		density: .25,
		friction: 1,
		frictionStatic: 1,
		restitution: 0,
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	bod.label = type == 'player' ? 'player body' : 'enemy body'
	let head_to_bod1 = Constraint.create({
		bodyA: head,
		bodyB: bod,
		pointA: { x: -10, y: 10 },
		pointB: { x: -10, y: -50 },
		length: 0
	})
	let head_to_bod2 = Constraint.create({
		bodyA: head,
		bodyB: bod,
		pointA: { x: 10, y: 10 },
		pointB: { x: 10, y: -50 },
		length: 0
	})
	let upperarm = Bodies.rectangle(x, 400, type == 'player' ? 20 : 40, 15, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	upperarm.label = type == 'player' ? 'player arm' : 'enemy arm'
	let lowerarm = Bodies.rectangle(x, 400, 20, 12, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	lowerarm.label = type == 'player' ? 'player arm' : 'enemy arm'
	let upperarm_to_lowerarm = Constraint.create({
		bodyA: upperarm,
		bodyB: lowerarm,
		pointA: { x: 10, y: 0 },
		pointB: { x: 10, y: 0 },
		length: 0,
		stiffness: 1.0
	})
	let bod_to_upperarm = Constraint.create({
		bodyA: bod,
		bodyB: upperarm,
		pointA: { x: 0, y: -35 },
		pointB: { x: type == 'player' ? -10 : -15, y: 0 },
		length: 0,
		stiffness: 1.0
	})
	mouse_point = mouse_point || Bodies.circle(120, 20, 1)
	let mouse_control = Constraint.create({
		bodyA: lowerarm,
		bodyB: mouse_point,
		pointA: { x: -15, y: 0 },
		stiffness: 1.0,
		length: 1,
		render: {
			visible: true
		}
	})
	Composite.add(player, [
		head, bod,
		head_to_bod1, head_to_bod2,
		upperarm, bod_to_upperarm,
		lowerarm, upperarm_to_lowerarm,
		// mouse_point,
		mouse_control,
	])

	return {
		player,
		playerProps,
		mouse_point,
		mouse_control,
		bodyType: btype
	}

}

export const createPlayer = (world, type, mouse_point, position) => {
	type = type || 'player'
	position = position || { x: 0, y: 0 }
	let { x, y } = position

	const swapBod = (btype, playerInstance, x, y) => {
		x = x || 0
		y = y || 0
		if (playerInstance) {
			Composite.remove(world, playerInstance)
		}
		if (btype == 'short') {
			return getShortBody(type, btype, mouse_point, x, y)
		} else if (btype == 'normal') {
			return getNormalBody(type, btype, mouse_point, x, y)
		}
	}

	const addSwappedBody = swappedBody => {
		let { player, playerProps, mouse_control, mouse_point: mousePoint, bodyType } = swappedBody
		World.add(world, player)
		return {
			player,
			playerProps,
			bodyType,
			mouse_point: mousePoint,
			mouse_control,
			swapBod, addSwappedBody
		}
	}

	let bodyType = swapBod('normal', null, x, y)
	let { player, playerProps, mouse_control, mouse_point: mousePoint } = bodyType
	// World.add(world, player)
	// need to keep a reference to the player/enemy object that we can remove
	player.bodies.forEach(body => { body._composite = player })
	// if (type == 'enemy') { enemiesArray.push(enemy) }
	World.add(world, player)

	return {
		player,
		playerProps,
		mouse_point: mousePoint,
		mouse_control,
		swapBod, addSwappedBody
	}
}

export const makeStacks = () => {
	let stack1 = Composites.stack(400, 200, 1, 5, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: BOX,
				mask: GROUND
			}
		})
	})
	let stack2 = Composites.stack(500, 200, 1, 10, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: BOX,
				mask: GROUND
			}
		})
	})
	let stack3 = Composites.stack(800, 200, 1, 10, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: BOX,
				mask: GROUND
			}
		})
	})
	let stack4 = Composites.stack(1200, 200, 1, 7, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: BOX,
				mask: GROUND
			}
		})
	})
	let stack5 = Composites.stack(100, 200, 1, 7, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: BOX,
				mask: GROUND
			}
		})
	})
	return {
		stacks: {
			stack1,
			stack2,
			stack3,
			stack4,
			stack5
		}
	}
}
