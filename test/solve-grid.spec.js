import { generateBacktrackingGrid, solveAStarGrid, solveBFSGrid, solveDFSGrid } from "../lib"

const solvers = {
	"A-Star": solveAStarGrid,
	"DFS": solveDFSGrid,
	"BFS": solveBFSGrid,
}

test.each(Object.entries(solvers))(
	"%s successfully solves a maze",
	(name, method) => {
		const [testRows, testCols] = [19, 19]

		const start = [0, 0]
		const end = [18, 18]

		const maze = generateBacktrackingGrid(testRows, testCols)

		const solution = method(maze, start, end)

		expect(solution).not.toHaveLength(0)

		expect(solutionIsContinuous(solution)).toBe(true)

		expect(solution[0]).toEqual(start)
		expect(solution[solution.length - 1]).toEqual(end)
	}
)

const solutionIsContinuous = (solution) => {
	for (let i = 0; i < solution.length - 1; i++) {
		if (
			Math.abs(solution[i + 1][0] - solution[i][0]) > 1 ||
			Math.abs(solution[i + 1][1] - solution[i][1]) > 1
		) {
			return false
		}
	}

	return true
}
