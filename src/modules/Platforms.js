import { World, Bodies } from 'matter-js'
import { GROUND } from './constants/CollisionFilterConstants'

export const createGround = (world, width, height) => {
	let ground = Bodies.rectangle(0, height, width * 2, 100, {
		label: 'ground',
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	World.add(world, ground)
	return ground
}
