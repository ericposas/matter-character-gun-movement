import {
	Bodies, Body, World, Constraint, Composite, Events
} from 'matter-js'
import { width, height } from './config'
import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import './index.scss'

window.start = () => {

	let { world, render, engine } = boilerplate(width, height)

	let ground = Bodies.rectangle(width/2, height, width, 100, { isStatic: true })
	ground.label = 'ground'
	// let groundHeight = ground.position.y - 50
	// console.log(ground.position.y)

	let category1 = 0x0001 // bit field collisionFilter category, objects will collide if their filters match another's mask
	let category2 = 0x0002
	let category3 = 0x0004
	let head = Bodies.rectangle(110, 400, 20, 25)
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
	let bod = Bodies.rectangle(100, 450, 60, 100, {
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
	let upperarm = Bodies.rectangle(160, 400, 20, 15, {
		collisionFilter: {
			category: category1,
			mask: category2
		}
	})
	let lowerarm = Bodies.rectangle(160, 400, 20, 12, {
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
	let mouse_point = Bodies.circle(20, 20, 1, {
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
		ground: false,

	})
	Composite.add(player, [
		head, bod, head_to_bod,
		upperarm, bod_to_upperarm, lowerarm, upperarm_to_lowerarm,
		// mouse_point,
		mouse_control,

	])

	World.add(world, [
		ground,
		player

	])

	let keys = []
	let lastDirection = ''
	let mousePos = { x: 0, y: 0 }

	// function renderMouse() {
	// 	requestAnimationFrame(renderMouse)
	// 	mouse_point.position.x = mousePos.x
	// 	mouse_point.position.y = mousePos.y
	// 	if (mouse_point.position.x > player.bodies[1].position.x) {
	// 		lastDirection = 'left'
	// 	} else {
	// 		lastDirection = 'right'
	// 	}
	// }
	// renderMouse()

	// Events.on(engine, 'beforeUpdate', e => {
	// 	mouse_point.position.x = e.clientX
	// 	mouse_point.position.y = e.clientY
	//
	// })

	render.canvas.addEventListener('mousemove', e => {
		mousePos = { x: e.clientX, y: e.clientY }
	})
	document.body.addEventListener("keydown", e => {
  	keys[e.keyCode] = true
	})
	document.body.addEventListener("keyup", e => {
  	keys[e.keyCode] = false
	})

	const checkGround = (event, bool) => {
		var pairs = event.pairs
		for (var i = 0, j = pairs.length; i != j; ++i) {
			var pair = pairs[i]
			// console.log(pair)
			if (pair.bodyA === player.bodies[1]) {
				player.ground = bool
			} else if (pair.bodyB === player.bodies[1]) {
				player.ground = bool
			}
		}
	}

	Events.on(engine, 'collisionStart', e => {
		checkGround(e, true)
	})
	Events.on(engine, 'collisionActive', e => {
		checkGround(e, true)
	})
	Events.on(engine, 'collisionEnd', e => {
		checkGround(e, false)
	})

	// main engine update loop
	Events.on(engine, 'beforeTick', e => {
		// math calculating size / pos of elms
		let playerHeight = (player.bodies[1].bounds.max.y - player.bodies[1].bounds.min.y)
		let groundHeight = (height - (ground.bounds.max.y - ground.bounds.min.y))
		groundHeight -= (ground.position.y - groundHeight)

		// render mouse
		mouse_point.position.x = mousePos.x
		mouse_point.position.y = mousePos.y
		if (mouse_point.position.x > player.bodies[1].position.x) {
			lastDirection = 'left'
		} else {
			lastDirection = 'right'
		}

		// jump key
		if (keys[87] &&
				(player.bodies[1].position.y - playerHeight) > (groundHeight-15) &&
				player.ground) {
			player.bodies[1].force = (
				lastDirection == 'left'
				?	{ x: -0.1, y: playerProps.jumpForce }
				: { x: 0.1, y: playerProps.jumpForce }
			)
			// console.log('should jump..')
		} else {
			Body.setAngle(player.bodies[1], 0)
			Body.setDensity(player.bodies[1], .025)
		}

		console.log(playerProps.acceleration)

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

		// if ((player.touchingWall || player.touchingSideOfPlatform) && !player.ground) {
		// 	player.friction = 0
		// } else {
		// 	player.friction = .5
		// }

	})

}
