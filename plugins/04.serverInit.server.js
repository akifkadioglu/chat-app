import { queries } from 'simpliers-js-utils'
import { consoleLog } from '#imports'
import * as limitsJson from 'assets/settings/limits.json'

export default defineNuxtPlugin(async (nuxtApp) => {
	// Bu kod sadece sunucu tarafında çalışır
	if (!import.meta.server) {
		return
	}
	const event = useRequestEvent()
	// event.req ve event.res'e erişebilirsiniz

	// Pinia store'a erişim
	const trackerStore = useTrackerStore()
	const authStore = useAuthStore()
	const sessionStore = useSessionStore()
	const settingsStore = useSettingsStore()
	const runtimeConfig = useRuntimeConfig()

	const req = event.req
	const res = event.res
	const query = useRoute().query
	consoleLog('query', query)
	const scheme = req.headers['x-forwarded-proto'] || req.connection?.encrypted ? 'https' : 'http'
	const host = req.headers.host || 'localhost'
	const path = (req.url || '/').split('?')[0].split('#')[0]
	if (host.startsWith('127.0.0.1') || host.startsWith('::1') || host.startsWith('localhost')) {
		authStore.host = 'localhost'
	} else {
		authStore.host = host
	}

	const url = scheme + '://' + host + req.url

	let ip = req.headers['x-forwarded-for']?.split(',').pop() || req.connection.remoteAddress
	if (ip === '::1') {
		ip = '127.0.0.1'
	}
	const ipCity = req.headers['cf-ipcity'] ?? ''
	const ipCountry = req.headers['cf-ipcountry'] ?? ''
	const timezone = req.headers['cf-timezone'] ?? ''
	const region = req.headers['cf-region'] ?? ''
	const regionCode = req.headers['cf-region-code'] ?? ''
	const metroCode = req.headers['cf-metro-code'] ?? ''
	const postalCode = req.headers['cf-postal-code'] ?? ''
	const referer = req.headers.referer ?? ''

	// const token = await this.$cookies.get('tracker-token')

	// for mobile apps START
	if (req.headers['x-tracker-token']) {
		const envBaseUrl = runtimeConfig.public.apiBaseUrl
		const prod = import.meta.env.PROD
		let baseProductionUrlList = []
		if (prod) {
			baseProductionUrlList = [
				'https://api.simpliers.com/',
				'https://api.simpliers.co/',
				'https://api-sm.instabom.com/',
				'https://api.simpliers.com',
				'https://api.simpliers.co',
				'https://api-sm.instabom.com',
			]
		} else {
			baseProductionUrlList = [
				envBaseUrl,
				'http://localhost/_simpliers_giveaway/simpliers-giveaway-api/public/',
				'http://localhost/_simpliers_giveaway/simpliers-giveaway-api/public',
			]
		}
		if (!baseProductionUrlList.includes(req.headers['x-token-authority'])) {
			throw new Error(
				'Token-authority is not valid. Please contact support Authority: ' + req.headers['x-token-authority'],
			)
		}
		const trackerToken = req.headers['x-tracker-token']
		await trackerStore.setToken(trackerToken)
		// await commit('tracker/setToken', trackerToken)

		if (req.headers['x-auth-token']) {
			const bearerToken = req.headers['x-auth-token']
			await authStore.setToken(bearerToken)
		} else {
			authStore.setUser(null)
			await authStore.setToken(null)
			authStore.logout()
		}

		sessionStore.setMobile(true)
		// await commit('session/setMobile', true)

		if (req.headers['x-support-screen-recording'] === 'true') {
			settingsStore.setSupportScreenRecording(true)
			// await commit('settings/setSupportScreenRecording', true)
		}
	}
	// for mobile apps END

	const serverName = req.headers['x-app-server'] ?? runtimeConfig?.public?.SERVER_NAME ?? 'localhost'
	// consoleLog('serverName', serverName)
	trackerStore.headers = {
		...trackerStore.headers,
		url,
		'x-forwarded-for': ip,
		// 'x-forwarded-proto': scheme,
		// 'x-forwarded-host': host,
		'x-g-city': ipCity,
		'x-g-country': ipCountry,
		'x-g-timezone': timezone,
		'x-g-region': region,
		'x-g-region-code': regionCode,
		'x-g-metro-code': metroCode,
		'x-g-postal-code': postalCode,
		'x-referer': referer,
		'x-server-name': serverName,
		'x-app-host': host,
	}
	// commit('tracker/setHeaders', {
	//     url,
	//     'x-forwarded-for': ip,
	//     'x-forwarded-proto': scheme,
	//     // 'x-forwarded-host': host,
	//     'x-g-city': ipCity,
	//     'x-g-country': ipCountry,
	//     'x-g-timezone': timezone,
	//     'x-g-region': region,
	//     'x-g-region-code': regionCode,
	//     'x-g-metro-code': metroCode,
	//     'x-g-postal-code': postalCode,
	//     'x-referer': referer,
	//     'x-server-name': serverName,
	//     'x-app-host': host
	// })

	if (query?.t) {
		await trackerStore.setToken(query?.t)
		// await this.$cookies.set('tracker-token', query?.t, {
		//     maxAge: 60 * 60 * 24 * 365 * 5,
		//     path: '/'
		// }) // 5 years
	}

	if (query?.a) {
		await authStore.setToken(query?.a)
		// await this.$cookies.set('auth._token.local', query?.a, {
		//     maxAge: 60 * 60 * 24 * 365,
		//     path: '/'
		// }) // 5 years
	}

	if (query?.a || query.t) {
		delete query?.a
		delete query?.t

		const queryString = queries.makeQueryString(query)
		consoleLog('redirecting to clear queries', path, queryString)
		res.writeHead(301, { Location: path + '?' + queryString })
		res.end()
		return
	}

	sessionStore.data['country'] = ipCountry
	if (ipCountry) {
		const limits = limitsJson.default[ipCountry.toLowerCase()] ?? limitsJson.default.global
		settingsStore.setLimits(limits)
	}
	// commit('session/add', {
	//     country: ipCountry
	// })

	settingsStore.setServerName(serverName)
	// commit('settings/setServerName', serverName)

	settingsStore.setHost(serverName)
	// commit('settings/setHost', host)

	settingsStore.setPath(serverName)
	// commit('settings/setPath', path)

	consoleLog('serverInit', serverName, authStore.token)

	// if (useCookie('auth-token').value) {
	//   const jwtToken = await useRequestAdapter().post(apiList.exchangeToken, {
	//     token: useCookie('auth-token').value,
	//   })
	//     .then(async (response) => {
	//       return response?.data?.access_token;
	//     }).catch((error) => {
	//       consoleLog(error.data);
	//     });
	//
	//   if (jwtToken) {
	//     const domain = host.split(':')[0].split('.').slice(-2).join('.');
	//     useCookie('auth-token', {
	//       domain: `.${domain}`,
	//     }).value = null;
	//     await authStore.setToken(jwtToken);
	//   }
	// }

	// const preferredTheme = useCookie('root-preferred-theme').value
	// const colorMode = useColorMode()
	// colorMode.preference = preferredTheme || 'system'

	consoleLog('Auth token present:', authStore.token)
	// if (authStore.token) {
	// 	const requestAdapter = useRequestAdapter()
	// 	await requestAdapter.getToken()
	// }
})
