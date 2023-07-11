import { generateMazeBacktracking, solveACO, solveDFS, solveAStar, solveBFS } from "../lib"

const solvers = {
	"A-Star": solveAStar,
	"ACO": solveACO,
	"DFS": solveDFS,
	"BFS": solveBFS
}

test.each(Object.entries(solvers))(
	"%s successfully solves a maze",
	(name, method) => {
		const [testRows, testCols] = [20, 20]

		const start = [0, 0]
		const end = [19, 19]

		const maze = generateMazeBacktracking(testRows, testCols)

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
