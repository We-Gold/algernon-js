import {
	generateMazeBacktracking,
	convertRawToNodeMatrix,
	convertNodeMatrixToRaw,
	serializeRawToBinary,
	deserializeBinaryToRaw,
    serializeRawToString,
    deserializeStringToRaw,
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
})

test("Serialization and Deserialization works", () => {
	const [testRows, testCols] = [20, 30]

	const maze = generateMazeBacktracking(testRows, testCols)

	const binary = serializeRawToBinary(maze)
	const rawFromBinary = deserializeBinaryToRaw(binary)

	expect(rawFromBinary.length).toBe(testRows)
	expect(rawFromBinary[0].length).toBe(testCols)

    const base64 = serializeRawToString(maze)
	const rawFromBase64 = deserializeStringToRaw(base64)

	expect(rawFromBase64.length).toBe(testRows)
	expect(rawFromBase64[0].length).toBe(testCols)
})
