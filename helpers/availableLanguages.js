export const availableLanguages = [
	{ code: 'en', locale: 'en_US', name: 'English', hello: 'Hello' },
	{ code: 'tr', locale: 'tr_TR', name: 'Türkçe', hello: 'Merhaba' },
	{ code: 'pt', locale: 'pt_PT', name: 'Português', hello: 'Olá' },
	{ code: 'es', locale: 'es_ES', name: 'Español', hello: 'Hola' },
	{ code: 'fr', locale: 'fr_FR', name: 'Français', hello: 'Bonjour' },
	{ code: 'ro', locale: 'ro_RO', name: 'Română', hello: 'Salut' },
	{ code: 'de', locale: 'de_DE', name: 'Deutsch', hello: 'Hallo' },
	{ code: 'it', locale: 'it_IT', name: 'Italiano', hello: 'Ciao' },
]

export function customizeLocale(country) {
	availableLanguages.forEach((item) => {
		if (country === 'BR' && item.code === 'pt') {
			item.locale = 'pt_BR'
		}
		if (country === 'AR' && item.code === 'es') {
			item.locale = 'es_AR'
		}
		if (country === 'CO' && item.code === 'es') {
			item.locale = 'es_CO'
		}
		if (country === 'CL' && item.code === 'es') {
			item.locale = 'es_CL'
		}
		if (country === 'MX' && item.code === 'es') {
			item.locale = 'es_MX'
		}
		if (country === 'GB' && item.code === 'en') {
			item.locale = 'en_GB'
		}
	})
	return availableLanguages
}

export function getCustomizedLanguage(country) {
	const customizedLocales = customizeLocale(country)
	return customizedLocales.find((item) => item.code === country) ?? availableLanguages[0]
}

export const localizedVariants = [
	{ country: 'BR', lang: 'pt', locale: 'pt_BR', timezone: 'Sao Paulo', utcOffset: -3 },
	{ country: 'AR', lang: 'es', locale: 'es_AR', timezone: 'Buenos Aires', utcOffset: -3 },
	{ country: 'CO', lang: 'es', locale: 'es_CO', timezone: 'Bogota', utcOffset: -5 },
	{ country: 'CL', lang: 'es', locale: 'es_CL', timezone: 'Santiago', utcOffset: -4 },
	{ country: 'MX', lang: 'es', locale: 'es_MX', timezone: 'Mexico City', utcOffset: -6 },
	{ country: 'GB', lang: 'en', locale: 'en_GB', timezone: 'London', utcOffset: 0 },
	{ country: 'US', lang: 'en', locale: 'en_US', timezone: 'New York', utcOffset: -5 },
	{ country: 'TR', lang: 'tr', locale: 'tr_TR', timezone: 'Istanbul', utcOffset: 3 },
	{ country: 'RO', lang: 'ro', locale: 'ro_RO', timezone: 'Bucharest', utcOffset: 2 },
	{ country: 'DE', lang: 'de', locale: 'de_DE', timezone: 'Berlin', utcOffset: 1 },
	{ country: 'IT', lang: 'it', locale: 'it_IT', timezone: 'Rome', utcOffset: 1 },
	{ country: 'FR', lang: 'fr', locale: 'fr_FR', timezone: 'Paris', utcOffset: 1 },
	{ country: 'ES', lang: 'es', locale: 'es_ES', timezone: 'Madrid', utcOffset: 1 },
	{ country: 'PT', lang: 'pt', locale: 'pt_PT', timezone: 'Lisbon', utcOffset: 0 },
]

const defaultTimezones = {
	en: { timezone: 'New York', utcOffset: -5 },
	tr: { timezone: 'Istanbul', utcOffset: 3 },
	pt: { timezone: 'Lisbon', utcOffset: 0 },
	es: { timezone: 'Madrid', utcOffset: 1 },
	fr: { timezone: 'Paris', utcOffset: 1 },
	ro: { timezone: 'Bucharest', utcOffset: 2 },
	de: { timezone: 'Berlin', utcOffset: 1 },
	it: { timezone: 'Rome', utcOffset: 1 },
}

export function getCustomizedTimezones(country) {
	const match = localizedVariants.filter((v) => v.country === country)

	return availableLanguages.map((lang) => {
		const variant = match.find((v) => v.lang === lang.code)
		const fallback = defaultTimezones[lang.code]
		return {
			code: lang.code,
			timezone: variant?.timezone ?? fallback.timezone,
			utcOffset: variant?.utcOffset ?? fallback.utcOffset,
		}
	})
}

export function getCustomizedTimezone(country) {
	const variant = localizedVariants.find((v) => v.country === country)
	const fallback = defaultTimezones['en']
	return {
		timezone: variant?.timezone ?? fallback.timezone,
		utcOffset: variant?.utcOffset ?? fallback.utcOffset,
		code: variant?.lang ?? fallback.code,
	}
}
