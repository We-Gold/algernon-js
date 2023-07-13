import { createMinHeap } from "../data-structures/min-heap"
import { createFilledMatrix, getAvailableNeighbors } from "../helpers"
import { manhattanHeuristic, euclideanHeuristic } from "./heuristics"

/**
 * @typedef {import("./heuristics").heuristic} heuristic
 */

/**
 * Contains multiple heuristics for the A* algorithm
 */
export const AStarHeuristic = {
	euclidean: euclideanHeuristic,
	manhattan: manhattanHeuristic,
}

/**
 * Run A* on a maze, given the start and end positions.
 * A custom heuristic can be provided optionally.
 *
 * Based on the implementation on Wikipedia:
 * https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @param {heuristic} [h] The heuristic method to use
 * @param {number} [edgeCost] The cost of each edge in the maze
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveAStar = (
	rawMaze,
	start,
	goal,
	h = AStarHeuristic.euclidean,
	edgeCost = 1
) => {
	const cameFrom = createFilledMatrix(
		rawMaze.length,
		rawMaze[0].length,
		undefined
	)

	// Stores the cost of the cheapest path from start
	// to a given node (default Infinity)
	const gScores = createFilledMatrix(
		rawMaze.length,
		rawMaze[0].length,
		Infinity
	)
	gScores[start[0]][start[1]] = 0

	// f = g(node) + h(node)
	// Best guess of the cost of taking a path through a given node
	// (default Infinity)
	const fScores = createFilledMatrix(
		rawMaze.length,
		rawMaze[0].length,
		Infinity
	)
	fScores[start[0]][start[1]] = h(start, goal)

	// Create a min heap that sorts by f score
	const openSet = createMinHeap(compareValues)
	openSet.insert(start, fScores[start[0]][start[1]])

	while (!openSet.isEmpty()) {
		const current = openSet.getMin()

		// Reconstruct the path from the end to the start
		if (current.key[0] === goal[0] && current.key[1] === goal[1])
			return reconstructPath(cameFrom, current.key)

		openSet.extractMin()

		for (const neighbor of getAvailableNeighbors(current.key, rawMaze)) {
			const tentativeGScore =
				gScores[current.key[0]][current.key[1]] + edgeCost

			// Record a better path if one has been found
			if (tentativeGScore < gScores[neighbor[0]][neighbor[1]]) {
				// Store a path from the neighbor back to the current cell
				cameFrom[neighbor[0]][neighbor[1]] = current.key

				gScores[neighbor[0]][neighbor[1]] = tentativeGScore
				fScores[neighbor[0]][neighbor[1]] =
					tentativeGScore + h(neighbor, goal)

				if (!openSet.hasKey(neighbor))
					openSet.insert(neighbor, fScores[neighbor[0]][neighbor[1]])
			}
		}
	}

	// No path could be found
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

const compareValues = (val1, val2) => val1 - val2
