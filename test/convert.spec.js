import { expect } from "vitest"
import {
	convertRawToNodeMatrix,
	convertNodeMatrixToRaw,
	serializeRawToBinary,
	deserializeBinaryToRaw,
    serializeRawToString,
    deserializeStringToRaw,
	convertRawToNodeGraph,
	convertNodeGraphToRaw,
	convertRawToGridFormat,
	convertGridToRawFormat,
	convertRawToGridPoint,
	convertGridToRawPoint,
	generateBacktrackingRaw,
} from "../lib"

test("Converted matrix is correct", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateBacktrackingRaw(testRows, testCols)
	const unvisitedMaze = maze.map(row => row.map(cell => cell & ~0b10000))

	const matrix = convertRawToNodeMatrix(maze)

	const raw = convertNodeMatrixToRaw(matrix)

	expect(matrix.length).toBe(testRows)
	expect(matrix[0].length).toBe(testCols)

	expect(raw.length).toBe(testRows)
	expect(raw[0].length).toBe(testCols)

	expect(raw).toEqual(unvisitedMaze)
})

test("Converted graph is correct", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateBacktrackingRaw(testRows, testCols)
	const unvisitedMaze = maze.map(row => row.map(cell => cell & ~0b10000))

	const graph = convertRawToNodeGraph(maze, [0, 0], [testRows - 1, testCols - 1])

	const raw = convertNodeGraphToRaw(graph, [0, 0])

	expect(raw.length).toBe(testRows)
	expect(raw[0].length).toBe(testCols)

	expect(raw).toEqual(unvisitedMaze)
})

test("Serialization and Deserialization works", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateBacktrackingRaw(testRows, testCols)
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

test("Conversion to and from Grid works correctly", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateBacktrackingRaw(testRows, testCols)

	const normalSize = convertRawToGridFormat(maze)

	expect(normalSize).toHaveLength(testRows + testRows - 1)
	expect(normalSize[0]).toHaveLength(testCols + testCols - 1)

	const factor = 2

	const largerSize = convertRawToGridFormat(maze, factor)

	expect(largerSize).toHaveLength(testRows * factor + testRows - 1)
	expect(largerSize[0]).toHaveLength(testCols * factor + testCols - 1)
})

test("Converting points works correctly", () => {
	const point = [2, 2]

	const gridPoint = convertRawToGridPoint(point)
	const originalPoint = convertGridToRawPoint(gridPoint)

	expect(point).toEqual(originalPoint)

	const point2 = [2, 2]

	const gridPoint2 = convertRawToGridPoint(point2, 2)
	const originalPoint2 = convertGridToRawPoint(gridPoint2, 2)

	expect(point2).toEqual(originalPoint2)
})