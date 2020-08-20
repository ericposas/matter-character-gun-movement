import {
	Mouse, MouseConstraint, World,
	Engine, Render, Runner
} from 'matter-js'

export function matterBoilerplate(width, height) {
	// create engine
	var engine = Engine.create()
	var world = engine.world;

	// create renderer
	var render = Render.create({
			element: document.body,
			engine: engine,
			options: {
					width,
					height,
					showAngleIndicator: true,
					showCollisions: true,
					showVelocity: true
			}
	});

	Render.run(render);

	// create runner
	var runner = Runner.create();
	Runner.run(runner, engine);

	// fit the render viewport to the scene
	Render.lookAt(render, {
		min: { x: 0, y: 0 }, max: { x: width-100, y: height }
	})

	var mouse = Mouse.create(render.canvas),
			mouseConstraint = MouseConstraint.create(engine, {
					mouse: mouse,
					constraint: {
							stiffness: 0.2,
							render: {
									visible: false
							}
					}
			});

	World.add(world, mouseConstraint)

	// keep the mouse in sync with rendering
	render.mouse = mouse;

	return {
		engine,
		render,
		runner,
		world,
		mouse,
		mouseConstraint
	}

}
