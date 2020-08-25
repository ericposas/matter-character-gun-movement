import { Bodies, World } from 'matter-js'
import { PLAYER_HEALTHBAR_LENGTH } from './constants/GameConstants'

const HEALTH_DROP_SIZE = 10
const HEAL_AMOUNT = 10

export class HealthDrop {

	constructor(world, healthdropsArray) {
		this.body = Bodies.circle(0, 0, HEALTH_DROP_SIZE)
		this.body.label = 'healthdrop'
		this.body.collect = this.collect // this references the body in collect since we attach .collect() method to the body itself now
		this.healAmount = HEAL_AMOUNT / 100 * PLAYER_HEALTHBAR_LENGTH
		this.body.healAmount = this.healAmount
		World.add(world, this.body)
		healthdropsArray.push(this.body)
		console.log(this)
	}

	set body(val) {
		this._body = val
	}

	get body() {
		return this._body
	}

	set healAmount(val) {
		this._healAmount = val
	}

	get healAmount() {
		return this._healAmount
	}

	collect(world, healthdropsArray) {
		console.log(this)
		let idx = healthdropsArray.indexOf(this)
		if (idx > -1) {
			console.log(true)
			World.remove(world, this)
			healthdropsArray.splice(idx, 1)
		}
	}

}
