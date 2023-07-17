import {
	Visited,
	chooseRandom,
	createFilledMatrix,
	getUnvisitedNeighbors,
	getUnvisitedNeighborsGrid,
	removeWall,
	removeWallGrid,
} from "../helpers"

/**
 * Generate a maze using backtracking, assuming that
 * the top left is the start and bottom right is the end
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @param {number[]} [start] The starting point of the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateBacktrackingRaw = (rows, cols, start = [0, 0]) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = createFilledMatrix(rows, cols, 0b01111)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	// Visit the start node
	cells[start[0]][start[1]] |= Visited

	// Create the stack, with each cell stored as a list
	const visitingStack = [start]

	while (visitingStack.length > 0) {
		const currentCell = visitingStack.pop()

		const unvisitedNeighbors = getUnvisitedNeighbors(currentCell, cells)

		if (unvisitedNeighbors.length > 0) {
			visitingStack.push(currentCell)

			const randomNeighbor = chooseRandom(unvisitedNeighbors)

			removeWall(currentCell, randomNeighbor, cells)

			// Mark the neighbor as visited
			cells[randomNeighbor[0]][randomNeighbor[1]] ^= Visited

			visitingStack.push(randomNeighbor)
		}
	}

	return cells
}

/**
 * Generate a maze using backtracking, assuming that
 * the top left is the start and bottom right is the end.
 *
 * Due to the nature of the algorithm, odd maze sizes (e.g. 19x19),
 * are required, and even dimensions will simply include a buffer
 * of walls on the bottom and right edges.
 *
 * This creates a maze in the occupancy grid format,
 * as opposed to the raw format.
 *
 * true = open
 * false = wall/obstacle
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @param {number[]} [start] The starting point of the maze
 * @returns {boolean[][]} The generated maze in occupancy grid format
 */
export const generateBacktrackingGrid = (rows, cols, start = [0, 0]) => {
	// Initialize all cells, each with all walls and being unvisited
	// Add 1, as due to indexing, the last row and column are all
	const cells = createFilledMatrix(rows, cols, true)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	// Visit the start node
	cells[start[0]][start[1]] = false

	// Create the stack, with each cell stored as a list
	const visitingStack = [start]

	while (visitingStack.length > 0) {
		const currentCell = visitingStack.pop()

		const unvisitedNeighbors = getUnvisitedNeighborsGrid(currentCell, cells)

		if (unvisitedNeighbors.length > 0) {
			visitingStack.push(currentCell)

			const randomNeighbor = chooseRandom(unvisitedNeighbors)

			removeWallGrid(currentCell, randomNeighbor, cells)

			// Mark the neighbor as visited
			cells[randomNeighbor[0]][randomNeighbor[1]] = false

			visitingStack.push(randomNeighbor)
		}
	}

	return cells
}
