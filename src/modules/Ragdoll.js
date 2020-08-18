import {
	Bodies, Constraint, Composite, World
} from 'matter-js'
import {
	GROUND, BULLET, BOX,
	PLAYER_HEAD, PLAYER_BODY,
	ENEMY_HEAD, ENEMY_BODY,
} from './CollisionFilterConstants'

export function createRagdoll(world, scale) {

	scale = scale | 1
	// position = position | { x: 0, y: 0 }

	let lowerLeg1 = Bodies.rectangle(0, 100*scale, 10*scale, 30*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let lowerLeg2 = Bodies.rectangle(20*scale, 100*scale, 10*scale, 30*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let upperLeg1 = Bodies.rectangle(0, 50*scale, 10*scale, 30*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let upperLeg2 = Bodies.rectangle(20*scale, 50*scale, 10*scale, 30*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let torso = Bodies.rectangle(10*scale, 0*scale, 25*scale, 50*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let head = Bodies.rectangle(10*scale, 0*scale, 25*scale, 25*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let upperArm1 = Bodies.rectangle(-10*scale, 20*scale, 10*scale, 20*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let lowerArm1 = Bodies.rectangle(-10*scale, 50*scale, 10*scale, 20*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let upperArm2 = Bodies.rectangle(40*scale, 20*scale, 10*scale, 20*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	let lowerArm2 = Bodies.rectangle(40*scale, 50*scale, 10*scale, 20*scale, {
		collisionFilter: {
			category: ENEMY_BODY
		}
	})
	lowerLeg1.label = 'lower leg 1'
	upperLeg1.label = 'upper leg 1'
	lowerLeg2.label = 'lower leg 2'
	upperLeg2.label = 'upper leg 2'
	upperArm1.label = 'upper arm 1'
	lowerArm1.label = 'lower arm 1'
	upperArm2.label = 'upper arm 2'
	lowerArm2.label = 'lower arm 2'
	head.label = 'head'
	torso.label = 'torso'

	let renderProps = {
		anchors: false,
		visible: false
	}

	let upperleg1_to_torso = Constraint.create({
		bodyA: upperLeg1,
		bodyB: torso,
		pointA: { x: 0*scale, y: -15*scale },
		pointB: { x: -10*scale, y: 25*scale },
		length: 1*scale,
		render: renderProps
	})
	let upperleg2_to_torso = Constraint.create({
		bodyA: upperLeg2,
		bodyB: torso,
		pointA: { x: 0*scale, y: -15*scale },
		pointB: { x: 10*scale, y: 25*scale },
		length: 1*scale,
		render: renderProps
	})
	let lowerleg1_to_upperleg1 = Constraint.create({
		bodyA: lowerLeg1,
		bodyB: upperLeg1,
		pointA: { x: 0*scale, y: -15*scale },
		pointB: { x: 0*scale, y: 15*scale },
		length: 1*scale,
		render: renderProps
	})
	let lowerleg2_to_upperleg2 = Constraint.create({
		bodyA: lowerLeg2,
		bodyB: upperLeg2,
		pointA: { x: 0*scale, y: -15*scale },
		pointB: { x: 0*scale, y: 15*scale },
		length: 1*scale,
		render: renderProps
	})
	let head_to_torso = Constraint.create({
		bodyA: head,
		bodyB: torso,
		pointA: { x: 0*scale, y: 15*scale },
		pointB: { x: 0*scale, y: -25*scale },
		length: 4*scale,
		render: renderProps
	})
	let upperarm1_to_torso = Constraint.create({
		bodyA: upperArm1,
		bodyB: torso,
		pointA: { x: 0*scale, y: -10*scale },
		pointB: { x: -15*scale, y: -25*scale },
		length: 4*scale,
		render: renderProps
	})
	let lowerarm1_to_upperarm1 = Constraint.create({
		bodyA: upperArm1,
		bodyB: lowerArm1,
		pointA: { x: 0*scale, y: 10*scale },
		pointB: { x: 0*scale, y: -10*scale },
		length: 1*scale,
		render: renderProps
	})
	let upperarm2_to_torso = Constraint.create({
		bodyA: upperArm2,
		bodyB: torso,
		pointA: { x: 0*scale, y: -10*scale },
		pointB: { x: 15*scale, y: -25*scale },
		length: 4*scale,
		render: renderProps
	})
	let lowerarm2_to_upperarm2 = Constraint.create({
		bodyA: upperArm2,
		bodyB: lowerArm2,
		pointA: { x: 0*scale, y: 10*scale },
		pointB: { x: 0*scale, y: -10*scale },
		length: 1*scale,
		render: renderProps
	})

	let collection = Composite.create({
	})
	Composite.add(collection, [
		head, torso,
		lowerLeg1, lowerLeg2,
		upperLeg1, upperLeg2,
		upperArm1, lowerArm1,
		upperArm2, lowerArm2,
		upperleg1_to_torso, upperleg2_to_torso,
		lowerleg1_to_upperleg1, lowerleg2_to_upperleg2,
		head_to_torso,
		upperarm1_to_torso, lowerarm1_to_upperarm1,
		upperarm2_to_torso, lowerarm2_to_upperarm2
	])
	World.add(world, [collection])
	// Composite.translate(collection, position)
	console.log('should have created a ragdoll...')

	return collection
}
