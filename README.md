![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/We-Gold/algernon-js/main?label=npm%20version&color=green&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Falgernon-js)
![npm bundle size](https://img.shields.io/bundlephobia/min/algernon-js?color=green)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/We-Gold/algernon-js/issues)
![tests](https://github.com/We-Gold/algernon-js/actions/workflows/run-tests.yml/badge.svg)
![ViewCount](https://views.whatilearened.today/views/github/We-Gold/algernon-js.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![NPM Downloads](https://img.shields.io/npm/dw/algernon-js)

# Algernon-js

Algernon is a JS library for efficiently generating, solving, and rendering 2D mazes.

[_Where does the name come from?_](https://en.wikipedia.org/wiki/Flowers_for_Algernon)

Found an issue or a performance improvement? Feel free to leave an issue or make a pull request!

![Algernon Generated Maze](./readme-maze.png)

_Maze generated, solved, and rendered by Algernon-js_

-   [Installation](#installation)
-   [Usage](#usage)
-   [Benchmarks](#benchmarks)

## Installation

Via NPM:

```bash
npm i algernon-js
```

Via CDN:

```html
<script
	type="module"
	src="https://cdn.jsdelivr.net/npm/algernon-js/dist/algernon.js"
></script>
```

## Usage

### Maze Generation

**Example**:

```js
import { generateBacktrackingRaw } from "algernon-js"

const [rows, cols] = [20, 20]

const rawMaze = generateBacktrackingRaw(rows, cols)
```

**Raw Format:**

In `algernon-js`, mazes are stored as a 2D array of integers for a mix of space efficiency and convenience.

Each cell may have North, South, East, or West walls (the outer edges of the maze will be bounded).

Internally, bits are used to represent the presence of walls or other significant information.

That means a cell is internally used like this (`0b1001` - a cell with a North and West wall), but looks like this (`9` - the decimal representation).

If you are familiar with bit manipulation, feel free to use mazes in their "raw" format. If not, check out the conversions available for more familiar formats.

| Name         | Description                                                                                | Method                    | Occupancy Grid Support |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------- | ---------------------- |
| Backtracking | A fast algorithm for mazes with some long corridors. Reasonable general purpose algorithm. | `generateBacktrackingRaw` | ✅                     |
| Kruskal's    | On the slower side, good for simple and relatively easy mazes.                             | `generateKruskalRaw`      | ✅                     |
| Growing Tree | Fast, performs like Prim's by default but configurable.                                    | `generateGrowingTreeRaw`  | ✅                     |

_Some of these algorithms are additionally configurable. Check out the JSDoc comments for more info._

**Occupancy Grid Format:**

`Algernon-js` also supports the occupancy grid format. In this format, each cell is either open, or a wall/obstacle.

Open is represented as `false` and a wall/obstacle is `true`.

There are similar methods available for generating these mazes, like `generateBacktrackingGrid`.

Note that with this maze format, only odd-dimensioned mazes can be generated, and otherwise the bottom row and right column will both be completely walls. So 19 by 19 would work, but 20 by 20 is not recommended.

### Maze Solving

**Example:**

```js
// maze already generated, stored as `rawMaze`

import { solveAStarRaw } from "algernon-js"

// Solve the maze using A*, starting at the top left
// and ending at the bottom right
const solution = solveAStarRaw(rawMaze, [0, 0], [rows - 1, cols - 1])
```

**Format:**

Solutions are simply arrays, with each element as an index in the original `rawMaze`.

For example: `[[0,0],[1,0],[1,1],[1,2],...]`

| Name     | Description                                                                                                                  | Method           | Occupancy Grid Support |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| A\*      | Fast Dijkstra's-based solver that uses heuristics. Configurable general purpose solver.                                      | `solveAStarRaw`  | ✅                     |
| ACO      | Ant Colony Optimization is not recommended for real-world purposes. It is interesting for experimentation.                   | `solveACO`       | ⏳                     |
| DFS      | Depth First Search is simple and fast, exploring deep paths and backtracking.                                                | `solveDFSRaw`    | ✅                     |
| BFS      | Breadth First Search is fast, simply exploring the whole maze.                                                               | `solveBFSRaw`    | ✅                     |
| D\* Lite | Essentially A\* backwards. Pretty fast, and ideal for mazes that change and require re-planning. _See main.js for examples._ | `solveDStarLite` | ⏳                     |

_Many of these algorithms use heuristics or additional configuration. Check of the JSDoc comments for more info._

### Rendering

This is intended as a simple solution for basic web apps or testing. Feel free to use the code as a starting point for a custom solution.

For the occupancy grid format, a similar method is available: `renderGridMazeToCanvas`.

**Example:**

```html
<!-- index.html -->

<canvas id="demo-canvas" width="400" height="400"></canvas>
```

```js
// script.js

import {
	generateBacktrackingRaw,
	solveAStarRaw,
	renderRawMazeToCanvas,
} from "algernon-js"

const [rows, cols] = [20, 20]

// Generate and solve the maze
const rawMaze = generateBacktrackingRaw(rows, cols)
const solution = solveAStarRaw(rawMaze, [0, 0], [rows - 1, cols - 1])

// Render the maze
const canvas = document.getElementById("demo-canvas")
const ctx = canvas.getContext("2d")

// Render each cell at 20 pixels x 20 pixels
// `solution` is an optional argument
renderRawMazeToCanvas(ctx, 20, rawMaze, solution)
```

### Conversion

For the occupancy grid format, ✅ represents support for this format by typically adding `Grid` to the end of the method (though this may vary if the name implies it).

**Raw <-> Node Matrix**

```js
// `rawMaze` already generated

const nodeMatrix = convertRawToNodeMatrix(rawMaze)

// A node matrix is a 2D array of `MatrixNode`,
// where each node contains the following booleans:
// hasNorthWall, hasSouthWall, hasEastWall, hasWestWall

// Convert node matrix back to raw
const updatedRaw = convertNodeMatrixToRaw(nodeMatrix)
```

**Raw <-> Node Graph**

```js
// `rawMaze` already generated

// Generate a node graph with the given start and end points
const nodeGraph = convertRawToNodeGraph(rawMaze, [0, 0], [row - 1, col - 1])

// A node graph is a graph of `GraphNode`,
// where each node contains the following booleans:
// isStart, isEnd, hasNorthWall, hasSouthWall, hasEastWall, hasWestWall
// and the following references (or null if not present):
// northNeighbor, southNeighbor, eastNeighbor, westNeighbor

const updatedRaw = convertNodeGraphToRaw(nodeGraph, [0, 0])
```

**Raw <-> ArrayBuffer (Binary)**

```js
// `rawMaze` already generated

// Convert the maze to a Uint8Array,
// with the first byte storing the rows and cols
const buffer = serializeRawToBinary(rawMaze)

const deserialized = deserializeBinaryToRaw(buffer)
```

**Raw <-> Base64 String**

```js
// `rawMaze` already generated

// Convert the maze to a Base64 string
const base64 = serializeRawToString(rawMaze)

const deserialized = deserializeStringToRaw(base64)
```

**Raw -> Supersampled** ✅

```js
// `rawMaze` already generated

// Supersample the maze at a factor of 2
const supersampled = supersampleMaze(rawMaze, 2)

// Output: sample maze structure but twice the rows and columns
```

**Raw <-> Grid Maze Format** ✅

```js
// `rawMaze` already generated

// Replace wall properties with open/wall cells (and upscale to a factor of 2)
const gridMaze = convertRawToGridFormat(rawMaze, 2)

// Output: same maze structure but walls are represented by true
// and cells by false, and a different number of cells

// Convert back to Raw (and tell it the upscale factor)
const rawMaze2 = convertGridToRawFormat(gridMaze, 2)

// Output: the original `rawMaze`

// Convert points from raw to grid and back
const rawPoint = [2, 2]
const gridPoint = convertRawToGridPoint(rawPoint)
const originalPoint = convertGridToRawPoint(gridPoint)
```

**Raw -> Raw (Braided)** ✅

```js
// `rawMaze` already generated

// Remove dead-ends with the given probability
braidMaze(rawMaze, 0.5)

// Output: an in-place modification of the original maze,
// with walls removed to prevent dead-ends.
```

**Grid -> Degrade/Fill** ✅

```js
// `gridMaze` already generated

// Remove walls with the given probability
degradeGrid(gridMaze, 0.1)

// Add walls with the given probability
fillGrid(gridMaze, 0.05)

// Output: an in-place modification of the original maze,
// with walls removed or added. This is ONLY for occupancy
// grid mazes.
```

### Helpers

Internally used helper methods, like `removeWall`, `getAvailableNeighbors`, `getDirection`, and more, are made available through the `helpers` namespace.

Additionally, many have support for occupancy grids as well by adding `Grid` to the end of the method name.

**Example:**

```js
import { helpers } from "algernon-js"

const c1 = [0, 0]
const c2 = [1, 0]

const directionBetweenCells = helpers.getDirection(c1, c2)
// directionBetweenCells: 0b0100 or South
```

### Data Structures

Internally used data structures are now available as well.

The two currently available are: `createDisjointSet` and `createMinHeap`.

## Benchmarks

_Benchmarks were run on a M2 MacBook Air with a minimum of 50 samples each._

### Generation

| Maze Size | Name         | Mean (ms)  | RME  |
| --------- | ------------ | ---------- | ---- |
| 20 x 20   | Backtracking | **0.1037** | 0.89 |
| 50 x 50   | Backtracking | **0.5939** | 0.80 |
| 80 x 80   | Backtracking | **1.4800** | 0.70 |
| 20 x 20   | Kruskal      | 2.0065     | 1.49 |
| 50 x 50   | Kruskal      | 44.493     | 3.59 |
| 80 x 80   | Kruskal      | 325.52     | 2.84 |
| 20 x 20   | Growing Tree | 0.1283     | 0.39 |
| 50 x 50   | Growing Tree | 0.8033     | 0.70 |
| 80 x 80   | Growing Tree | 2.1503     | 2.45 |

### Solving

_Backtracking mazes were selected for this benchmark. Performance can vary with different maze types._

| Maze Size | Name     | Mean (ms)  | RME  |
| --------- | -------- | ---------- | ---- |
| 20 x 20   | A-Star   | **0.0173** | 1.13 |
| 50 x 50   | A-Star   | **0.1551** | 0.81 |
| 80 x 80   | A-Star   | 0.1676     | 0.78 |
| 20 x 20   | ACO      | 1.3462     | 0.64 |
| 50 x 50   | ACO      | 22.810     | 0.98 |
| 80 x 80   | ACO      | 69.850     | 1.67 |
| 20 x 20   | DFS      | 0.0617     | 0.41 |
| 50 x 50   | DFS      | 0.2197     | 0.48 |
| 80 x 80   | DFS      | 0.3464     | 0.60 |
| 20 x 20   | BFS      | 0.0532     | 0.38 |
| 50 x 50   | BFS      | 0.1643     | 0.62 |
| 80 x 80   | BFS      | **0.1504** | 0.37 |
| 20 x 20   | D\* Lite | 0.1215     | 1.06 |
| 50 x 50   | D\* Lite | 0.5553     | 0.64 |
| 80 x 80   | D\* Lite | 0.8571     | 1.71 |
