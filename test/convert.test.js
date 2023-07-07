import { generateMazeBacktracking, convertRawToNodeMatrix } from "../lib"

test("Converted matrix is correct", () => {
    const [testRows, testCols] = [20, 30]

    const maze = generateMazeBacktracking(testRows, testCols)

    const matrix = convertRawToNodeMatrix(maze)

    expect(matrix.length).toBe(testRows)
    expect(matrix[0].length).toBe(testCols)
})