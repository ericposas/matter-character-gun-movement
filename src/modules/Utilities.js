// move to a utilities file
export const getAngleBetweenTwoPoints = (p1, p2) => {
	// angle in radians
	let angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x)
	return angleRadians
}
