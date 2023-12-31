import { createMinHeap } from "../data-structures/min-heap"
import {
	cellIs,
	createFilledMatrix,
	getAvailableNeighbors,
	getDirection,
} from "../helpers"
import { manhattanHeuristic, euclideanHeuristic } from "./heuristics"

/**
 * @typedef {import("./heuristics").heuristic} heuristic
 */

/**
 * Contains multiple heuristics for the D* Lite algorithm
 */
export const DStarLiteHeuristic = {
	euclidean: euclideanHeuristic,
	manhattan: manhattanHeuristic,
}

/**
 * @typedef DStarLiteResult
 * @property {number[][]} path
 * @property {solveMethod} solve
 */

/**
 * @typedef UpdatedMazeInformation
 * @property {number[][]} updatedCellIndices The indices of any updated cells
 * @property {number[]} originalCellValues The previous values stored in any updated cells
 */


/**
 * Solve the given maze or replan based on changed nodes
 * or a different start position.
 *
 * It is assumed that any modifications are made in-place to the
 * original maze.
 *
 * @callback solveMethod
 * @param {number[]} startCell The current cell to plan from
 * @param {UpdatedMazeInformation} [updatedMazeInformation] Information about any changes to the maze
 * @returns {number[][]} The solution path as an array of indices
 */

/**
 * Run D* Lite on a maze, given the start and end positions.
 * A custom heuristic can be provided optionally.
 *
 * D* Lite is most useful in situations where the maze can change.
 *
 * By default, it returns only a static solution, however you may set
 * exposeSolveMethod to true to return both the solution and
 * a method to update the maze and solution.
 *
 * Based on the original implementation:
 * https://cdn.aaai.org/AAAI/2002/AAAI02-072.pdf
 *
 * And based on sections adapted to this codebase from:
 * https://github.com/Sollimann/Dstar-lite-pathplanner/tree/master
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @param {boolean} [exposeSolveMethod] Whether or not to expose internal the solve method
 * @param {heuristic} [h] The heuristic method to use
 * @returns {number[][]|DStarLiteResult} An array of 2d indices [[x, y], ...] corresponding to the path (or the full api)
 */
export const solveDStarLite = (
	rawMaze,
	start,
	goal,
	exposeSolveMethod = false,
	h = DStarLiteHeuristic.manhattan
) => {
	let last = start

	let kM = 0

	const U = createMinHeap(comparePriority, { k1: -Infinity, k2: -Infinity })

	const rhs = createFilledMatrix(rawMaze.length, rawMaze[0].length, Infinity)
	const g = createFilledMatrix(rawMaze.length, rawMaze[0].length, Infinity)

	// Initialize the rhs at the goal to 0
	rhs[goal[0]][goal[1]] = 0

	U.insert(goal, { k1: h(start, goal), k2: 0 })

	const calculateKey = ([row, col]) => {
		const k2 = Math.min(g[row][col], rhs[row][col])
		const k1 = k2 + h(start, [row, col]) + kM

		return { k1, k2 }
	}

	// Calculates the cost between two cells
	const cost = (cell1, cell2) => {
		// Determine if there is a wall between the two cells
		const hasPathBetweenCells = !cellIs(
			getDirection(cell1, cell2),
			rawMaze[cell1[0]][cell1[1]]
		)

		if (hasPathBetweenCells) return h(cell1, cell2)
		else return Infinity
	}

	const updateNode = ([row, col]) => {
		const uHasKey = U.hasKey([row, col])

		if (g[row][col] !== rhs[row][col] && uHasKey) {
			U.modifyKey(U.findKeyIndex([row, col]), calculateKey([row, col]))
		} else if (g[row][col] !== rhs[row][col] && !uHasKey) {
			U.insert([row, col], calculateKey([row, col]))
		} else if (g[row][col] === rhs[row][col] && uHasKey) {
			U.deleteKey(U.findKeyIndex([row, col]))
		}
	}

	const computeShortestPath = () => {
		while (
			comparePriority(U.getMin().value, calculateKey(start)) < 0 ||
			rhs[start[0]][start[1]] > g[start[0]][start[1]]
		) {
			const u = U.getMin()
			const kOld = u.value
			const kNew = calculateKey(u.key)

			const [uRow, uCol] = u.key

			if (comparePriority(kOld, kNew) < 0) {
				// Update the min heap if the priority of the min has changed
				U.modifyKey(U.findKeyIndex(u.key), { k1: kNew.k1, k2: kNew.k2 })
			} else if (g[uRow][uCol] > rhs[uRow][uCol]) {
				// Set g equal to rhs when there is an inconsistency
				g[uRow][uCol] = rhs[uRow][uCol]
				U.deleteKey(U.findKeyIndex(u.key))

				const availableNeighbors = getAvailableNeighbors(u.key, rawMaze)

				// Update the rhs of all neighbors
				for (const neighbor of availableNeighbors) {
					if (neighbor[0] !== goal[0] || neighbor[1] !== goal[1]) {
						rhs[neighbor[0]][neighbor[1]] = Math.min(
							rhs[neighbor[0]][neighbor[1]],
							cost(u.key, neighbor) + g[uRow][uCol]
						)
					}

					updateNode(neighbor)
				}
			} else {
				const gOld = g[uRow][uCol]
				g[uRow][uCol] = Infinity

				const availableNeighbors = getAvailableNeighbors(u.key, rawMaze)
				availableNeighbors.push(u.key)

				for (const cell of availableNeighbors) {
					const [row, col] = cell
					if (rhs[row][col] === cost(cell, u.key) + gOld) {
						if (row !== goal[0] || col !== goal[1]) {
							const cellNeighbors = getAvailableNeighbors(
								cell,
								rawMaze
							)

							// Calculate the min potential rhs of all neighbors
							const minPotentialRHS =
								cellNeighbors.length === 0
									? Infinity
									: Math.min(
											cellNeighbors.map(
												(cellNeighbor) =>
													cost(cell, cellNeighbor) +
													g[cellNeighbor[0]][
														cellNeighbor[1]
													]
											)
									  )

							rhs[row][col] = minPotentialRHS
						}
					}

					updateNode(u.key)
				}
			}
		}
	}

	/**
	 * @type {solveMethod}
	 */
	const solve = (
		startCell,
		{ updatedCellIndices, originalCellValues } = {}
	) => {
		const path = [startCell]
		start = startCell
		last = start
		computeShortestPath()

		while (start[0] !== goal[0] || start[1] !== goal[1]) {
			if (rhs[start[0]][start[1]] === Infinity) return [] // There is no path

			let min = Infinity
			let minIndex = null

			for (const cell of getAvailableNeighbors(start, rawMaze)) {
				const potential = cost(start, cell) + g[cell[0]][cell[1]]

				if (potential < min) {
					min = potential
					minIndex = cell
				}
			}

			start = minIndex
			path.push(start)

			// Handle any cells that have been modified
			if (updatedCellIndices) {
				kM += h(last, start)
				last = start

				// Consider all cells that have changed
				for (const [i, cell] of updatedCellIndices.entries()) {
					for (const cellNeighbor of getAvailableNeighbors(
						cell,
						rawMaze
					)) {
						const [uRow, uCol] = cellNeighbor

						const cNew = cost(cell, cellNeighbor)

						// Calculate the old cost
						const newCellValue = rawMaze[cell[0]][cell[1]]
						rawMaze[cell[0]][cell[1]] = originalCellValues[i]
						const cOld = cost(cell, cellNeighbor)
						rawMaze[cell[0]][cell[1]] = newCellValue

						// Consider this cell as it now has a lower cost than before
						if (cOld > cNew)
							if (uRow !== goal[0] || uCol !== goal[1])
								rhs[uRow][uCol] = Math.min(
									rhs[uRow][uCol],
									cNew + g[cell[0]][cell[1]]
								)
							else if (
								rhs[uRow][uCol] ==
								cOld + g[cell[0]][cell[1]]
							) {
								if (uRow !== goal[0] || uCol !== goal[1]) {
									min = Infinity

									for (const _neighbor of getAvailableNeighbors(
										cellNeighbor,
										rawMaze
									)) {
										const potential =
											cost(cellNeighbor, _neighbor) +
											g[_neighbor[0]][_neighbor[1]]

                                        if (min > potential)
                                            min = potential
									}

                                    rhs[uRow][uCol] = min
								}

                                updateNode(cellNeighbor)
							}
					}
				}
			}

			computeShortestPath()
		}

		return path
	}

	const initialSolution = solve(start)

	if (exposeSolveMethod) return { path: initialSolution, solve }
	else return initialSolution
}

const comparePriority = (priority1, priority2) => {
	const primaryDifference = priority1.k1 - priority2.k1

	// Account for any ties
	if (primaryDifference === 0) return priority1.k2 - priority2.k2

	return primaryDifference
}
