import { Bodies, World } from 'matter-js'
import { PLAYER_HEALTHBAR_LENGTH } from './constants/GameConstants'
import { width } from '../config'
import random from 'random'

export class HealthDrop {

	constructor(healAmt, world, healthdropsArray) {
		this.domShapesContainer = document.getElementById('dom-shapes-container')
		this.body = Bodies.circle(random.int(-width, width), 0, healAmt)
		this.body.label = 'healthdrop'
		this.healAmount = healAmt / 100 * PLAYER_HEALTHBAR_LENGTH
		this.body._this = this
		this.createDOMShape(healAmt)
		World.add(world, this.body)
		healthdropsArray.push(this.body)
	}

	set shape(val) {
		this._shape = val
	}

	get shape() {
		return this._shape
	}

	set radius(val) {
		this._radius = val
	}

	get radius() {
		return this._radius
	}

	renderShape(render) {
		this.shape.style.left = this.body.position.x - (this.radius/2) - render.bounds.min.x + 'px'
		this.shape.style.top = this.body.position.y - (this.radius/2) - render.bounds.min.y + 'px'
	}

	createDOMShape(healAmt) {
		let shape = document.createElement('div')
		shape.classList.add('healthdrop-shape')
		shape.style.width = `${healAmt * 1.5}px`
		shape.style.height = `${healAmt * 1.5}px`
		this.radius = healAmt * 1.5
		this.domShapesContainer.appendChild(shape)
		this.shape = shape
	}

	collect(world, healthdropsArray) {
		let idx = healthdropsArray.indexOf(this.body)
		if (idx > -1) {
			this.domShapesContainer.removeChild(this.shape)
			World.remove(world, this.body)
			healthdropsArray.splice(idx, 1)
		}
	}

}
