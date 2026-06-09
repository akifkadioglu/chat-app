import { reactive, computed } from 'vue'

export const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const

type Size = {
	width: number
	height: number
}

const size: Size = reactive({
	width: import.meta.client ? window.innerWidth : 0,
	height: import.meta.client ? window.innerHeight : 0,
})

let initialized = false
let raf = 0
let onResizeRef: (() => void) | null = null

function initResizeListener() {
	if (!import.meta.client || initialized) return

	initialized = true

	const update = () => {
		size.width = window.innerWidth
		size.height = window.innerHeight
	}

	onResizeRef = () => {
		cancelAnimationFrame(raf)
		raf = requestAnimationFrame(update)
	}

	window.addEventListener('resize', onResizeRef, { passive: true })
	update()
}

export function useWindowSize() {
	initResizeListener()

	const largerThan = {
		sm: computed(() => size.width >= BREAKPOINTS.sm),
		md: computed(() => size.width >= BREAKPOINTS.md),
		lg: computed(() => size.width >= BREAKPOINTS.lg),
		xl: computed(() => size.width >= BREAKPOINTS.xl),
		'2xl': computed(() => size.width >= BREAKPOINTS['2xl']),
	} as const

	return { size, largerThan }
}
