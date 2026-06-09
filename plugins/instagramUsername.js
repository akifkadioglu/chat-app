import { defineNuxtPlugin } from '#app'

/**
 * @property {function} this.$instagramUsername
 */
export default defineNuxtPlugin((nuxtApp) => {
	const getInstagramUsername = (chat = true) => {
		const sessionStore = useSessionStore() // nuxtApp.$pinia'yı geçmek iyi bir pratiktir

		const country = sessionStore.data?.country

		if (country && ['TR', 'AZ'].includes(country)) {
			if (chat) return 'simplierschat'
			return 'simpliersturkiye'
			// return 'simpliers'
		}
		if (country && ['BR'].includes(country)) {
			return 'simpliersbrasil'
		}

		if (
			country &&
			[
				'ES', // İspanya
				'AR', // Arjantin
				'BO', // Bolivya
				'CL', // Şili
				'CO', // Kolombiya
				'CR', // Kosta Rika
				'CU', // Küba
				'DO', // Dominik Cumhuriyeti
				'EC', // Ekvador
				'SV', // El Salvador
				'GT', // Guatemala
				'HN', // Honduras
				'MX', // Meksika
				'NI', // Nikaragua
				'PA', // Panama
				'PY', // Paraguay
				'PE', // Peru
				'UY', // Uruguay
				'VE', // Venezuela
				'PR', // Porto Riko
			].includes(country)
		) {
			return 'simplierslatam'
		}

		return 'simpliers'
	}
	const getInstagramProfilePicture = () => {
		return `/instagram/profile-pictures/${getInstagramUsername()}.png`
	}

	nuxtApp.provide('instagramProfilePicture', getInstagramProfilePicture)
	nuxtApp.provide('instagramUsername', getInstagramUsername)
})

// Vue.prototype.$instagramUsername = function () {
//     const country = this.$store.state.session.data.country
//     if (['TR', 'AZ'].includes(country)) {
//         return 'simpliersturkiye'
//     }
//
//     if (['BR'].includes(country)) {
//         return 'simpliersbrasil'
//     }
//
//     // if (['N/A'].includes(country)) {
//     //   return 'simpliersna'
//     // }
//
//     return 'simpliers'
// }
