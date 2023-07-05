import {
	generateMazeBacktracking,
	generateMazeKruskal,
	solveAStar,
	renderMazeToCanvas,
	convertRawToNodeMatrix,
	convertRawToNodeGraph,
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

	const finalMaze = backtrackMaze

	// When solving, the hypot (default) heurisitic works well for
	// backtracking generated mazes, but the grid heuristic works
	// better for kruskal type mazes
	startTime = performance.now()
	const solution = solveAStar(finalMaze, [0, 0], [19, 19])
	endTime = performance.now()

	console.log(`A*: ${endTime - startTime}ms`)

	startTime = performance.now()
	renderMazeToCanvas(ctx, 20, finalMaze, solution)
	endTime = performance.now()

	console.log(`Render: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeMatrix = convertRawToNodeMatrix(finalMaze)
	endTime = performance.now()

	console.log(`Node Matrix Conversion: ${endTime - startTime}ms`)

	startTime = performance.now()
	const nodeGraph = convertRawToNodeGraph(finalMaze, [0, 0])
	endTime = performance.now()

	console.log(nodeGraph)

	console.log(`Node Graph Conversion: ${endTime - startTime}ms`)
})
