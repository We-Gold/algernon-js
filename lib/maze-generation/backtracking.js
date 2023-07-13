// Cell Constants
// Format:
// 11111
// Visited, North, South, East, West

import { Visited, chooseRandom, createFilledMatrix, getUnvisitedNeighbors, removeWall } from "../helpers"

/**
 * Generate a maze using backtracking, assuming that
 * the top left is the start and bottom right is the end
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @param {number[]} [start] The starting point of the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateMazeBacktracking = (rows, cols, start = [0, 0]) => {
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
