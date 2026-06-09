import { LazyHydrationWrapper } from 'vue3-lazy-hydration'

export default defineNuxtPlugin((nuxtApp) => {
	// for custom registered name see Vue example above
	nuxtApp.vueApp.component('LazyHydrationWrapper', LazyHydrationWrapper)
})
