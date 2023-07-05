// Cell Constants
// Format:
// 11111
// Visited, North, South, East, West

import { createDisjointSet } from "../data-structures/disjoint-set"
import { removeWall, shuffleArray } from "../helpers"

/**
 * Generate a maze using Kruskal's algorithm.
 * Given the nature of the algorithm, there is no way to 
 * start in a specific location.
 * 
 * @param {number} w The number of columns in the maze
 * @param {number} h The number of rows in the maze
 * @returns {number[][]} The generated maze in raw binary format
 */
export const generateMazeKruskal = (w, h) => {
	// Initialize all cells, each with all walls and being unvisited
	const cells = [...Array(h)].map((_) => Array(w).fill(0b01111))

	// Verify that the dimensions are valid
	if (w <= 0 || h <= 0) return cells

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