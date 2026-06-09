import { defineStore } from 'pinia'

import apiList from '@/apis/ApiList'
import { consoleLog } from '#imports'

export const useTestimonialsStore = defineStore('testimonials', {
	state: () => ({
		country: [],
		locale: [],
	}),
	getters: {
		getRandomTestimonial(state) {
			const selectedTestimonials = []
			const testimonialsCount = 3

			const selectedCountry = state.country
				.slice()
				.sort(() => 0.5 - Math.random())
				.slice(0, testimonialsCount)
			selectedTestimonials.push(...selectedCountry)

			if (selectedCountry.length !== testimonialsCount) {
				const selectedLocale = state.locale
					.slice()
					.sort(() => 0.5 - Math.random())
					.slice(0, testimonialsCount)
				const diff = testimonialsCount - selectedTestimonials.length
				selectedTestimonials.push(...selectedLocale.slice(0, diff))
			}
			return selectedTestimonials
		},
	},
	actions: {
		async getTestimonials() {
			if (this.country.length === 0 && this.locale.length === 0) {
				await useRequestAdapter()
					.get(apiList.testimonials.get)
					.then((response) => {
						this.country = response.data.testimonials.country
						this.locale = response.data.testimonials.locale
					})
					.catch((error) => {
						consoleLog(error)
					})
			}
			// return this
		},
	},
})
