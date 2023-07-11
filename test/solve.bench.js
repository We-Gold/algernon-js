import { bench } from "vitest"
import { generateMazeBacktracking, generateMazeGrowingTree, solveACO, solveAStar, solveBFS, solveDFS } from "../lib"

const solvers = {
	"A-Star": solveAStar,
	ACO: solveACO,
	"DFS": solveDFS,
	"BFS": solveBFS
}

const mazeSizes = [
	[20, 20],
	[50, 50],
	[80, 80],
]

// Benchmark each solver on each maze
for (const [name, method] of Object.entries(solvers)) {
	for (let mazeIndex = 0; mazeIndex < mazeSizes.length; mazeIndex++) {
        const [rows, cols] = mazeSizes[mazeIndex]

        const maze = generateMazeBacktracking(rows, cols)

		bench(`Using ${name} on ${rows}x${cols}`, () => {
            method(maze, [0, 0], [rows - 1, cols - 1])
        }, {iterations: 50})
	}
}
