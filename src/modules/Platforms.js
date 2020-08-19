import {
	World, Bodies
} from 'matter-js'
import { GROUND } from './CollisionFilterConstants'

export const createGround = (world, width, height) => {
	let ground = Bodies.rectangle(width, height, width * 2, 100, {
		label: 'ground',
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	World.add(world, [
		ground
	])
	return ground
}
