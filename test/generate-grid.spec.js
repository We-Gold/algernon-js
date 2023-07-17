import { generateBacktrackingGrid, generateGrowingTreeGrid, generateKruskalGrid, solveAStarGrid, solveAStarRaw } from "../lib"

const generators = {
    "Backtracking": generateBacktrackingGrid,
    "Kruskal": generateKruskalGrid,
    "Growing Tree": generateGrowingTreeGrid
}

test.each(Object.entries(generators))("%s maze has correct dimensions", (name, method) => {
    ///////// Test Even Dimensions /////////
    const [evenMazeRows, evenMazeCols] = [19, 19]

    let maze = method(evenMazeRows, evenMazeCols)

    expect(maze.length).toBe(evenMazeRows)
    expect(maze[0].length).toBe(evenMazeCols)

    ///////// Test Uneven Dimensions /////////
    const [unevenMazeRows, unevenMazeCols] = [11, 31]

    maze = method(unevenMazeRows, unevenMazeCols)

    expect(maze.length).toBe(unevenMazeRows)
    expect(maze[0].length).toBe(unevenMazeCols)
})

test.each(Object.entries(generators))("%s maze is solvable", (name, method) => {
    const [testRows, testCols] = [19, 19]

    const maze = method(testRows, testCols)

    const solution = solveAStarGrid(maze, [0, 0], [18, 18])

    expect(solution).not.toHaveLength(0)
})