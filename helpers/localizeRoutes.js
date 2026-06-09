// localizeRoutes.js
// Helper to flatten nested routing into Nuxt i18n customRoutes.pages

// Define supported locales in one place
export const locales = ['de', 'el', 'en', 'es', 'fr', 'id', 'it', 'pt', 'ru', 'ro', 'tr']

const fallbackLocale = 'en'

const routing = {
	account: {
		de: '/konto',
		el: '/loghariasmos',
		en: '/account',
		es: '/cuenta',
		fr: '/compte',
		id: '/akun',
		it: '/account',
		pt: '/conta',
		ru: '/ucetnaya-zapis',
		tr: '/hesabim',
		accountInfo: {
			de: '/kontoinformation',
			el: '/plirofories-loghariasmou',
			en: '/account-info',
			es: '/informacion-de-cuenta',
			fr: '/informations-de-compte',
			id: '/info-akun',
			it: '/informazioni-sullaccount',
			pt: '/informacoes-da-conta',
			ru: '/informaciya-ob-akkaunte',
			tr: '/hesap-bilgileri',
		},
		credits: {
			de: '/credits',
			el: '/pistwseis',
			en: '/credits',
			es: '/creditos',
			fr: '/credits',
			id: '/kredit',
			it: '/crediti',
			pt: '/creditos',
			ru: '/kredity',
			tr: '/haklar',
		},
		giveaways: {
			de: '/gewinnspiele',
			el: '/diagonismous',
			en: '/giveaways',
			es: '/sorteos',
			fr: '/concours',
			id: '/giveaways',
			it: '/concorsi',
			pt: '/sorteios',
			ru: '/konkursi',
			tr: '/cekilisler',
		},
		participation: {
			de: '/beteiligung',
			el: '/symmetoxh',
			en: '/participation',
			es: '/participacion',
			fr: '/participation',
			id: '/partisipasi',
			it: '/partecipazione',
			pt: '/participacao',
			ru: '/uchastie',
			tr: '/liste',
		},
		payments: {
			de: '/zahlungen',
			el: '/pliromes',
			en: '/payments',
			es: '/pagos',
			fr: '/paiements',
			id: '/pembayaran',
			it: '/pagamenti',
			pt: '/pagamentos',
			ru: '/platezi',
			tr: '/odemeler',
			invoice: {
				de: '/rechnung',
				en: '/invoice',
				el: '/fatura',
				es: '/factura',
				fr: '/facture',
				id: '/faktur',
				it: '/fattura',
				pt: '/fatura',
				ru: '/fatura',
				tr: '/fatura',
				'[paymentid]': '/[paymentid]',
			},
		},
		subscription: {
			de: '/abonnements',
			el: '/sindromes',
			en: '/subscriptions',
			es: '/suscripciones',
			fr: '/abonnements',
			id: '/langganan',
			it: '/abbonamenti',
			pt: '/assinaturas',
			ru: '/podpiski',
			tr: '/abonelik',
		},
		threads: {
			de: '/mitteilungen',
			el: '/minymata',
			en: '/messages',
			es: '/mensajes',
			fr: '/messages',
			id: '/pesan',
			it: '/messaggi',
			pt: '/mensagens',
			ru: '/soobshheniya',
			tr: '/mesajlar',
		},
		// ... other nested routes
	},
}

function toKebabCase(str) {
	return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function normalizePath(path) {
	// Collapse multiple slashes and ensure a single leading slash
	const collapsed = path.replace(/\/+/g, '/')
	return collapsed.startsWith('/') ? collapsed : '/' + collapsed
}

function finalizePath(path) {
	// Collapse multiple slashes and ensure single leading slash
	const collapsed = path.replace(/\/+/g, '/')
	return collapsed.startsWith('/') ? collapsed : '/' + collapsed
}

function walk(node, parentKey, parentPaths, pages) {
	// Handle string leaf nodes: treat as path for all locales
	if (typeof node === 'string') {
		if (!parentKey) {
			return
		}
		const entry = {}
		locales.forEach((lang) => {
			const parts = [...parentPaths[lang], normalizePath(node)].filter(Boolean)
			entry[lang] = finalizePath(`/${parts.join('/')}`)
		})
		pages[parentKey] = entry
		return
	}
	// Only add a page entry if fallback locale path is defined and we have a parentKey
	const defaultPath = node[fallbackLocale]
	if (parentKey && typeof defaultPath === 'string') {
		const entry = {}
		locales.forEach((lang) => {
			const segment = typeof node[lang] === 'string' ? node[lang] : defaultPath
			// filter out undefined or non-string segments before normalizing
			const parts = [...parentPaths[lang], segment]
				.filter((seg) => typeof seg === 'string' && seg)
				.map((seg) => normalizePath(seg))
			entry[lang] = finalizePath(`/${parts.join('/')}`)
		})
		pages[parentKey] = entry
	}
	// Recurse into nested keys, skipping locale properties
	Object.entries(node).forEach(([key, value]) => {
		if (locales.includes(key)) {
			return
		}
		const kebabKey = toKebabCase(key)
		const newKey = parentKey ? `${parentKey}-${kebabKey}` : kebabKey
		// Build next parentPaths using fallback if needed
		const nextPaths = {}
		locales.forEach((lang) => {
			const segment = typeof node[lang] === 'string' ? node[lang] : defaultPath
			nextPaths[lang] = [...parentPaths[lang], segment]
		})
		walk(value, newKey, nextPaths, pages)
	})
}

/**
 * Generates Nuxt i18n pages mapping dynamically.
 */
export function generateLocalizedRoutes() {
	const pages = {}
	const parentPaths = {}
	locales.forEach((lang) => (parentPaths[lang] = []))
	walk(routing, '', parentPaths, pages)
	return pages
}

export default generateLocalizedRoutes
