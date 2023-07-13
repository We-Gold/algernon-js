import { unique } from "../helpers"

/**
 * Constructs a min heap object, using an array internally.
 * @param {compareValuesFunction} [compareValues] Returns positive if the first key is larger, and vice versa
 * @param {any} [infinitelySmallValue] A value that represents negative infinity
 * @returns A min heap with appropriate methods
 */
export const createMinHeap = (
	compareValues = defaultCompareValues,
	infinitelySmallValue = -Infinity
) => {
	const array = []

	const keyIndexMap = new Map()

	const isEmpty = () => array.length === 0

	const hasKey = (key) => keyIndexMap.has(unique(key))

	const findKeyIndex = (key) => keyIndexMap.get(unique(key))

	const left = (i) => 2 * i + 1
	const right = (i) => 2 * i + 2

	const parent = (i) => Math.floor((i - 1) / 2)

	const getMin = () => array[0]

	const insert = (key, value) => {
		array.push({ key, value })

		let i = array.length - 1

		// Maintain the min heap property
		while (
			i > 0 &&
			compareValues(array[parent(i)].value, array[i].value) > 0
		) {
			const p = parent(i)

			keyIndexMap.set(unique(array[i].key), p)
			keyIndexMap.set(unique(array[p].key), i)

			// Swap parent and child elements
			;[array[i], array[p]] = [array[p], array[i]]

			i = p
		}

		keyIndexMap.set(unique(array[i].key), i)
	}

	// Decreases the value at an index in the heap
	const decreaseKey = (i, newValue) => {
		array[i].value = newValue

		// Maintain the min heap property
		while (
			i !== 0 &&
			compareValues(array[parent(i)].value, array[i].value) > 0
		) {
			const p = parent(i)

			keyIndexMap.set(unique(array[i].key), p)
			keyIndexMap.set(unique(array[p].key), i)

			// Swap parent and child elements
			;[array[i], array[p]] = [array[p], array[i]]

			i = p
		}
	}

	// Modifies the value at an index in the heap
	const modifyKey = (i, newValue) => {
		const currentKey = array[i].key
		const currentValue = array[i].value

		// Compare the new value with the current value
		const valueComparison = compareValues(currentValue, newValue)

		// If the new value is smaller, just run decreaseKey
		if (valueComparison > 0) {
			decreaseKey(i, newValue)
		}

		// If the new value is larger, delete the key and reinsert it
		else if (valueComparison < 0) {
			deleteKey(i)
			insert(currentKey, newValue)
		}
		// If the new value is equal to the current value, do nothing
	}

	const extractMin = () => {
		// Remove the minimum value from the heap, and return it
		const min = array[0]
		array[0] = array[array.length - 1]
		array.pop()
		keyIndexMap.delete(unique(min.key))

		// When one element was swapped from the back,
		// update its index in the map
		if (array.length > 0) keyIndexMap.set(unique(array[0].key), 0)

		minHeapify(0)

		return min
	}

	const deleteKey = (i) => {
		decreaseKey(i, infinitelySmallValue)
		extractMin()
	}

	// Recursively heapify the subtrees of the current index
	const minHeapify = (i) => {
		const l = left(i)
		const r = right(i)

		let smallest = i

		// Determine the smallest branch
		if (
			l < array.length &&
			compareValues(array[l].value, array[i].value) < 0
		)
			smallest = l
		if (
			r < array.length &&
			compareValues(array[r].value, array[smallest].value) < 0
		)
			smallest = r

		// Recursively heapify the smallest branch
		if (smallest !== i) {
			keyIndexMap.set(unique(array[i].key), smallest)
			keyIndexMap.set(unique(array[smallest].key), i)
			;[array[i], array[smallest]] = [array[smallest], array[i]]

			minHeapify(smallest)
		}
	}

	return {
		isEmpty,
		hasKey,
		findKeyIndex,
		getMin,
		insert,
		modifyKey,
		decreaseKey,
		deleteKey,
		extractMin,
	}
}

/**
 * @callback compareValuesFunction
 * @param {*} node1 A particular node
 * @param {*} node2 Another node
 * @returns {number} Positive if the first is larger, negative if it is smaller
 */

/**
 * @type {compareValuesFunction}
 */
const defaultCompareValues = (val1, val2) => val1 - val2
