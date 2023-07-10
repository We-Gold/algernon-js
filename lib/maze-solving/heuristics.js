/**
 * @callback heuristic
 * @param {number[]} point1
 * @param {number[]} point2
 * @return {number} The heuristic value between the two points (commonly some kind of distance)
 */

/**
 * @type {heuristic}
 */
export const euclideanHeuristic = (([row, col], [otherRow, otherCol]) => {
	return Math.hypot(otherRow - row, otherCol - col)
})

/**
 * @type {heuristic}
 */
export const manhattanHeuristic = (([row, col], [otherRow, otherCol]) => {
	return Math.abs(otherRow - row) + Math.abs(otherCol - col)
})
