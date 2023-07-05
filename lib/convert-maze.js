import { East, North, South, West, cellAt, cellIs } from "./helpers"

/**
 * @typedef MatrixNode
 * @property {boolean} hasNorthWall
 * @property {boolean} hasSouthWall
 * @property {boolean} hasEastWall
 * @property {boolean} hasWestWall
 */

/**
 * Convert the raw maze to a node matrix, which can be more convenient
 * to work with, especially when the shape of the maze is important.
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @returns {MatrixNode[][]} The maze converted to a matrix of nodes
 */
export const convertRawToNodeMatrix = (rawMaze) => {
	return rawMaze.map((row) => {
		return row.map((cellBinary) => createMatrixNode(cellBinary))
	})
}

const createMatrixNode = (cellBinary) => ({
	hasNorthWall: cellIs(North, cellBinary),
	hasSouthWall: cellIs(South, cellBinary),
	hasEastWall: cellIs(East, cellBinary),
	hasWestWall: cellIs(West, cellBinary),
})

/**
 * @typedef GraphNode
 * @property {boolean} hasNorthWall
 * @property {boolean} hasSouthWall
 * @property {boolean} hasEastWall
 * @property {boolean} hasWestWall
 * @property {GraphNode|null} northNeighbor
 * @property {GraphNode|null} southNeighbor
 * @property {GraphNode|null} eastNeighbor
 * @property {GraphNode|null} westNeighbor
 */

/**
 * Convert the raw maze to a node graph, which can be more convenient
 * to work with, especially when the relationships between nodes are important.
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @param {number[]} start The index of the starting point
 * @returns {GraphNode} The start node of the maze
 */
export const convertRawToNodeGraph = (rawMaze, start) => {
	const nodeMatrix = convertRawToNodeMatrix(rawMaze)

	// Store references to all neighbors for all nodes
	for (const [i, row] of nodeMatrix.entries()) {
		for (const [j, node] of row.entries()) {
            // Include any accessible neighboring nodes
			node.northNeighbor = !node.hasNorthWall
				? nodeMatrix?.[i - 1]?.[j] ?? null
				: null
			node.southNeighbor = !node.hasSouthWall
				? nodeMatrix?.[i + 1]?.[j] ?? null
				: null
			node.eastNeighbor = !node.hasEastWall
				? nodeMatrix?.[i]?.[j + 1] ?? null
				: null
			node.westNeighbor = !node.hasWestWall
				? nodeMatrix?.[i]?.[j - 1] ?? null
				: null
		}
	}

	return cellAt(start, nodeMatrix)
}
