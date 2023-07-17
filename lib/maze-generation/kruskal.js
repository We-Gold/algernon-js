import { createDisjointSet } from "../data-structures/disjoint-set"
import {
	createFilledMatrix,
	removeWall,
	removeWallGrid,
	shuffleArray,
} from "../helpers"

/**
 * Generate a maze using Kruskal's algorithm.
 * Given the nature of the algorithm, there is no way to
 * start in a specific location.
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateKruskalRaw = (rows, cols) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = createFilledMatrix(rows, cols, 0b01111)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	const disjointSet = createDisjointSet()

	const walls = []

	// Add all cells to the disjoint set and store all walls
	for (let row = 0; row < cells.length; row++) {
		for (let col = 0; col < cells[row].length; col++) {
			disjointSet.makeSet([row, col])

			// Store all walls (cell to neighbor pairs)
			if (row > 0)
				walls.push([
					[row, col],
					[row - 1, col],
				]) // North wall
			if (row < cells.length - 1)
				walls.push([
					[row, col],
					[row + 1, col],
				]) // South wall
			if (col > 0)
				walls.push([
					[row, col],
					[row, col - 1],
				]) // West wall
			if (col < cells[row].length - 1)
				walls.push([
					[row, col],
					[row, col + 1],
				]) // East wall
		}
	}

	// Shuffle the order of the walls
	shuffleArray(walls)

	// Join cells together randomly until all cells are connected
	for (const [cell1, cell2] of walls) {
		const set1 = disjointSet.findSet(cell1)
		const set2 = disjointSet.findSet(cell2)

		// Connect previously unconnected cells together
		if (set1 !== set2) {
			removeWall(cell1, cell2, cells)

			disjointSet.unionSets(cell1, cell2)
		}
	}

	return cells
}

/**
 * Generate a maze using Kruskal's algorithm.
 * Given the nature of the algorithm, there is no way to
 * start in a specific location.
 *
 * Due to the nature of the algorithm, odd maze sizes (e.g. 19x19),
 * are required, and even dimensions will simply include a buffer
 * of walls on the bottom and right edges.
 *
 * @param {number} rows The number of rows in the maze
 * @param {number} cols The number of columns in the maze
 * @returns {boolean[][]} The generated maze in occupancy grid format
 */
export const generateKruskalGrid = (rows, cols) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = createFilledMatrix(rows, cols, true)

	// Verify that the dimensions are valid
	if (cols <= 0 || rows <= 0) return cells

	const disjointSet = createDisjointSet()

	const walls = []

	// Add all cells to the disjoint set and store all walls
	for (let row = 0; row < cells.length; row += 2) {
		for (let col = 0; col < cells[row].length; col += 2) {
			disjointSet.makeSet([row, col])

			// Store all walls (cell to neighbor pairs)
			if (row > 1)
				walls.push([
					[row, col],
					[row - 2, col],
				]) // North wall
			if (row < cells.length - 2)
				walls.push([
					[row, col],
					[row + 2, col],
				]) // South wall
			if (col > 1)
				walls.push([
					[row, col],
					[row, col - 2],
				]) // West wall
			if (col < cells[row].length - 2)
				walls.push([
					[row, col],
					[row, col + 2],
				]) // East wall
		}
	}

	// Shuffle the order of the walls
	shuffleArray(walls)

	// Join cells together randomly until all cells are connected
	for (const [cell1, cell2] of walls) {
		const set1 = disjointSet.findSet(cell1)
		const set2 = disjointSet.findSet(cell2)

		// Connect previously unconnected cells together
		if (set1 !== set2) {
			// Open the current cell
			cells[cell1[0]][cell1[1]] = false

			// Remove the wall
			removeWallGrid(cell1, cell2, cells)

			// Open the neighbor cell
			cells[cell2[0]][cell2[1]] = false

			disjointSet.unionSets(cell1, cell2)
		}
	}

	return cells
}
