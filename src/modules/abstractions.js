import {
	Composite, Composites, Constraint, Bodies, World
} from 'matter-js'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './CollisionFilterConstants'

export const createEnemy = (enemiesArray, world, mouse_point, position) => {
	// 'player' is the main player to pass here so we can track his movements
	let { player: enemy } = createPlayer(world, 'enemy', mouse_point, position)

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
	// console.log(render)
	enemiesArray.push(enemy)

	return enemy

}

export const createPlayer = (world, type, mouse_point, position) => {
	type = type || 'player'
	position = position || { x: 0, y: 0 }
	let { x, y } = position

	let head = Bodies.rectangle(x, 400, 20, 25, {
		collisionFilter: {
			category: PLAYER_HEAD,
			mask: GROUND
		}
	})
	head.label = type == 'player' ? 'player head' : 'enemy head'

	let playerProps = {
		radius: 25,
		jumpForce: -3,
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
		// frictionAir: 1,
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
	let upperarm = Bodies.rectangle(x, 400, 20, 15, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	bod.label = type == 'player' ? 'player arm' : 'enemy arm'
	let lowerarm = Bodies.rectangle(x, 400, 20, 12, {
		collisionFilter: {
			category: PLAYER_BODY,
			mask: GROUND
		}
	})
	bod.label = type == 'player' ? 'player arm' : 'enemy arm'
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
		pointB: { x: -10, y: 0 },
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
	let player = Composite.create({
		ground: false
	})
	Composite.add(player, [
		head, bod,
		head_to_bod1, head_to_bod2,
		upperarm, bod_to_upperarm,
		lowerarm, upperarm_to_lowerarm,
		// mouse_point,
		mouse_control,
	])
	World.add(world, player)
	return {
		player,
		playerProps,
		mouse_point,
		mouse_control
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
