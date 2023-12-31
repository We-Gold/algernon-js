import {
	East,
	North,
	South,
	Visited,
	West,
	cellAt,
	cellIs,
	chooseRandom,
	createFilledMatrix,
	removeWall,
	removeWallGrid,
} from "./helpers"

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
 * Convert a node grap to a raw maze, which is required for most methods
 * in this library.
 *
 * @param {GraphNode} nodeGraph The starting node of the node graph
 * @param {number[]} startIndex The position of the starting node in the maze [row, col]
 * @returns {number[][]} The output raw maze
 */
export const convertNodeGraphToRaw = (nodeGraph, startIndex) => {
	let maxRow = 0
	let maxCol = 0

	const labelNodesStack = [[nodeGraph, startIndex]]

	// Label all nodes with indices
	while (labelNodesStack.length > 0) {
		const [node, index] = labelNodesStack.pop()

		// Skip this node as it has already been visited
		if ("index" in node) continue

		node.index = index

		const [row, col] = index

		// Update maximum row and col counts
		if (row > maxRow) maxRow = row
		if (col > maxCol) maxCol = col

		// Add all available neighbors to the stack to be indexed
		if (!node.hasNorthWall)
			labelNodesStack.push([node.northNeighbor, [row - 1, col]])
		if (!node.hasSouthWall)
			labelNodesStack.push([node.southNeighbor, [row + 1, col]])
		if (!node.hasEastWall)
			labelNodesStack.push([node.eastNeighbor, [row, col + 1]])
		if (!node.hasWestWall)
			labelNodesStack.push([node.westNeighbor, [row, col - 1]])
	}

	// Create initial matrix based on maximum row and col values
	const cells = createFilledMatrix(maxRow + 1, maxCol + 1, 0b01111)

	const insertNodesStack = [nodeGraph]

	// Fill the matrix with nodes
	while (insertNodesStack.length > 0) {
		const node = insertNodesStack.pop()

		// Skip this node as it has already been inserted
		if (!("index" in node)) continue

		const [row, col] = node.index

		// Convert the node to its binary representation
		cells[row][col] =
			(node.hasNorthWall << 3) |
			(node.hasSouthWall << 2) |
			(node.hasEastWall << 1) |
			node.hasWestWall

		// Add all neighbors to the stack to be inserted
		if (!node.hasNorthWall) insertNodesStack.push(node.northNeighbor)
		if (!node.hasSouthWall) insertNodesStack.push(node.southNeighbor)
		if (!node.hasEastWall) insertNodesStack.push(node.eastNeighbor)
		if (!node.hasWestWall) insertNodesStack.push(node.westNeighbor)

		// Remove the index from the node, leaving it unchanged
		// from its original state
		delete node.index
	}

	return cells
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

	const rawMaze = createFilledMatrix(rows, cols, 0)

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

/**
 * Supersample a maze to a higher resolution. Retains the original maze pattern
 * while increasing the maze dimensions by the given factor.
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @param {number} [factor] The factor to scale by
 * @returns {number[][]} The new upscaled maze
 */
export const supersampleMaze = (rawMaze, factor = 2) => {
	const supersampleCell = (index, newMaze) => {
		const [row, col] = [index[0] * factor, index[1] * factor]

		const cellNumber = cellAt(index, rawMaze)

		// Add the north wall to every new north cell
		if (cellIs(North, cellNumber)) {
			for (let i = 0; i < factor; i++) {
				newMaze[row][col + i] |= North
			}
		}

		// Add the south wall to every new south cell
		if (cellIs(South, cellNumber)) {
			for (let i = 0; i < factor; i++) {
				newMaze[row + factor - 1][col + i] |= South
			}
		}

		// Add the east wall to every new east cell
		if (cellIs(East, cellNumber)) {
			for (let i = 0; i < factor; i++) {
				newMaze[row + i][col + factor - 1] |= East
			}
		}

		// Add the west wall to every new west cell
		if (cellIs(West, cellNumber)) {
			for (let i = 0; i < factor; i++) {
				newMaze[row + i][col] |= West
			}
		}
	}

	const [rows, cols] = [rawMaze.length * factor, rawMaze[0].length * factor]

	// Create a placeholder maze to hold the new cells
	const largeMaze = createFilledMatrix(rows, cols, 0)

	// Supersample every cell in the maze
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			supersampleCell([row, col], largeMaze)
		}
	}

	return largeMaze
}

/**
 * Supersample a maze to a higher resolution. Retains the original maze pattern
 * while increasing the maze dimensions by the given factor.
 *
 * See the sparse version if you want fewer walls.
 *
 * @param {number[][]} gridMaze The raw maze stored as a matrix of binary numbers
 * @param {number} [factor] The factor to scale by
 * @returns {boolean[][]} The new upscaled maze
 */
export const supersampleMazeGrid = (gridMaze, factor = 2) => {
	const supersampleCell = (index, newMaze) => {
		const [row, col] = [index[0] * factor, index[1] * factor]

		// Create a wall if there was originally one present
		if (gridMaze[index[0]][index[1]]) {
			// Create walls everywhere within the original domain of the wall
			for (let i = 0; i < factor; i++) {
				for (let j = 0; j < factor; j++) {
					newMaze[row + i][col + j] = true
				}
			}
		}
	}

	const [rows, cols] = [gridMaze.length * factor, gridMaze[0].length * factor]

	// Create a placeholder maze to hold the new cells
	const largeMaze = createFilledMatrix(rows, cols, false)

	// Supersample every cell in the maze
	for (let row = 0; row < gridMaze.length; row++) {
		for (let col = 0; col < gridMaze[row].length; col++) {
			supersampleCell([row, col], largeMaze)
		}
	}

	return largeMaze
}

/**
 * Supersample a maze to a higher resolution. Retains the original maze pattern
 * while increasing the maze dimensions by the given factor.
 *
 * This method will try to use as few walls as possible.
 *
 * @param {number[][]} gridMaze The raw maze stored as a matrix of binary numbers
 * @param {number} [factor] The factor to scale by
 * @returns {boolean[][]} The new upscaled maze
 */
export const supersampleMazeGridSparse = (gridMaze, factor = 2) => {
	// Convert the current maze to the raw format,
	// assuming that the current maze is not supersampled
	const rawMaze = convertGridToRawFormat(gridMaze, 1)

	// Multiply the factor by two to handle the discrepancy
	// between maze dimensions in the two formats.
	// A grid maze at 19 x 19 has the same information as
	// a raw maze at 10 x 10.s
	return convertRawToGridFormat(rawMaze, factor * 2)
}

/**
 * Replace the boolean representation of walls by having cells be
 * either walls or open. This is another commonly used format.
 *
 * Optionally supersample the maze (cannot operate on a supersampled maze).
 *
 * @param {number[][]} rawMaze The raw maze stored as a matrix of binary numbers
 * @param {number} [supersampleFactor] The factor to scale by
 * @returns {boolean[][]} The new maze in occupancy grid format
 */
export const convertRawToGridFormat = (rawMaze, supersampleFactor = 1) => {
	const cellWallSize = supersampleFactor

	// Insert one row/col between each cell to place the wall cells in
	const [rows, cols] = [
		rawMaze.length * cellWallSize + rawMaze.length - 1,
		rawMaze[0].length * cellWallSize + rawMaze[0].length - 1,
	]

	// Create a placeholder maze to hold the new cells
	const gridMaze = createFilledMatrix(rows, cols, false)

	// Add south and east walls, and fill in any corners
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			const [gridRow, gridCol] = [
				row * cellWallSize + row,
				col * cellWallSize + col,
			]

			const cellNumber = cellAt([row, col], rawMaze)

			const hasNorthWall = cellIs(North, cellNumber)
			const hasSouthWall = cellIs(South, cellNumber)
			const hasEastWall = cellIs(East, cellNumber)
			const hasWestWall = cellIs(West, cellNumber)

			// Add the south wall to every new south cell
			if (hasSouthWall && row < rawMaze.length - 1) {
				for (let i = 0; i < cellWallSize; i++) {
					gridMaze[gridRow + cellWallSize][gridCol + i] = true
				}

				// Add a south wall to the the left
				if (col > 0)
					gridMaze[gridRow + cellWallSize][gridCol - 1] = true

				// Fill in any missing corners
				if (hasWestWall && col > 0) {
					gridMaze[gridRow + cellWallSize][gridCol - 1] = true
				} else if (hasEastWall) {
					gridMaze[gridRow + cellWallSize][
						gridCol + cellWallSize
					] = true
				}
			}

			// Add the east wall to every new east cell
			if (hasEastWall && col < rawMaze[row].length - 1) {
				for (let i = 0; i < cellWallSize; i++) {
					gridMaze[gridRow + i][gridCol + cellWallSize] = true
				}

				// Add an east wall to the north
				if (row > 0)
					gridMaze[gridRow - 1][gridCol + cellWallSize] = true

				// Fill in any missing corners
				if (hasNorthWall && row > 0) {
					gridMaze[gridRow - 1][gridCol + cellWallSize] = true
				}
			}
		}
	}

	return gridMaze
}

/**
 * Replace the occupancy grid format with the raw format.
 *
 * Optionally handle a supersampled maze.
 *
 * @param {boolean[][]} gridMaze The grid maze stored as a matrix of booleans
 * @param {number} [supersampleFactor] The factor to scale by
 * @returns {number[][]} The new maze with wall cells
 */
export const convertGridToRawFormat = (gridMaze, supersampleFactor = 1) => {
	const cellWallSize = supersampleFactor

	// Account for one row/col being inserted between each cell to place the wall cells in
	const [rows, cols] = [
		(gridMaze.length + 1) / (cellWallSize + 1),
		(gridMaze[0].length + 1) / (cellWallSize + 1),
	]

	// Create the raw matrix
	const cells = createFilledMatrix(rows, cols, 0)

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const [gridRow, gridCol] = [
				row * cellWallSize + row,
				col * cellWallSize + col,
			]

			// Check top left for walls
			const hasNorthWall = row - 1 < 0 || gridMaze[gridRow - 1][gridCol]
			const hasWestWall = col - 1 < 0 || gridMaze[gridRow][gridCol - 1]

			// Check the bottom right for walls
			const hasSouthWall =
				row + 1 >= rows || gridMaze[gridRow + cellWallSize][gridCol]
			const hasEastWall =
				col + 1 >= cols || gridMaze[gridRow][gridCol + cellWallSize]

			cells[row][col] =
				(hasNorthWall << 3) |
				(hasSouthWall << 2) |
				(hasEastWall << 1) |
				hasWestWall
		}
	}

	return cells
}

/**
 * @param {number[]} cellIndex
 * @param {number} factor
 * @returns {number[]} The resulting grid point
 */
export const convertRawToGridPoint = ([row, col], factor = 1) => {
	return [row * factor + row, col * factor + col]
}

/**
 * @param {number[]} cellIndex
 * @param {number} factor
 * @returns {number[]} The resulting raw point
 */
export const convertGridToRawPoint = ([row, col], factor = 1) => {
	return [row / (factor + 1), col / (factor + 1)]
}

/**
 * Braid the given maze (add loops / remove dead ends).
 *
 * This runs in-place, without copying the original maze.
 *
 * @param {number[][]} rawMaze The original maze to braid
 * @param {number} probability 0 to 1, the probability of removing a dead end
 */
export const braidMaze = (rawMaze, probability) => {
	const directions = [North, South, East, West]

	// Loop through all cells, removing dead ends with the given probability
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			if (Math.random() <= probability) {
				// Determine which walls the given cell has
				const cellNumber = cellAt([row, col], rawMaze)

				const hasNorthWall = cellIs(North, cellNumber)
				const hasSouthWall = cellIs(South, cellNumber)
				const hasEastWall = cellIs(East, cellNumber)
				const hasWestWall = cellIs(West, cellNumber)

				const numberOfWalls =
					hasNorthWall + hasSouthWall + hasEastWall + hasWestWall

				// Remove one of the walls if this is a dead end
				if (numberOfWalls === 3) {
					const neighbors = [
						[row - 1, col], // North
						[row + 1, col], // South
						[row, col + 1], // East
						[row, col - 1], // West
					]

					// Select cells that are within bounds and currently have a wall
					const potentialNeighbors = neighbors.filter(
						(neighbor, i) =>
							rawMaze?.[neighbor[0]]?.[neighbor[1]] &&
							cellIs(directions[i], cellNumber)
					)

					if (potentialNeighbors.length === 0) continue

					const randomNeighbor = chooseRandom(potentialNeighbors)

					removeWall([row, col], randomNeighbor, rawMaze)
				}
			}
		}
	}
}

/**
 * Braid the given maze (add loops / remove dead ends).
 *
 * This runs in-place, without copying the original maze.
 *
 * @param {boolean[][]} gridMaze The original maze to braid
 * @param {number} probability 0 to 1, the probability of removing a dead end
 */
export const braidMazeGrid = (gridMaze, probability) => {
	// Loop through all cells, removing dead ends with the given probability
	for (let row = 0; row < gridMaze.length; row++) {
		for (let col = 0; col < gridMaze[row].length; col++) {
			if (Math.random() <= probability) {
				const neighbors = [
					[row - 2, col], // North
					[row + 2, col], // South
					[row, col + 2], // East
					[row, col - 2], // West
				]

				// Select all blocked neighbors
				const potentialNeighbors = neighbors.filter(
					([neighborRow, neighborCol]) => {
						if (
							neighborRow >= 0 &&
							neighborRow < gridMaze.length &&
							neighborCol >= 0 &&
							neighborCol < gridMaze[neighborRow].length
						) {
							// Find the cell between the neighbor and current cell
							const [midRow, midCol] = [
								row + (neighborRow - row) / 2,
								col + (neighborCol - col) / 2,
							]

							// Select this neighbor, as it is open
							// and has a wall between it an the current cell
							return (
								gridMaze[midRow][midCol] &&
								!gridMaze[neighborRow][neighborCol]
							)
						}
						return false
					}
				)

				// Store whether or not this is a cell on the edge of the maze
				const isEdgeCell =
					row === 0 ||
					row === gridMaze.length - 1 ||
					col === 0 ||
					col === gridMaze[0].length - 1

				// Remove one of the walls if this is a dead end
				if (
					potentialNeighbors.length >= 3 ||
					(isEdgeCell && potentialNeighbors.length >= 2)
				) {
					const randomNeighbor = chooseRandom(potentialNeighbors)

					removeWallGrid([row, col], randomNeighbor, gridMaze)
				}
			}
		}
	}
}

/**
 * Remove random walls from a grid. Other algorithms may not work as
 * well after performing this operation.
 *
 * This runs in-place, without copying the original maze.
 *
 * @param {boolean[][]} gridMaze The original maze to braid
 * @param {number} probability 0 to 1, the probability of removing a wall
 */
export const degradeGrid = (gridMaze, probability) => {
	// Loop through all cells, removing walls with the given probability
	for (let row = 0; row < gridMaze.length; row++) {
		for (let col = 0; col < gridMaze[row].length; col++) {
			if (Math.random() <= probability && gridMaze[row][col]) {
				gridMaze[row][col] = false
			}
		}
	}
}

/**
 * Add random walls to a grid. Other algorithms may not work as
 * well after performing this operation.
 *
 * This runs in-place, without copying the original maze.
 *
 * @param {boolean[][]} gridMaze The original maze to braid
 * @param {number} probability 0 to 1, the probability of adding a wall
 */
export const fillGrid = (gridMaze, probability) => {
	// Loop through all cells, removing walls with the given probability
	for (let row = 0; row < gridMaze.length; row++) {
		for (let col = 0; col < gridMaze[row].length; col++) {
			if (Math.random() <= probability && !gridMaze[row][col]) {
				gridMaze[row][col] = true
			}
		}
	}
}
