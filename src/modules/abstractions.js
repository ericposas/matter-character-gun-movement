import {
	Composite, Composites, Constraint, Bodies
} from 'matter-js'

// collision groups
let category1 = 0x0001 // bit field collisionFilter category, objects will collide if their filters match another's mask
let category2 = 0x0002
let category3 = 0x0004
let box_to_bullet = 0x0016

export const createPlayer = () => {

	let head = Bodies.rectangle(210, 400, 20, 25)
	head.label = 'char_head'

	let playerProps = {
		radius: 25,
		jumpForce: -3,
		defaultVelocity: .2,
		velocity: .2,
		inAirMovementSpeed: 3,
		movementSpeed: 6,
		acceleration: 0
	}
	let bod = Bodies.rectangle(200, 450, 60, 100, {
		inertia: Infinity,
		density: .25,
		friction: 1,
		frictionStatic: 1,
		// frictionAir: 1,
		restitution: 0,
		collisionFilter: {
			category: category1
		}
	})
	bod.label = 'char_body'
	let head_to_bod = Constraint.create({
		bodyA: head,
		bodyB: bod,
		pointA: { x: 0, y: 10 },
		pointB: { x: 0, y: -50 },
		length: 0,
		collisionFilter: {
			mask: category2
		}
	})
	let upperarm = Bodies.rectangle(260, 400, 20, 15, {
		collisionFilter: {
			category: category1,
			mask: category2
		}
	})
	let lowerarm = Bodies.rectangle(260, 400, 20, 12, {
		collisionFilter: {
			category: category1,
			mask: category2
		}
	})
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
	let mouse_point = Bodies.circle(120, 20, 1, {
		collisionFilter: {
			category: 0x0008,
			mask: category1
		}
	})
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
		head, bod, head_to_bod,
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
		collisionCategories: {
			category1,
			category2,
			category3,
			box_to_bullet
		}
	}
}

export const makeStacks = () => {
	let stack1 = Composites.stack(400, 200, 1, 5, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: box_to_bullet
			}
		})
	})
	let stack2 = Composites.stack(500, 200, 1, 10, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: box_to_bullet
			}
		})
	})
	let stack3 = Composites.stack(800, 200, 1, 10, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: box_to_bullet
			}
		})
	})
	let stack4 = Composites.stack(1200, 200, 1, 7, 0, 0, (x,y) => {
		return Bodies.rectangle(x, y, 30, 30, {
			label: 'box',
			collisionFilter: {
				category: box_to_bullet
			}
		})
	})
	return {
		stack1,
		stack2,
		stack3,
		stack4
	}
}
