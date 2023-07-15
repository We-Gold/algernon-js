import {
	generateMazeBacktracking,
	generateMazeKruskal,
	solveAStar,
	renderMazeToCanvas,
	convertRawToNodeMatrix,
	convertRawToNodeGraph,
	generateMazeGrowingTree,
	solveACO,
	serializeRawToBinary,
	deserializeBinaryToRaw,
	serializeRawToString,
	deserializeStringToRaw,
	fillWallsWithCells,
	solveDStarLite,
	braidMaze,
} from "./lib"
import { East, North, South, West, cellIs, removeWall } from "./lib/helpers"

document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("demo-canvas")
	const ctx = canvas.getContext("2d")

	const [rows, cols] = [40, 40]

	const start = [0, 0]
	const end = [rows - 1, cols - 1]

	let startTime = performance.now()
	const kruskalMaze = generateMazeKruskal(rows, cols)
	let endTime = performance.now()

	console.log(`Kruskal: ${endTime - startTime}ms`)

	startTime = performance.now()
	const backtrackMaze = generateMazeBacktracking(rows, cols)
	endTime = performance.now()

	console.log(`Backtracking: ${endTime - startTime}ms`)

	startTime = performance.now()
	const growingTreeMaze = generateMazeGrowingTree(rows, cols)
	endTime = performance.now()

	console.log(`Growing Tree: ${endTime - startTime}ms`)

	const finalMaze = backtrackMaze

	const originalMaze = structuredClone(finalMaze)
	
	// Remove dead ends with given probability
	// braidMaze(originalMaze, 1)

	// When solving, the hypot (default) heurisitic works well for
	// backtracking generated mazes, but the grid heuristic works
	// better for kruskal type mazes
	startTime = performance.now()
	const solution = solveAStar(finalMaze, start, end)
	endTime = performance.now()

	console.log(`A*: ${endTime - startTime}ms`)

	startTime = performance.now()
	const antSolution = solveACO(finalMaze, start, end)
	endTime = performance.now()

	console.log(`ACO: ${endTime - startTime}ms`)

	startTime = performance.now()
	const {path: dStarSolution, solve} = solveDStarLite(finalMaze, start, end, true)
	endTime = performance.now()

	console.log(`D* Lite: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeMatrix = convertRawToNodeMatrix(finalMaze)
	endTime = performance.now()

	console.log(`Node Matrix Conversion: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeGraph = convertRawToNodeGraph(finalMaze, start, end)
	endTime = performance.now()

	console.log(`Node Graph Conversion: ${endTime - startTime}ms`)

	startTime = performance.now()
	const binary = serializeRawToBinary(finalMaze)
	endTime = performance.now()

	console.log(`Binary Serialization: ${endTime - startTime}ms`)

	startTime = performance.now()
	const deserialized = deserializeBinaryToRaw(binary)
	endTime = performance.now()

	console.log(`Binary Deserialization: ${endTime - startTime}ms`)

	startTime = performance.now()
	const base64 = serializeRawToString(finalMaze)
	endTime = performance.now()

	console.log(`Base 64 Serialization: ${endTime - startTime}ms`)

	startTime = performance.now()
	const deserialized64 = deserializeStringToRaw(base64)
	endTime = performance.now()

	console.log(`Base 64 Deserialization: ${endTime - startTime}ms`)

	const filledMaze = fillWallsWithCells(finalMaze, '#', ' ', 2)

	// Use this to test the filled maze
	// console.log(filledMaze.map((row) => row.join('')).join('\n'))

	startTime = performance.now()
	renderMazeToCanvas(ctx, 10, originalMaze, dStarSolution)
	endTime = performance.now()

	console.log(`Render: ${endTime - startTime}ms`)

	// Render the updated d star path
	const canvas2 = document.getElementById("demo-canvas-2")
	const ctx2 = canvas2.getContext("2d")

	let updatedDStarSolution

	const updatedCellIndices = []
	const originalCellValues = []

	for (let iterations = 0; iterations < 10; iterations++) {
		// Randomly remove walls in the maze 
		for (let i = 1; i < finalMaze.length - 1; i++) {
			for (let j = 1; j < finalMaze[0].length - 1; j++) {
				if (Math.random() > 0.95) {
					updatedCellIndices.push([i, j])

					const originalValue = finalMaze[i][j]

					originalCellValues.push(originalValue)

					if (cellIs(North, originalValue)) {
						removeWall([i, j], [i - 1, j], finalMaze)
					}
					if (cellIs(South, originalValue)) {
						removeWall([i, j], [i + 1, j], finalMaze)
					}
					if (cellIs(East, originalValue)) {
						removeWall([i, j], [i, j + 1], finalMaze)
					}
					if (cellIs(West, originalValue)) {
						removeWall([i, j], [i, j - 1], finalMaze)
					}
				}
			}
		}

		updatedDStarSolution = solve(start, {updatedCellIndices, originalCellValues})
	}

	renderMazeToCanvas(ctx2, 10, finalMaze, updatedDStarSolution)
})
