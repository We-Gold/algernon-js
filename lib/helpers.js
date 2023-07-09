// Cell format:
// 11111
// Visited, North, South, East, West

// Binary masks for each piece of info
export const Visited = 0b10000
export const North = 0b01000
export const South = 0b00100
export const East = 0b00010
export const West = 0b00001

// Store opposite directions for convenient lookup
export const oppositeDirection = {
	[North]: South,
	[South]: North,
	[East]: West,
	[West]: East,
}

/**
 * Lookup the cell at a specific index array
 * @param {number[]} index
 * @param {number[][]} cells
 * @returns {number} The binary data in the cell
 */
export const cellAt = (index, cells) => {
	return cells[index[0]][index[1]]
}

/**
 * Determine if a cell matches a specific mask (North, Visited, etc.)
 * @param {number} condition Binary mask
 * @param {number} cell The binary data in the cell
 * @returns {boolean} Whether or not the cell matches the condition
 */
export const cellIs = (condition, cell) => (cell & condition) !== 0

/**
 * Removes the wall between two neighboring cells
 * @param {number[]} currentCell
 * @param {number[]} neighborCell
 * @param {number[][]} cells
 */
export const removeWall = (
	[currentRow, currentCol],
	[neighborRow, neighborCol],
	cells
) => {
	const direction = getDirection(
		[currentRow, currentCol],
		[neighborRow, neighborCol]
	)

	// Remove the wall between the current cell
	// and the neighbor using XOR
	cells[currentRow][currentCol] &= ~direction
	cells[neighborRow][neighborCol] &= ~oppositeDirection[direction]
}

// Cell index arrays cannot be used as map keys, as they
// aren't always unique. Stringifying resolves this.
export const unique = (index) => JSON.stringify(index)
export const parseUnique = (uniqueIndex) => JSON.parse(uniqueIndex)

/**
 * Selects a random element from an array
 * @param {any[]} array
 * @returns {any} A random element from an array
 */
export const chooseRandom = (array) =>
	array[Math.round(Math.random() * (array.length - 1))]

/**
 * Selects a random index within a range
 * @param {number} length
 * @returns {number} A random index
 */
export const chooseRandomIndex = (length) => {
	return Math.round(Math.random() * (length - 1))
}

/**
 * Shuffles the order of an array in-place
 * @param {any[]} array
 */
export const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		// Select a random element in the array up to the current element
		const j = Math.floor(Math.random() * (i + 1))

		// Swap the current and random elements
		;[array[i], array[j]] = [array[j], array[i]]
	}
}

/**
 * Determines the cardinal direction between the two current cells
 * @param {number[]} currentCell
 * @param {number[]} neighborCell
 * @returns {number} The cardinal direction as a binary mask
 */
export const getDirection = (currentCell, neighborCell) => {
	const [currentRow, currentCol] = currentCell
	const [neighborRow, neighborCol] = neighborCell

	if (currentRow === neighborRow)
		return currentCol < neighborCol ? East : West
	else return currentRow < neighborRow ? South : North
}

/**
 * Finds all neighbors that have not been visited
 * @param {number[]} cell
 * @param {number[][]} cells
 * @returns {number[][]} All unvisited neighbors of the cell
 */
export const getUnvisitedNeighbors = ([row, col], cells) => {
	const neighbors = [
		[row - 1, col], // North
		[row + 1, col], // South
		[row, col + 1], // East
		[row, col - 1], // West
	]

	// Select cells that are within bounds and aren't visited
	return neighbors.filter(
		(neighbor) =>
			cells?.[neighbor[0]]?.[neighbor[1]] &&
			!cellIs(Visited, cellAt(neighbor, cells))
	)
}

/**
 * Finds all neighbors that can be traversed to directly from
 * the current cell
 * @param {number[]} cell
 * @param {number[][]} cells
 * @returns {number[][]} All available neighbors of the current cell
 */
export const getAvailableNeighbors = ([row, col], cells) => {
	const neighbors = [
		[row - 1, col], // North
		[row + 1, col], // South
		[row, col + 1], // East
		[row, col - 1], // West
	]

	// Select cells that are within bounds and arent' blocked
	return neighbors.filter(([neighborRow, neighborCol]) => {
		if (
			neighborRow >= 0 &&
			neighborRow < cells.length &&
			neighborCol >= 0 &&
			neighborCol < cells[neighborRow].length
		) {
			const direction = getDirection(
				[row, col],
				[neighborRow, neighborCol]
			)
			return !(cells[row][col] & direction)
		}
		return false
	})
}
