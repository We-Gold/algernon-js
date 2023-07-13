/**
 * Constructs a min heap object, using an array internally.
 * @param {compareKeysFunction} [compareKeys] Returns whether or not the keys are equal
 * @param {compareValuesFunction} [compareValues] Returns positive if the first key is larger, and vice versa
 * @returns A min heap with appropriate methods
 */
export const createMinHeap = (
	compareKeys = defaultCompareKeys,
	compareValues = defaultCompareValues
) => {
	const array = []

	const isEmpty = () => array.length === 0

	const hasKey = (node) =>
		array.some((otherNode) => compareKeys(node, otherNode))

	const left = (i) => 2 * i + 1
	const right = (i) => 2 * i + 2

	const parent = (i) => Math.floor((i - 1) / 2)

	const getMin = () => array[0]

	const insert = (value) => {
		array.push(value)

		let i = array.length - 1

		// Maintain the min heap property
		while (i > 0 && compareValues(array[parent(i)], array[i]) > 0) {
			const p = parent(i)

			// Swap parent and child elements
			;[array[i], array[p]] = [array[p], array[i]]

			i = p
		}
	}

	// Decreases the value at an index in the heap
	const decreaseKey = (i, newValue) => {
		array[i] = newValue

		// Maintain the min heap property
		while (i !== 0 && compareValues(array[parent(i)], array[i]) > 0) {
			const p = parent(i)

			// Swap parent and child elements
			;[array[i], array[p]] = [array[p], array[i]]

			i = p
		}
	}

	const extractMin = () => {
		if (array.length === 1) return array.pop()

		// Remove the minimum value from the heap, and return it
		const min = array[0]
		array[0] = array[array.length - 1]
		array.pop()
		minHeapify(0)
		return min
	}

	const deleteKey = (i) => {
		decreaseKey(i, array[0] - 1)
		extractMin()
	}

	// Recursively heapify the subtrees of the current index
	const minHeapify = (i) => {
		if (array.length === 1) return

		const l = left(i)
		const r = right(i)

		let smallest = i

		// Determine the smallest branch
		if (l < array.length && compareValues(array[l], array[i]) < 0)
			smallest = l
		if (r < array.length && compareValues(array[r], array[smallest]) < 0)
			smallest = r

		// Recursively heapify the smallest branch
		if (smallest !== i) {
			;[array[i], array[smallest]] = [array[smallest], array[i]]

			minHeapify(smallest)
		}
	}

	return {
		isEmpty,
		hasKey,
		getMin,
		insert,
		decreaseKey,
		deleteKey,
		extractMin,
	}
}

/**
 * @callback compareKeysFunction
 * @param {*} node1 A particular node
 * @param {*} node2 Another node
 * @returns {boolean} Whether or not the two keys are the same
 */

/**
 * @type {compareKeysFunction}
 */
const defaultCompareKeys = (node1, node2) => node1 === node2

/**
 * @callback compareValuesFunction
 * @param {*} node1 A particular node
 * @param {*} node2 Another node
 * @returns {number} Positive if the first is larger, negative if it is smaller
 */

/**
 * @type {compareValuesFunction}
 */
const defaultCompareValues = (node1, node2) => node1 - node2
