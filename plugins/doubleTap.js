// plugins/double-tap.client.js
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('double-tap', {
		getSSRProps() {
			return {}
		},
		mounted(el, binding) {
			let lastTap = 0
			let timer
			const id = Math.random().toString(36).slice(2) // her eleman için benzersiz id

			const handler = (e) => {
				const now = Date.now()
				if (now - lastTap < 300) {
					clearTimeout(timer)
					if (typeof binding.value === 'function') binding.value(e)
				}
				lastTap = now
			}

			el.__doubleTapHandler__ = { id, handler }
			el.addEventListener('click', handler, { passive: true })
		},
		unmounted(el) {
			const ref = el.__doubleTapHandler__
			if (ref) {
				el.removeEventListener('click', ref.handler)
				delete el.__doubleTapHandler__
			}
		},
	})
})
