import { generateMazeBacktracking, solveAStar } from "../lib"

const solvers = {
    "A-Star": solveAStar,
}

test.each(Object.entries(solvers))("%s successfully solves a maze", (name, method) => {
    const [testRows, testCols] = [20, 20]

    const maze = generateMazeBacktracking(testRows, testCols)

    const solution = method(maze, [0, 0], [19, 19])

    expect(solution).not.toHaveLength(0)
})