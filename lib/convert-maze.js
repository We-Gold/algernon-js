import { East, North, South, Visited, West, cellAt, cellIs } from "./helpers"

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
 * @property {boolean} isStart
 * @property {boolean} isEnd
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
 * @param {number[]} end The index of the ending point
 * @returns {GraphNode} The start node of the maze
 */
export const convertRawToNodeGraph = (rawMaze, start, end) => {
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

			// Mark as not being the start or end
			node.isStart = false
			node.isEnd = false
		}
	}

	// Mark start and end nodes
	nodeMatrix[start[0]][start[1]].isStart = true
	nodeMatrix[end[0]][end[1]].isEnd = true

	return cellAt(start, nodeMatrix)
}

/**
 * Convert the node matrix to a raw maze, which is required for serialization.
 *
 * @param {MatrixNode[][]} nodeMatrix The maze stored as a matrix of nodes
 * @returns {number[][]} The raw maze stored as a matrix of binary numbers
 */
export const convertNodeMatrixToRaw = (nodeMatrix) => {
	return nodeMatrix.map((row) => {
		return row.map(
			(node) =>
				(node.hasNorthWall << 3) |
				(node.hasSouthWall << 2) |
				(node.hasEastWall << 1) |
				node.hasWestWall
		)
	})
}

/**
 * Convert a raw maze to a binary buffer.
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @returns {Uint8Array} The maze converted to a binary buffer
 */
export const serializeRawToBinary = (rawMaze) => {
	const metadataSize = 8 // Rows and cols stored in 4 bytes each
	const matrixSize = rawMaze.length * rawMaze[0].length // Each cell represented by a single byte
	const totalSize = metadataSize + matrixSize
	const buffer = new Uint8Array(totalSize)

	// Serialize metadata (rows and cols) into the first 8 bytes of the buffer
	new DataView(buffer.buffer).setUint32(0, rawMaze.length, true)
	new DataView(buffer.buffer).setUint32(4, rawMaze[0].length, true)

	let index = metadataSize

	// Store each cell in the buffer in binary
	// (visited is removed since the data is unnecessary)
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[0].length; col++) {
			const cell = rawMaze[row][col]
			buffer[index++] = cell & ~Visited
		}
	}

	return buffer
}

/**
 * Load a raw maze from a binary buffer.
 *
 * @param {Uint8Array} buffer The maze as a binary buffer
 * @returns {number[][]} The raw maze stored as a matrix of binary numbers
 */
export const deserializeBinaryToRaw = (buffer) => {
	const metadataSize = 8 // Rows and cols stored in 4 bytes each

	// Deserialize metadata (rows and cols) from the first 8 bytes of the buffer
	const rows = new DataView(buffer.buffer).getUint32(0, true)
	const cols = new DataView(buffer.buffer).getUint32(4, true)

	const rawMaze = [...Array(rows)].map((_) => Array(cols).fill(0))

	let index = metadataSize

	// Store all cells from the buffer in a matrix
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const cell = buffer[index++]
			rawMaze[row][col] = cell
		}
	}

	return rawMaze
}

/**
 * Convert a raw maze to a base 64 string.
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @returns {string} The maze converted to a base 64 string
 */
export const serializeRawToString = (rawMaze) => {
	// Convert the raw maze to binary
	const binaryMaze = serializeRawToBinary(rawMaze)

	// Convert the binary maze to a string
	const binaryString = String.fromCharCode.apply(null, binaryMaze)

	// Convert the binary string to base 64
	const base64Maze = btoa(binaryString)

	return base64Maze
}

/**
 * Convert a base 64 string to a raw maze
 *
 * @param {string} base64Maze The raw maze stored as a base 64 string
 * @returns {number[][]} The maze stored as a binary matrix
 */
export const deserializeStringToRaw = (base64Maze) => {
	// Convert the base 64 maze to a binary string
	const binaryString = atob(base64Maze)

	// Convert the binary string to a Uint8Array
	const binaryMaze = new Uint8Array(binaryString.length)
	for (let i = 0; i < binaryString.length; i++) {
		binaryMaze[i] = binaryString.charCodeAt(i)
	}

    return deserializeBinaryToRaw(binaryMaze)
}
