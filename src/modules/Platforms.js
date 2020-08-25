import { World, Bodies, Body } from 'matter-js'
import { GROUND } from './constants/CollisionFilterConstants'
import { getBodyWidth, getBodyHeight } from './Utils'

export const createGround = (world, width, height) => {
	let gHt = 400
	let ground = Bodies.rectangle(0, height + gHt/2, getBodyWidth(world) - 500, gHt, {
		label: 'ground',
		isStatic: true,
		collisionFilter: {
			category: GROUND
		}
	})
	World.add(world, ground)
	return ground
}

export const createPlatform = (world, width, height, position, addToWorldBool, platsArray) => {
	let platform = Bodies.rectangle(0, 0, width, height, { isStatic: true })
	platform.label = 'platform'
	if (addToWorldBool) { World.add(world, platform) }
	Body.translate(platform, position)
	if (platsArray) { platsArray.push(platform) }
	// platform.destroy = () => {
	// 	if (platsArray) {
	// 		let idx = platsArray.indexOf(platform)
	// 		if (idx > -1) {
	// 			World.remove(world, platform)
	// 			platsArray.splice(idx, 1)
	// 		}
	// 	}
	// }
	return platform
}

export function DestructiblePlatform(world, width, height, position, dPlatArray) {
	let platformWidth, platformHeight, healthbarHeight
	this.healthbarContainer = document.getElementById('health-bars-container')
	this._platform = createPlatform(world, width, height, position, false)
	this._platform._this = this
	this._platform.label = 'destructible platform'
	platformWidth = (this._platform.bounds.max.x - this._platform.bounds.min.x)
	platformHeight = (this._platform.bounds.max.y - this._platform.bounds.min.y)
	this.healthbar = document.createElement('div')
	this.healthbar.classList.add('platform-health')
	this.healthbarContainer.appendChild(this.healthbar)
	this.healthbar.style.width = platformWidth + 'px'
	healthbarHeight = parseInt(getComputedStyle(this.healthbar).getPropertyValue('height'), 10)
	this.health = 100
	this.getHealth = () => this.health
	this.damageHealthbar = (dmg) => {
		this.health = (this.health - dmg)
		this.healthbar.style.width = (this.health/100) * platformWidth + 'px'
	}
	this.updateHealthbarPosition = (render) => {
		this.healthbar.style.left = this._platform.position.x - (platformWidth/2) - render.bounds.min.x + 'px'
		this.healthbar.style.top = this._platform.position.y + (platformHeight/2) - healthbarHeight - render.bounds.min.y + 'px'
	}
	this.destroy = () => {
		let idx = dPlatArray.indexOf(this._platform)
		if (idx > -1) {
			World.remove(world, this._platform)
			dPlatArray.splice(idx, 1)
		}
		if (this.healthbar && this.healthbar.parentNode == this.healthbarContainer) {
			this.healthbarContainer.removeChild(this.healthbar)
		}
	}
	World.add(world, this._platform)
	dPlatArray.push(this._platform)
	return this
}
