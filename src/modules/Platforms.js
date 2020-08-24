import { World, Bodies, Body } from 'matter-js'
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

export const createPlatform = (world, width, height, position) => {
	let platform = Bodies.rectangle(0, 0, width, height, { isStatic: true })
	platform.label = 'platform'
	World.add(world, platform)
	Body.translate(platform, position)
	return platform
}
