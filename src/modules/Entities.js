import {
	Composite, Composites, Constraint, Bodies, World, Body, Vector
} from 'matter-js'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './CollisionFilterConstants'


export const createEnemy = (enemiesArray, bulletsArray, player, world, mouse_point, position) => {
	// 'player' is the main player to pass here so we can track his movements
	let { player: enemy } = createPlayer(world, 'enemy', mouse_point, position)
	let enemyBulletForce = .025

	const createEnemyLifeBar = () => {
		let barWd = 60, barHt = 10
		let outerbar = document.createElement('div')
		let bar = document.createElement('div')
		let outerbarStyle = `position:absolute;border:1px solid black;width:${barWd}px;height:${barHt}px;`
		let barStyle = `position:absolute;background-color:red;width:${barWd}px;height:${barHt}px;`;
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
	// set enemy part to reference the dom lifebar element
	enemy.bodies[0]._lifebar = bar
	enemy.bodies[1]._lifebar = bar
	enemy.bodies[0]._outerLifebar = outerbar
	enemy.bodies[1]._outerLifebar = outerbar
	enemy.bodies[0]._barsize = size
	enemy.bodies[1]._barsize = size
	enemiesArray.push(enemy)
	Composite.remove(enemy, [
		enemy.bodies[3],
		enemy.constraints[3],
		enemy.constraints[4]
	])
	// test enemy shooting code
	setInterval(() => {
		if (enemiesArray.indexOf(enemy) > -1) {
			let playerPos = player.bodies[0].position
			let arm = enemy.bodies[2]
			let armWidth = arm.bounds.max.x - arm.bounds.min.x
			let armHeight = arm.bounds.max.y - arm.bounds.min.y
			let bulletOptions = {
				collisionFilter: {
					category: BULLET
				}
			}
			let enBulletPos = {
				x: enemy.bodies[1].position.x - enemy.constraints[2].pointA.x,
				y: arm.position.y + ((arm.bounds.max.y - arm.bounds.min.y)/2)
			}
			let enemyBullet = Bodies.circle(enBulletPos.x, enBulletPos.y, 6, bulletOptions)
			enemyBullet.label = 'bullet'
			World.add(world, enemyBullet)
			bulletsArray.push(enemyBullet)
			Body.applyForce(enemyBullet, enBulletPos, {
				x: Math.cos(arm.angle) * enemyBulletForce,
				y: Math.sin(arm.angle) * enemyBulletForce
			})
		}
	}, 3000)

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
	World.add(world, player)
	// need to keep a reference to the player/enemy object that we can remove
	player.bodies.forEach(body => { body._composite = player })

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
