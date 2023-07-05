/**
 * Constructs a min heap object, using an array internally.
 * @param {Function} getValue Returns the value to min heap with of the current element
 * @returns A min heap with appropriate methods
 */
export const createMinHeap = (getValue = defaultGetValue) => {
	const array = []

	const isEmpty = () => array.length === 0

	const hasElement = (element, areElementsEqual) =>
		array.some((e) => areElementsEqual(element, e))

	const left = (i) => 2 * i + 1
	const right = (i) => 2 * i + 2

	const parent = (i) => Math.floor((i - 1) / 2)

	const getMin = () => array[0]

	const insert = (value) => {
		array.push(value)

		let i = array.length - 1

		// Maintain the min heap property
		while (i > 0 && getValue(array[parent(i)]) > getValue(array[i])) {
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
		while (i !== 0 && getValue(array[parent(i)]) > getValue(array[i])) {
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
		if (l < array.length && getValue(array[l]) < getValue(array[i]))
			smallest = l
		if (r < array.length && getValue(array[r]) < getValue(array[smallest]))
			smallest = r

		// Recursively heapify the smallest branch
		if (smallest !== i) {
			;[array[i], array[smallest]] = [array[smallest], array[i]]

			minHeapify(smallest)
		}
	}

	return { isEmpty, hasElement, getMin, insert, decreaseKey, deleteKey, extractMin }
}

const defaultGetValue = (value) => value

