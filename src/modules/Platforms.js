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

export function DestructiblePlatform(world, width, height, position, dPlatArray) {
	this._platform = createPlatform(world, width, height, position)
	this.healthbar = document.createElement('div')
	this.healthbar.classList.add('platform-health')
	document.getElementById('health-bars-container').appendChild(this.healthbar)
	// document.body.appendChild(this.healthbar)
	this.health = 100
	this.getHealth = () => this.health
	this.updateHealthbar = (val) => {
		this.health = val
		this.healthbar.style.width = val + 'px'
	}
	this.updateHealthbarPosition = (render) => {
		// console.log(position)
		// console.log(render)
		this.healthbar.style.left = this._platform.position.x - ((this._platform.bounds.max.x - this._platform.bounds.min.x)/2) - render.bounds.min.x + 'px'
		this.healthbar.style.top = this._platform.position.y - ((this._platform.bounds.max.y - this._platform.bounds.min.y)/2) - render.bounds.min.y + 'px'
	}
	this.destroy = () => {
		World.remove(world, this._platform)
	}
	// this.updateHealthbarPosition(render)
	World.add(world, this._platform)
	dPlatArray.push(this)
	return this
}
