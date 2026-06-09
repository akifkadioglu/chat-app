import { defineNuxtPlugin } from '#app'

/**
 * GSAP'i global bundle'a dahil etmeden lazy yükler.
 * Kullanan component mounted() içinde: const { gsap, ScrollTrigger } = await this.$loadGsap()
 * Promise cache'lendiği için birden fazla çağrı aynı kayıtlı instance'ı döner.
 */
export default defineNuxtPlugin(() => {
	let gsapPromise = null

	const loadGsap = () => {
		if (!gsapPromise) {
			gsapPromise = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
				([{ gsap }, { ScrollTrigger }]) => {
					if (!gsap.core.globals()?.ScrollTrigger) {
						gsap.registerPlugin(ScrollTrigger)
					}
					return { gsap, ScrollTrigger }
				},
			)
		}
		return gsapPromise
	}

	return { provide: { loadGsap } }
})
