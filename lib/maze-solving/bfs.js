import { Visited, getUnvisitedNeighbors } from "../helpers"

/**
 * Run breadth first search on the given maze.
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveBFS = (rawMaze, start, goal) => {
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

	const cellsQueue = [start]

	while (cellsQueue.length > 0) {
		const currentCellIndex = cellsQueue.shift()

		// Return the complete path when we reach the goal
		if (currentCellIndex[0] === goal[0] && currentCellIndex[1] === goal[1])
			return reconstructPath(cameFrom, currentCellIndex)

		// Mark the current cell as visited
		rawMaze[currentCellIndex[0]][currentCellIndex[1]] |= Visited

		const unvisitedNeighbors = getUnvisitedNeighbors(
			currentCellIndex,
			rawMaze
		)

		// Visit all neighbors and link all of the 
		// unvisited neighbors to the current node
		unvisitedNeighbors.forEach(([row, col]) => {
			cameFrom[row][col] = currentCellIndex
			rawMaze[row][col] |= Visited
		})

		cellsQueue.push(...unvisitedNeighbors)
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
