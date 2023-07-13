import { createMinHeap } from "../data-structures/min-heap"
import { createFilledMatrix, getAvailableNeighbors } from "../helpers"
import { manhattanHeuristic, euclideanHeuristic } from "./heuristics"

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
	const cameFrom = createFilledMatrix(rawMaze.length, rawMaze[0].length, undefined)

	// Stores the cost of the cheapest path from start
	// to a given node (default Infinity)
	const gScores = createFilledMatrix(rawMaze.length, rawMaze[0].length, Infinity)
	gScores[start[0]][start[1]] = 0

	// f = g(node) + h(node)
	// Best guess of the cost of taking a path through a given node
	// (default Infinity)
	const fScores = createFilledMatrix(rawMaze.length, rawMaze[0].length, Infinity)
	fScores[start[0]][start[1]] = h(start, goal)

	// Create a min heap that sorts by f score
	const openSet = createMinHeap(compareKeys, compareValues)
	openSet.insert(createNode(start, fScores[start[0]][start[1]]))

	while (!openSet.isEmpty()) {
		const current = openSet.getMin()

		// Reconstruct the path from the end to the start
		if (current.index[0] === goal[0] && current.index[1] === goal[1])
			return reconstructPath(cameFrom, current.index)

		openSet.extractMin()

		for (const neighbor of getAvailableNeighbors(current.index, rawMaze)) {
			const tentativeGScore =
				gScores[current.index[0]][current.index[1]] + edgeCost

			// Record a better path if one has been found
			if (tentativeGScore < gScores[neighbor[0]][neighbor[1]]) {
				// Store a path from the neighbor back to the current cell
				cameFrom[neighbor[0]][neighbor[1]] = current.index

				gScores[neighbor[0]][neighbor[1]] = tentativeGScore
				fScores[neighbor[0]][neighbor[1]] =
					tentativeGScore + h(neighbor, goal)

				if (!openSet.hasKey(createNode(neighbor, 0)))
					openSet.insert(
						createNode(neighbor, fScores[neighbor[0]][neighbor[1]])
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
	while (cameFrom[currentIndex[0]][currentIndex[1]] !== undefined) {
		currentIndex = cameFrom[currentIndex[0]][currentIndex[1]]
		totalPath.unshift(currentIndex)
	}

	return totalPath
}

const createNode = (index, fScore) => ({ index, fScore })

const compareKeys = (node1, node2) =>
	node1.index[0] === node2.index[0] && node1.index[1] === node2.index[1]

const compareValues = (node1, node2) => node1.fScore - node2.fScore
