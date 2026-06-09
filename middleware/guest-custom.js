export default defineNuxtRouteMiddleware((to, from) => {
	const authStore = useAuthStore()
	const localeRoute = useLocaleRoute()
	const redirect = to.query.redirect || to.query.Redirect || to.query.REDIRECT || null

	if (authStore.loggedIn) {
		let redirectPath = localeRoute({
			name: 'index',
		})

		if (redirect) {
			// redirect parametresini temizle
			const cleanQuery = { ...to.query }
			delete cleanQuery.redirect
			delete cleanQuery.Redirect
			delete cleanQuery.REDIRECT

			redirectPath = redirect
		}

		return navigateTo(redirectPath, { external: true })
	}
})
