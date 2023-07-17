import {
	Visited,
	chooseRandom,
	chooseRandomIndex,
	chooseRandomIndexGrid,
	createFilledMatrix,
	getUnvisitedNeighbors,
	getUnvisitedNeighborsGrid,
	removeWall,
	removeWallGrid,
} from "../helpers"

/**
 * Generate a maze using the growing tree algorithm.
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateGrowingTreeRaw = (
	rows,
	cols,
	growMethod = GrowingTreeMethod.prim
) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = createFilledMatrix(rows, cols, 0b01111)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	// Pick a random cell from cells
	const randomCell = [chooseRandomIndex(rows), chooseRandomIndex(cols)]

	// Create a list to store cells active in the algorithm
	const activeCells = [randomCell]

	// Join cells randomly until all cells have been visited
	while (activeCells.length > 0) {
		const currentCellIndex = growMethod(activeCells.length)
		const [currentRow, currentCol] = activeCells[currentCellIndex]

		cells[currentRow][currentCol] |= Visited

		const neighbors = getUnvisitedNeighbors([currentRow, currentCol], cells)

		// Remove a cell if it has no neighbors to visit
		if (neighbors.length === 0) {
			activeCells.splice(currentCellIndex, 1)
			continue
		}

		const randomNeighbor = chooseRandom(neighbors)

		removeWall([currentRow, currentCol], randomNeighbor, cells)

		activeCells.push(randomNeighbor)

		cells[randomNeighbor[0]][randomNeighbor[1]] |= Visited
	}

	return cells
}

/**
 * Generate a maze using the growing tree algorithm.
 * 
 * Due to the nature of the algorithm, odd maze sizes (e.g. 19x19),
 * are required, and even dimensions will simply include a buffer
 * of walls on the bottom and right edges.
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @returns {boolean[][]} The generated maze in occupancy grid format
 */
export const generateGrowingTreeGrid = (
	rows,
	cols,
	growMethod = GrowingTreeMethod.prim
) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = createFilledMatrix(rows, cols, true)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	// Pick a random cell from cells
	const randomCell = [
		chooseRandomIndexGrid(rows),
		chooseRandomIndexGrid(cols),
	]

	// Create a list to store cells active in the algorithm
	const activeCells = [randomCell]

	// Join cells randomly until all cells have been visited
	while (activeCells.length > 0) {
		const currentCellIndex = growMethod(activeCells.length)
		const [currentRow, currentCol] = activeCells[currentCellIndex]

		cells[currentRow][currentCol] = false

		const neighbors = getUnvisitedNeighborsGrid(
			[currentRow, currentCol],
			cells
		)

		// Remove a cell if it has no neighbors to visit
		if (neighbors.length === 0) {
			activeCells.splice(currentCellIndex, 1)
			continue
		}

		const randomNeighbor = chooseRandom(neighbors)

		removeWallGrid([currentRow, currentCol], randomNeighbor, cells)

		activeCells.push(randomNeighbor)

		cells[randomNeighbor[0]][randomNeighbor[1]] = false
	}

	return cells
}

/**
 * Contains multiple methods for running the growing tree algorithm
 */
export const GrowingTreeMethod = {
	backtracking: (size) => size - 1,
	prim: (size) => chooseRandomIndex(size),
}
