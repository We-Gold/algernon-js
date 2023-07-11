import { Visited, cellAt, cellIs, getAvailableNeighbors } from "../helpers"
import { manhattanHeuristic, euclideanHeuristic } from "./heuristics"

/**
 * Contains multiple heuristics for the A* algorithm
 */
export const ACOHeuristic = {
	euclidean: euclideanHeuristic,
	manhattan: manhattanHeuristic,
}

const defaultACOConfig = {
	heuristic: ACOHeuristic.euclidean,
	numberOfAnts: 10,
	evaporationRate: 0.1,
	pheromoneDeposit: 1,
	maxIterations: 100000,
}

/**
 * Run Ant Colony Optimization on a maze. This produces an approximate
 * solution (not always ideal).
 *
 * @param {number[][]} rawMaze The maze to search through
 * @param {number[]} start The starting point of the search
 * @param {number[]} goal The final point of the search
 * @param config
 * @returns {number[][]} An array of 2d indices [[x, y], ...] corresponding to the path
 */
export const solveACO = (rawMaze, start, goal, config = defaultACOConfig) => {
	// Handle missing or incomplete configuration
	config = { ...defaultACOConfig, ...config }

	// Initialize the pheromone concentration of all cells to 0
	const pheromoneMatrix = [...Array(rawMaze.length)].map((_) =>
		Array(rawMaze[0].length).fill(0)
	)

	// Reset the original maze's visited flags
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			rawMaze[row][col] &= ~Visited
		}
	}

	const ants = []
	const visitedStacks = []

	// Initialize all ants to the start position
	for (let ant = 0; ant < config.numberOfAnts; ant++) {
		ants.push(start.slice())
		visitedStacks.push([])
	}

	for (let iteration = 0; iteration < config.maxIterations; iteration++) {
		for (let antIndex = 0; antIndex < ants.length; antIndex++) {
			const [antRow, antCol] = ants[antIndex]

			// Mark the current node as visited
			rawMaze[antRow][antCol] |= Visited

			// Reconstruct the final path
			if (antRow === goal[0] && antCol === goal[1]) {
				visitedStacks[antIndex].push([antRow, antCol])
				return visitedStacks[antIndex]
			}

			// Find all reachable, unvisited neighbors
			const availableNeighbors = getAvailableNeighbors(
				ants[antIndex],
				rawMaze
			).filter((neighbor) => !cellIs(Visited, cellAt(neighbor, rawMaze)))

			// Backtrack the ant if there are no available moves
			if (availableNeighbors.length === 0) {
				const [prevRow, prevCol] = backtrack(visitedStacks[antIndex])
				ants[antIndex] = [prevRow, prevCol]
				continue
			}

			const nextMove = selectAntMove(
				ants[antIndex],
				availableNeighbors,
				pheromoneMatrix,
				config.heuristic,
				goal
			)

			ants[antIndex] = nextMove

			// Push the current cell onto the stack
			visitedStacks[antIndex].push([antRow, antCol])
		}

		updateAntPheromones(
			config.evaporationRate,
			config.pheromoneDeposit,
			ants,
			pheromoneMatrix
		)
	}

	// No solution found
	return []
}

const selectAntMove = (
	antNode,
	availableNeighbors,
	pheromoneMatrix,
	heuristic,
	goal
) => {
	let totalPheromone = 0
	const potentialMoves = []

	// Count the total pheromone of all of the available neighbors
	for (const neighbor of availableNeighbors)
		totalPheromone += cellAt(neighbor, pheromoneMatrix)

	for (const neighbor of availableNeighbors) {
		const heuristicValue = heuristic(antNode, goal)

		// Calculate the probability of selecting the current neighbor
		// while preventing any accidental division by zero
		const probability =
			cellAt(neighbor, pheromoneMatrix) /
			(totalPheromone + heuristicValue)

		potentialMoves.push({ move: neighbor, probability })
	}

	potentialMoves.sort((a, b) => b.probability - a.probability)

	// Normalize probabilities so they add up to 1
	const totalProbability = potentialMoves.reduce(
		(total, move) => total + move.probability,
		0
	)
	for (const move of potentialMoves) {
		move.probability /= totalProbability
	}

	const randomValue = Math.random()
	let cumulativeProbability = 0

	// Find a move that matches the random number with the appropriate probability
	for (const potentialMove of potentialMoves) {
		cumulativeProbability += potentialMove.probability
		if (randomValue <= cumulativeProbability) return potentialMove.move
	}

	return potentialMoves[potentialMoves.length - 1].move
}

const updateAntPheromones = (
	evaporationRate,
	pheromoneDeposit,
	ants,
	pheromoneMatrix
) => {
	// Update all pheromone levels due to evaporation
	for (let row = 0; row < pheromoneMatrix.length; row++) {
		for (let col = 0; col < pheromoneMatrix[row].length; col++) {
			pheromoneMatrix[row][col] *= 1 - evaporationRate
		}
	}

	for (const ant of ants) {
		pheromoneMatrix[ant[0]][ant[1]] += pheromoneDeposit
	}
}

const backtrack = (visitedStack) => visitedStack.pop()
