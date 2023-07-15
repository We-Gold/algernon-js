import { East, North, South, West, cellAt, cellIs } from "./helpers"

/**
 *
 * @param {CanvasRenderingContext2D} ctx A canvas context
 * @param {number} w The width and height of each cell in the maze grid
 * @param {number[][]} rawMaze The full maze in 'binary' format
 * @param {number[][]} solution
 */
export const renderRawMazeToCanvas = (ctx, w, rawMaze, solution = []) => {
	ctx.lineJoin = "miter"
	ctx.lineCap = "round"

	clear(ctx, 0, 0, 0)

	// Draw all walls of the maze
	for (let row = 0; row < rawMaze.length; row++) {
		for (let col = 0; col < rawMaze[row].length; col++) {
			// Determine the top left corner of the cell
			const x = col * w
			const y = row * w

			if (cellIs(North, cellAt([row, col], rawMaze))) {
				line(ctx, x, y, x + w, y)
				stroke(ctx, 255, 255, 255, 1.5)
			}

			if (cellIs(South, cellAt([row, col], rawMaze))) {
				line(ctx, x + w, y + w, x, y + w)
				stroke(ctx, 255, 255, 255, 1.5)
			}

			if (cellIs(East, cellAt([row, col], rawMaze))) {
				line(ctx, x + w, y, x + w, y + w)
				stroke(ctx, 255, 255, 255, 1.5)
			}

			if (cellIs(West, cellAt([row, col], rawMaze))) {
				line(ctx, x, y + w, x, y)
				stroke(ctx, 255, 255, 255, 1.5)
			}
		}
	}

	// Draw the solution
	ctx.beginPath()
	const coordinates = solution.map(([row, col]) => ({
		x: col * w + w / 2,
		y: row * w + w / 2,
	}))

	for (let i = 0; i < coordinates.length - 1; i++) {
		if (i === 0) {
			ctx.moveTo(coordinates[i].x, coordinates[i].y)
		}

		ctx.lineTo(coordinates[i + 1].x, coordinates[i + 1].y)
	}

	stroke(ctx, 230, 100, 0, w / 2)
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx A canvas context
 * @param {number} w The width and height of each cell in the maze grid
 * @param {number[][]} gridMaze The full maze in grid format
 * @param {number[][]} solution
 */
export const renderGridMazeToCanvas = (ctx, w, gridMaze, solution = []) => {
	ctx.lineJoin = "miter"
	ctx.lineCap = "round"

	clear(ctx, 0, 0, 0)

	// Draw all walls of the maze
	for (let row = 0; row < gridMaze.length; row++) {
		for (let col = 0; col < gridMaze[row].length; col++) {
			if (gridMaze[row][col]) {
				// Determine the top left corner of the cell
				const [x, y] = [col * w, row * w]

				// Draw the wall
				rectPath(ctx, x, y, w, w)

				// Fill it with white
				fill(ctx, 255, 255, 255)
			}
		}
	}

	// Draw the solution
	ctx.beginPath()
	const coordinates = solution.map(([row, col]) => ({
		x: col * w + w / 2,
		y: row * w + w / 2,
	}))

	for (let i = 0; i < coordinates.length - 1; i++) {
		if (i === 0) {
			ctx.moveTo(coordinates[i].x, coordinates[i].y)
		}

		ctx.lineTo(coordinates[i + 1].x, coordinates[i + 1].y)
	}

	stroke(ctx, 230, 100, 0, w / 2)
}

//////////// Canvas Helper Methods ////////////
const width = (ctx) => ctx.canvas.width
const height = (ctx) => ctx.canvas.height

const clear = (ctx, r, g, b) => {
	rectPath(ctx, 0, 0, width(ctx), height(ctx))
	fill(ctx, r, g, b)
}

const rectPath = (ctx, x, y, w, h) => {
	ctx.beginPath()
	ctx.rect(x, y, w, h)
	ctx.closePath()
}

const fill = (ctx, r, g, b) => {
	ctx.fillStyle = `rgb(${r},${g},${b})`
	ctx.fill()
}

const stroke = (ctx, r, g, b, thickness = 1) => {
	ctx.strokeStyle = `rgb(${r},${g},${b})`
	ctx.lineWidth = thickness
	ctx.stroke()
}

const line = (ctx, x1, y1, x2, y2) => {
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
}
