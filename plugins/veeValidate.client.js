import { defineNuxtPlugin } from '#app'

/**
 * vee-validate kurulumu client-only ve dinamik import ile yapılır.
 * Böylece rules + i18n eager entry bundle'ına girmez ve server'da çalışmaz.
 * validateOn* hepsi false; validation yalnızca manuel validate()/submit ile tetiklenir,
 * bu yüzden kurulumun hydration sonrası tamamlanması güvenli.
 */
export default defineNuxtPlugin((nuxtApp) => {
	const setup = async () => {
		const { configure, defineRule } = await import('vee-validate')
		const {
			alpha,
			alpha_spaces,
			between,
			confirmed,
			email,
			integer,
			max,
			max_value,
			min,
			min_value,
			numeric,
			required,
		} = await import('@vee-validate/rules')
		const { localize, setLocale } = await import('@vee-validate/i18n')
		const { default: en } = await import('@vee-validate/i18n/dist/locale/en.json')
		const { default: tr } = await import('@vee-validate/i18n/dist/locale/tr.json')

		defineRule('required', required)
		defineRule('email', email)
		defineRule('min', min)
		defineRule('max', max)
		defineRule('min_value', min_value)
		defineRule('max_value', max_value)
		defineRule('confirmed', confirmed)
		defineRule('integer', integer)
		defineRule('numeric', numeric)
		defineRule('alpha', alpha)
		defineRule('between', between)
		defineRule('alpha_spaces', alpha_spaces)

		defineRule('expdatecheck', (value) => {
			const month = parseInt(value.substring(0, 2))
			const year = parseInt(value.substring(2, 4))
			if (month > 12 || year < 12) {
				return nuxtApp.$i18n.t('plugins.veeValidate.expDateCheck')
			}
			const date = new Date(year + 2000, month)
			if (date < new Date()) {
				return nuxtApp.$i18n.t('plugins.veeValidate.dateInvalid')
			}

			return true
		})

		defineRule('twoWord', (value) => {
			const words = value?.split(' ') ?? []
			if (words.length < 2 || words[0].length < 2 || words[1].length < 2) {
				return nuxtApp.$i18n.t('plugins.veeValidate.twoWord')
			}
			return true
		})

		defineRule('phone', (value) => {
			if ((value?.length ?? 0) < 5) {
				return true
			}
			if (window?.libphonenumber) {
				return window.libphonenumber?.isValidNumber(value ?? '')
			}
			return true
		})

		defineRule('formPhone', (value) => {
			if (!value?.number) {
				return true
			}
			return window.libphonenumber?.isValidNumber(value.countryCode + ' ' + value.number)
		})

		defineRule('formAddress', (value) => {
			if (!value) {
				return true
			}
			if (value?.addressLine && value?.city && value?.state && value?.zip && value?.country) {
				return true
			}
			return nuxtApp.$i18n.t('plugins.veeValidate.formAddress')
		})

		defineRule('url', (value) => {
			if (value) {
				const urlPattern = new RegExp(
					'^(https?:\\/\\/)?' + // protocol
						'((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+([a-z]{2,}|[a-z\\d-]{2,})|' + // domain name
						'localhost|' + // localhost
						'\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|' + // IP address
						'\\[?[a-fA-F0-9]*:[a-fA-F0-9:]+\\])' + // IPv6
						'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
						'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
						'(\\#[-a-z\\d_]*)?$',
					'i',
				) // fragment locator
				return urlPattern.test(value) || nuxtApp.$i18n.t('plugins.veeValidate.url')
			}
			return true
		})

		defineRule('confirmed', (value, [target], ctx) => {
			if (value === ctx.form[target]) {
				return true
			}
			return nuxtApp.$i18n.t('plugins.veeValidate.confirmed', { target: target })
		})

		defineRule('validDate', (value) => {
			if (!value) {
				return true
			}

			if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
				return nuxtApp.$i18n.t('plugins.veeValidate.validDate')
			}

			const [year, month, day] = value.split('-').map(Number)

			if (month < 1 || month > 12) return nuxtApp.$i18n.t('plugins.veeValidate.validDate')

			const date = new Date(year, month - 1, day)

			const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

			return valid ? true : nuxtApp.$i18n.t('plugins.veeValidate.validDate')
		})

		configure({
			bails: true,
			generateMessage: localize({
				en,
				tr,
			}),
			validateOnInput: false,
			validateOnChange: false,
			validateOnBlur: false,
			validateOnModelUpdate: false,
		})

		const locale = nuxtApp.$i18n ? nuxtApp.$i18n.locale.value : 'en'
		setLocale(locale)

		if (nuxtApp.$i18n) {
			nuxtApp.$i18n.onBeforeLanguageSwitch = (oldLocale, newLocale) => {
				setLocale(newLocale)
			}
		}
	}

	// Hydration'ı bloklamadan, mount sonrası dinamik chunk olarak kur
	nuxtApp.hook('app:mounted', () => {
		setup()
	})
})
