import { defineNuxtPlugin } from '#app'

/**
 * @property {function} this.$swal
 */
export default defineNuxtPlugin((nuxtApp) => {
	let swalInstance = null
	let currentTheme = null

	// Swal için lazy loader fonksiyonu
	const getSwal = async () => {
		const colorMode = useColorMode()
		const theme = colorMode.value

		// Eğer tema değiştiyse veya ilk yüklemeyse yeni instance oluştur
		if (!swalInstance || currentTheme !== theme) {
			// Tema değiştiyse mevcut instance'ı temizle
			if (swalInstance) {
				swalInstance = null
			}

			const Swal = (await import('sweetalert2')).default
			currentTheme = theme // Tema durumunu güncelle

			// Yeni instance oluştur
			swalInstance = Swal.mixin({
				confirmButtonColor: '#41b882',
				cancelButtonColor: '#ff7674',
				buttonsStyling: false,
				padding: '1rem',
				footer: 'simpliers',
				theme: theme, // Güncel tema
				customClass: {
					container: 'prevent-dropdown-close',
					popup: 'rounded-4xl',
					// popup: '...',
					// header: '...',
					title: 'h4 fw-normal',
					// closeButton: '...',
					// icon: '...',
					// image: '...',
					// content: '...',
					htmlContainer: 'm-0 px-3 !text-start pt-3 pb-1 rounded-4xl text-reset fs-5',
					// input: '...',
					// inputLabel: '...',
					// validationMessage: '...',
					actions: 'pb-4',
					confirmButton: 'btn btn-soft btn-success btn-transition mx-2',
					denyButton: 'transition btn btn-soft btn-error btn-transition mx-2',
					cancelButton: 'transition btn btn-ghost btn-error btn-transition mx-2',
					footer: 'text-primary text-xl mb-0 pt-3',
					// loader: 'spinner-border text-primary btn-transition mx-2',
					// timerProgressBar: '....'
				},
			})
		}

		return swalInstance
	}

	// SweetAlert'ı dinleme fonksiyonu - tema değişikliğini takip et
	if (import.meta.client) {
		const colorMode = useColorMode()
		watch(
			() => colorMode.value,
			() => {
				// Tema değiştiğinde swalInstance'ı sıfırla
				// Yeni tema ile tekrar oluşturulacak
				swalInstance = null
			},
		)
	}

	// Proxy function to handle all SweetAlert methods
	const swalProxy = new Proxy(
		{},
		{
			get: (target, prop) => {
				// Return a function that will dynamically import Swal when called
				return async (...args) => {
					const swal = await getSwal()

					// Special handling for methods that return Promises like swal.fire()
					if (typeof swal[prop] === 'function') {
						return swal[prop](...args)
					}

					return swal[prop]
				}
			},
		},
	)

	nuxtApp.provide('swal', swalProxy)
})
