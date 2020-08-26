import { Mouse, MouseConstraint, World, Engine, Render, Runner } from 'matter-js'
import { width, height } from '../config'

export function matterBoilerplate(mouseConstraintBool) {
	// create engine
	let engine = Engine.create()
	let world = engine.world
	world.bounds = {
		min: { x: -width * 2, y: height * -2 },
		max: { x: width * 2, y: height * 1.5 }
	}

	// create renderer
	let render = Render.create({
			element: document.body,
			engine: engine,
			options: {
					width,
					height,
					showAngleIndicator: true,
					showCollisions: true,
					showVelocity: true
			}
	})
	Render.run(render)

	// create runner
	var runner = Runner.create()
	Runner.run(runner, engine)

	if (mouseConstraintBool) {
		let mouse = Mouse.create(render.canvas)
		let	mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: {
					visible: false
				}
			}
		})
		World.add(world, mouseConstraint)
		// keep the mouse in sync with rendering
		render.mouse = mouse
	}

	return {
		engine,
		render,
		runner,
		world,
		// mouse,
		// mouseConstraint
	}

}
