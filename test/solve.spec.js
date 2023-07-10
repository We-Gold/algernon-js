import { generateMazeBacktracking, solveACO, solveAStar } from "../lib"

const solvers = {
	"A-Star": solveAStar,
	"ACO": solveACO,
}

test.each(Object.entries(solvers))(
	"%s successfully solves a maze",
	(name, method) => {
		const [testRows, testCols] = [20, 20]

		const maze = generateMazeBacktracking(testRows, testCols)

		const solution = method(maze, [0, 0], [19, 19])

		expect(solution).not.toHaveLength(0)

		expect(solutionIsContinuous(solution)).toBe(true)
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
