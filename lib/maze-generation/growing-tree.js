// Cell Constants
// Format:
// 11111
// Visited, North, South, East, West

import { Visited, chooseRandom, chooseRandomIndex, getUnvisitedNeighbors, removeWall } from "../helpers"

/**
 * Generate a maze using the growing tree algorithm.
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateMazeGrowingTree = (rows, cols, growMethod = GrowingTreeMethod.prim) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = [...Array(rows)].map((_) => Array(cols).fill(0b01111))

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

    // Pick a random cell from cells
	const randomCell = [
		chooseRandomIndex(rows),
		chooseRandomIndex(cols),
	]

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
 * Contains multiple methods for running the growing tree algorithm
 */
export const GrowingTreeMethod = {
    backtracking: (size) => size - 1,
    prim: (size) => chooseRandomIndex(size)
}