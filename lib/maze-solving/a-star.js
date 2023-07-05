import { createMinHeap } from "../data-structures/min-heap"
import { getAvailableNeighbors, parseUnique, unique } from "../helpers"

/**
 * Run A* on a maze, given the start and end positions.
 * A custom heuristic can be provided optionally.
 *
 * Based on the implementation on Wikipedia:
 * https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
 *
 * @param {number[]} start
 * @param {number[]} goal
 * @param {Function} h The heuristic method to use
 * @param {number} edgeCost The cost of each edge in the maze
 */
export const solveAStar = (rawMaze, start, goal, h = hypotHeuristic, edgeCost = 1) => {
	const cameFrom = new Map()

	// Stores the cost of the cheapest path from start
	// to a given node (default Infinity)
	const gScores = new Map()
	gScores.set(unique(start), 0)

	// f = g(node) + h(node)
	// Best guess of the cost of taking a path through a given node
	// (default Infinity)
	const fScores = new Map()
	fScores.set(unique(start), h(start, goal))

	// Create a min heap that sorts by f score
	const openSet = createMinHeap(getFScoreValue)
	openSet.insert(createNode(start, fScores.get(unique(start))))

	while (!openSet.isEmpty()) {
		const current = openSet.getMin()

		// Reconstruct the path from the end to the start
		if (unique(current.index) === unique(goal))
			return reconstructPath(cameFrom, current.index)

		openSet.extractMin()

		for (const neighbor of getAvailableNeighbors(current.index, rawMaze)) {
			const tentativeGScore =
				gScores.get(unique(current.index)) + edgeCost

			// Record a better path if one has been found
			if (tentativeGScore < (gScores.get(unique(neighbor)) ?? Infinity)) {
				const uniqueNeighbor = unique(neighbor)
				cameFrom.set(uniqueNeighbor, unique(current.index))
				gScores.set(uniqueNeighbor, tentativeGScore)
				fScores.set(uniqueNeighbor, tentativeGScore + h(neighbor, goal))

				if (
					!openSet.hasElement(
						neighbor,
						(e1, e2) => unique(e1) === unique(e2.index)
					)
				)
					openSet.insert(
						createNode(neighbor, fScores.get(uniqueNeighbor))
					)
			}
		}
	}

	// No path could be found
	return []
}

const reconstructPath = (cameFrom, currentIndex) => {
	const totalPath = [currentIndex]

	// Backtrack through the cameFrom map to rebuild the path
	while (cameFrom.has(unique(currentIndex))) {
		currentIndex = parseUnique(cameFrom.get(unique(currentIndex)))
		totalPath.unshift(currentIndex)
	}

	return totalPath
}

const createNode = (index, fScore) => ({ index, fScore })
const getFScoreValue = (node) => node.fScore

/////////// Prebuilt Heuristics ///////////

export const hypotHeuristic = ([row, col], [neighborRow, neighborCol]) => {
	return Math.hypot(neighborRow - row, neighborCol - col)
}

export const gridHeuristic = ([row, col], [neighborRow, neighborCol]) => {
	return Math.abs(neighborRow - row) + Math.abs(neighborCol - col)
}

