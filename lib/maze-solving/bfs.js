import { Visited, cellAt, cellIs, createFilledMatrix, getAvailableNeighbors, getAvailableNeighborsGrid } from "../helpers"

/**
 * Run breadth first search on the given maze.
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveBFSRaw = (rawMaze, start, goal) => {
	// Create a matrix to store the parent indices
	// of each cell (for backtracking)
	const cameFrom = createFilledMatrix(rawMaze.length, rawMaze[0].length, undefined)

	// Reset the original maze's visited flags
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			rawMaze[row][col] &= ~Visited
		}
	}

	const cellsQueue = [start]

	while (cellsQueue.length > 0) {
		const currentCellIndex = cellsQueue.shift()

		// Return the complete path when we reach the goal
		if (currentCellIndex[0] === goal[0] && currentCellIndex[1] === goal[1])
			return reconstructPath(cameFrom, currentCellIndex)

		// Mark the current cell as visited
		rawMaze[currentCellIndex[0]][currentCellIndex[1]] |= Visited

		// Find all reachable, unvisited neighbors
		const availableNeighbors = getAvailableNeighbors(
			currentCellIndex,
			rawMaze
		).filter((neighbor) => !cellIs(Visited, cellAt(neighbor, rawMaze)))

		// Visit all neighbors and link all of the 
		// unvisited neighbors to the current node
		availableNeighbors.forEach(([row, col]) => {
			cameFrom[row][col] = currentCellIndex
			rawMaze[row][col] |= Visited
		})

		cellsQueue.push(...availableNeighbors)
	}

    // No solution found
    return []
}

/**
 * Run breadth first search on the given maze.
 *
 * @param {number[][]} gridMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveBFSGrid = (gridMaze, start, goal) => {
	// Create a matrix to store the parent indices
	// of each cell (for backtracking)
	const cameFrom = createFilledMatrix(gridMaze.length, gridMaze[0].length, undefined)

	// Create a matrix to store which cells have been visited
	const visited = createFilledMatrix(
		gridMaze.length,
		gridMaze[0].length,
		false
	)

	const cellsQueue = [start]

	while (cellsQueue.length > 0) {
		const currentCellIndex = cellsQueue.shift()

		// Return the complete path when we reach the goal
		if (currentCellIndex[0] === goal[0] && currentCellIndex[1] === goal[1])
			return reconstructPath(cameFrom, currentCellIndex)

		// Mark the current cell as visited
		visited[currentCellIndex[0]][currentCellIndex[1]] = true

		// Find all reachable, unvisited neighbors
		const availableNeighbors = getAvailableNeighborsGrid(
			currentCellIndex,
			gridMaze
		).filter((neighbor) => !cellAt(neighbor, visited))

		// Visit all neighbors and link all of the 
		// unvisited neighbors to the current node
		availableNeighbors.forEach(([row, col]) => {
			cameFrom[row][col] = currentCellIndex
			visited[row][col] = true
		})

		cellsQueue.push(...availableNeighbors)
	}

    // No solution found
    return []
}

const reconstructPath = (cameFrom, currentIndex) => {
	const totalPath = [currentIndex]

	// Backtrack through the cameFrom map to rebuild the path
	while (cameFrom[currentIndex[0]][currentIndex[1]] !== undefined) {
		currentIndex = cameFrom[currentIndex[0]][currentIndex[1]]
		totalPath.unshift(currentIndex)
	}

	return totalPath
}
