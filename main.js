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
} from "./lib"

document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("demo-canvas")
	const ctx = canvas.getContext("2d")

	const [rows, cols] = [20, 20]

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

	const finalMaze = growingTreeMaze

	// When solving, the hypot (default) heurisitic works well for
	// backtracking generated mazes, but the grid heuristic works
	// better for kruskal type mazes
	startTime = performance.now()
	const solution = solveAStar(finalMaze, [0, 0], [19, 19])
	endTime = performance.now()

	console.log(`A*: ${endTime - startTime}ms`)

	startTime = performance.now()
	const antSolution = solveACO(finalMaze, [0, 0], [19, 19])
	endTime = performance.now()

	console.log(`ACO: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeMatrix = convertRawToNodeMatrix(finalMaze)
	endTime = performance.now()

	console.log(`Node Matrix Conversion: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeGraph = convertRawToNodeGraph(finalMaze, [0, 0], [19, 19])
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

	console.log(filledMaze.map((row) => row.join('')).join('\n'))

	startTime = performance.now()
	renderMazeToCanvas(ctx, 20, deserialized64, antSolution)
	endTime = performance.now()

	console.log(`Render: ${endTime - startTime}ms`)
})
