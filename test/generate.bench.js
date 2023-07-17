import { bench } from "vitest"
import { generateGrowingTreeRaw, generateMazeBacktracking, generateKruskalRaw } from "../lib"

const generators = {
    "Backtracking": generateMazeBacktracking,
    "Kruskal": generateKruskalRaw,
    "Growing Tree": generateGrowingTreeRaw
}

const mazeSizes = [
	[20, 20],
	[50, 50],
	[80, 80],
]

// Benchmark each generator on each maze size
for (const [name, method] of Object.entries(generators)) {
	for (let mazeIndex = 0; mazeIndex < mazeSizes.length; mazeIndex++) {
        const [rows, cols] = mazeSizes[mazeIndex]

		bench(`Generating ${rows}x${cols} with ${name}`, () => {
            method(rows, cols)
        }, {iterations: 50})
	}
}
