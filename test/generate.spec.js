import { generateBacktrackingRaw, generateGrowingTreeRaw, generateKruskalRaw, solveAStarRaw } from "../lib"

const generators = {
    "Backtracking": generateBacktrackingRaw,
    "Kruskal": generateKruskalRaw,
    "Growing Tree": generateGrowingTreeRaw
}

test.each(Object.entries(generators))("%s maze has correct dimensions", (name, method) => {
    ///////// Test Even Dimensions /////////
    const [evenMazeRows, evenMazeCols] = [20, 20]

    let maze = method(evenMazeRows, evenMazeCols)

    expect(maze.length).toBe(evenMazeRows)
    expect(maze[0].length).toBe(evenMazeCols)

    ///////// Test Odd Dimensions /////////
    const [oddMazeRows, oddMazeCols] = [21, 21]

    maze = method(oddMazeRows, oddMazeCols)

    expect(maze.length).toBe(oddMazeRows)
    expect(maze[0].length).toBe(oddMazeCols)

    ///////// Test Uneven Dimensions /////////
    const [unevenMazeRows, unevenMazeCols] = [10, 30]

    maze = method(unevenMazeRows, unevenMazeCols)

    expect(maze.length).toBe(unevenMazeRows)
    expect(maze[0].length).toBe(unevenMazeCols)
})

test.each(Object.entries(generators))("%s maze is solvable", (name, method) => {
    const [testRows, testCols] = [20, 20]

    const maze = method(testRows, testCols)

    const solution = solveAStarRaw(maze, [0, 0], [19, 19])

    expect(solution).not.toHaveLength(0)
})