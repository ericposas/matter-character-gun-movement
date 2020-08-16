import {
	Bodies, Body, World, Constraint,
	Composite, Composites, Events, Vector, Render
} from 'matter-js'
import { width, height } from './config'
import { matterBoilerplate as boilerplate } from 'matterjs-boilerplate'
import './index.scss'

window.start = () => {

	let { world, render, engine } = boilerplate(width, height)
	world.bounds = {
		min: { x: 0, y: 0 },
		max: { x: width * 2, y: height * 1.5 },
	}
	console.log(world.bounds)

	let ground = Bodies.rectangle(width, height, width * 2, 100, { isStatic: true })
	ground.label = 'ground'

	// collision groups
	let category1 = 0x0001 // bit field collisionFilter category, objects will collide if their filters match another's mask
	let category2 = 0x0002
	let category3 = 0x0004
	let box_to_bullet = 0x0016

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
		upperarm, bod_to_upperarm, lowerarm, upperarm_to_lowerarm,
		// mouse_point,
		mouse_control,
	])

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

	World.add(world, [
		ground,
		player,
		stack1,
		stack2,
		stack3,
		stack4,

	])

	let keys = []
	let lastDirection = ''
	let reticlePos = { x: 0, y: 0 }
	let bullets = []

	const calcMovingReticlePosition = () => {
		return player.bodies[0].position.x + ((render.bounds.min.x - render.bounds.max.x)/2)
	}
	// render mouse
	function renderMouse() {
		requestAnimationFrame(renderMouse)
		mouse_point.position.x = reticlePos.x + calcMovingReticlePosition()
		mouse_point.position.y = reticlePos.y
		if (mouse_point.position.x > player.bodies[1].position.x) {
			lastDirection = 'left'
		} else {
			lastDirection = 'right'
		}
	}
	renderMouse()

	const calculateBulletAngle = () => {
		let playerPos = player.bodies[0].position
		let targetAngle = Vector.angle(playerPos, {
			x: reticlePos.x + calcMovingReticlePosition(),
			y: reticlePos.y
		})
		let force = .01
		return {
			x: Math.cos(targetAngle) * force,
			y: Math.sin(targetAngle) * force
		}
	}

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
				category: box_to_bullet,
				// mask: box
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

	Events.on(engine, 'collisionStart', e => {
		checkGround(e, true)
	})
	Events.on(engine, 'collisionActive', e => {
		checkGround(e, true)
	})
	Events.on(engine, 'collisionEnd', e => {
		checkGround(e, false)
		// check bullet collision and remove
		checkBulletCollisionGroundRemove(e)
	})

	// main engine update loop
	Events.on(engine, 'beforeTick', e => {

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
