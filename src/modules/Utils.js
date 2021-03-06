export const getBodyWidth = body => body.bounds.max.x - body.bounds.min.x
export const getBodyHeight = body => body.bounds.max.y - body.bounds.min.y
export const getCSSProp = (htmlElm, propName, parseIntBool) => {
	if (parseIntBool) {
		parseInt(getComputedStyle(htmlElm).getPropertyValue(propName), 10)
	} else {
		getComputedStyle(htmlElm).getPropertyValue(propName)
	}
}
//example:  probability = [0, 1, 1, 1] // 75% chance
export const calcProbability = (probabilityArray) => {
	return probabilityArray[Math.floor(Math.random() * probabilityArray.length)]
}
