import {
	generateMazeBacktracking,
	convertRawToNodeMatrix,
	convertNodeMatrixToRaw,
	serializeRawToBinary,
	deserializeBinaryToRaw,
    serializeRawToString,
    deserializeStringToRaw,
	convertRawToNodeGraph,
	convertNodeGraphToRaw,
} from "../lib"

test("Converted matrix is correct", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateMazeBacktracking(testRows, testCols)

	const matrix = convertRawToNodeMatrix(maze)

	const raw = convertNodeMatrixToRaw(matrix)

	expect(matrix.length).toBe(testRows)
	expect(matrix[0].length).toBe(testCols)

	expect(raw.length).toBe(testRows)
	expect(raw[0].length).toBe(testCols)

	const unvisitedMaze = maze.map(row => row.map(cell => cell & ~0b10000))

	expect(raw).toEqual(unvisitedMaze)
})

test("Converted graph is correct", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateMazeBacktracking(testRows, testCols)

	const graph = convertRawToNodeGraph(maze, [0, 0], [testRows - 1, testCols - 1])

	const raw = convertNodeGraphToRaw(graph, [0, 0])

	expect(raw.length).toBe(testRows)
	expect(raw[0].length).toBe(testCols)

	const unvisitedMaze = maze.map(row => row.map(cell => cell & ~0b10000))

	expect(raw).toEqual(unvisitedMaze)
})

test("Serialization and Deserialization works", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateMazeBacktracking(testRows, testCols)
	const unvisitedMaze = maze.map(row => row.map(cell => cell & ~0b10000))

	const binary = serializeRawToBinary(maze)
	const rawFromBinary = deserializeBinaryToRaw(binary)

	expect(rawFromBinary.length).toBe(testRows)
	expect(rawFromBinary[0].length).toBe(testCols)

	expect(rawFromBinary).toEqual(unvisitedMaze)

    const base64 = serializeRawToString(maze)
	const rawFromBase64 = deserializeStringToRaw(base64)

	expect(rawFromBase64.length).toBe(testRows)
	expect(rawFromBase64[0].length).toBe(testCols)

	expect(rawFromBase64).toEqual(unvisitedMaze)

})
