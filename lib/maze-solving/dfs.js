import { Visited, cellAt, cellIs, getAvailableNeighbors, getUnvisitedNeighbors } from "../helpers"

/**
 * Run depth first search on the given maze.
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveDFS = (rawMaze, start, goal) => {
	// Create a matrix to store the parent indices
	// of each cell (for backtracking)
	const cameFrom = Array.from(
		{ length: rawMaze.length },
		() => new Array(rawMaze[0].length)
	)

	// Reset the original maze's visited flags
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			rawMaze[row][col] &= ~Visited
		}
	}

	const cellsStack = [start]

	while (cellsStack.length > 0) {
		const currentCellIndex = cellsStack.pop()

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

		// Link all of the unvisited neighbors to the current node
		availableNeighbors.forEach(([row, col]) => {
			cameFrom[row][col] = currentCellIndex
		})

		cellsStack.push(...availableNeighbors)
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
