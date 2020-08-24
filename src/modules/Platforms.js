import { World, Bodies } from 'matter-js'
import { GROUND } from './constants/CollisionFilterConstants'

export const createGround = (world, width, height) => {
	let gHt = 400
	let ground = Bodies.rectangle(0, height + gHt/2, width * 2, gHt, {
		label: 'ground',
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	World.add(world, ground)
	return ground
}
