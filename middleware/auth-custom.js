export default defineNuxtRouteMiddleware(async (to, from) => {
	const authStore = useAuthStore()

	const ssoTicket = to.query.ticket || to.query.Ticket || to.query.TICKET

	if (ssoTicket) {
		const localeRoute = useLocaleRoute()

		// ticket parametresini temizle
		const cleanQuery = { ...to.query }
		delete cleanQuery.ticket
		delete cleanQuery.Ticket
		delete cleanQuery.TICKET

		// redirect path'i oluştur (ticket olmadan)
		const redirectPath =
			to.path + (Object.keys(cleanQuery).length > 0 ? '?' + new URLSearchParams(cleanQuery).toString() : '')

		return navigateTo(
			localeRoute({
				name: 'sso',
				query: {
					...to.query,
					redirect: redirectPath,
				},
			}),
		)
	}

	if (!authStore.loggedIn) {
		const config = useRuntimeConfig()
		const simpliersUrl = config.public.simpliersUrl
		const path = 'sso'
		const nuxtApp = useNuxtApp()
		const url = nuxtApp.$mergeDomainNPath(simpliersUrl, path)
		const token = useCookie('tracker').value
		const lang = nuxtApp.$i18n?.locale?.value || 'en'
		const app = 'chat'

		const host = config.public.baseUrl || window.location.origin
		const currentUrl = `${host}${to.fullPath}`

		return navigateTo(`${url}?redirect=${currentUrl}&tracker=${token}&lang=${lang}&app=${app}`, {
			external: true,
		})

		// 	const localeRoute = useLocaleRoute()
		// 	return localeRoute({
		// 		name: 'auth-login',
		// 		query: {
		// 			redirect: to.fullPath,
		// 		},
		// 	})
	}
})
