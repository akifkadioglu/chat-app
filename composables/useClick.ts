import { onBeforeUnmount } from 'vue'

type ClickCallback = (event: MouseEvent) => void
const callbacks = new Set<ClickCallback>()
let initialized = false

function handleClick(event: MouseEvent) {
	callbacks.forEach((cb) => cb(event))
}

function initClickListener() {
	if (!import.meta.client || initialized) return
	initialized = true
	document.addEventListener('click', handleClick, { passive: true })
}

export function useClick(callback?: ClickCallback) {
	initClickListener()

	if (callback) {
		callbacks.add(callback)

		onBeforeUnmount(() => {
			callbacks.delete(callback)
		})
	}
}
