// plugins/img-error.client.js
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
	/**
	 * @see https://v3.vuejs.org/guide/custom-directive.html
	 */
	nuxtApp.vueApp.directive('img-error', {
		// SSR için boş directive tanımı
		getSSRProps() {
			return {}
		},
		// Client-side işlevsellik
		mounted(el) {
			const handleError = () => {
				el.dataset.originalSrc = el.src
				el.src = '/images/broken.png'
				el.style.backgroundColor = '#eee'
				el.onerror = null
			}

			el.addEventListener('error', handleError)
			el._imgErrorHandler = handleError
		},
		unmounted(el) {
			if (el._imgErrorHandler) {
				el.removeEventListener('error', el._imgErrorHandler)
				delete el._imgErrorHandler
			}
		},
	})
})
