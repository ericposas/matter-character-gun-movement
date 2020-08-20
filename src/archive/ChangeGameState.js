import { width, height } from '../config'


function changeGameState (fn, gameState, state) {
	// gameState = state
	// using closure function
	let gs = fn(state)
	console.log(gs)
	if (gs == 'menu') {
		// build a temporary game menu, or just show/hide an html block
		let startBtn = document.getElementById('menu-button')
		document.getElementById('menu').style.display = 'block'
		startBtn.style.left = (width/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('width'))/2) + 'px'
		startBtn.style.top = (height/2) - (parseInt(getComputedStyle(startBtn).getPropertyValue('height'))/2) + 'px'
		startBtn.addEventListener('click', startGame)
		function startGame(e) {
			changeGameState(fn, gameState, 'gameplay')
			startBtn.style.display = 'none'
			startBtn.removeEventListener('click', startGame)
		}
	}
	if (gs == 'gameplay') {
		buildLevel(1)
		registerEventListeners()
	}
}

export default changeGameState
