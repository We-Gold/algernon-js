import { unique } from "../helpers"

/**
 * Creates a disjoint set object using an internal map
 * @returns A disjoint set object with appropriate methods
 */
export const createDisjointSet = () => {
	const parent = new Map()

	const makeSet = (cell) => parent.set(unique(cell), unique(cell))

	// Search for the root element of the current cell
	const findSet = (cell) => {
		let current = unique(cell)

		while (current !== parent.get(current)) current = parent.get(current)

		return current
	}

	// Join two cells together at the root of the set
	const unionSets = (cell1, cell2) => {
		const root1 = findSet(cell1)
		const root2 = findSet(cell2)

		if (root1 !== root2) parent.set(root2, root1)
	}

	return { makeSet, findSet, unionSets }
}
