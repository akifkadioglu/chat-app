import { defineStore } from 'pinia'
import apiList from '~/apis/ApiList.js'

export const usePlatformStore = defineStore('platform', {
	state: () => ({
		instagramAuthUrl: null,
		facebookAuthUrl: null,
		inFlightPromise: null,
	}),
	getters: {
		getInstagramAuthUrl: (s) => s.instagramAuthUrl,
		getFacebookAuthUrl: (s) => s.facebookAuthUrl,
		isInstagramBrowser: () => import.meta.client && /Instagram/i.test(navigator.userAgent),
		isMobileBrowser: () => import.meta.client && /Mobile/i.test(navigator.userAgent),
		isDesktop: () =>
			import.meta.client &&
			!/Mobi|Android|iPhone|iPad|iPod|Tablet|PlayBook|Silk|Kindle/i.test(navigator.userAgent) &&
			!(navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)),
	},
	actions: {
		async fetchAuthUrl(force = false) {
			consoleLog('fetching instagram auth url 1')
			if (this.instagramAuthUrl && this.facebookAuthUrl && !force) return
			consoleLog('fetching instagram auth url 2')

			if (this.inFlightPromise) return
			consoleLog('fetching instagram auth url 3')

			const requestAdapter = useRequestAdapter()
			const forceReAuth = !this.isInstagramBrowser
			this.inFlightPromise = requestAdapter
				.get(apiList.chat.instagram.authUrl, {
					query: {
						forceReAuth,
					},
				})
				.then((res) => {
					// consoleLog('fetched instagram auth url 4', res.data)
					this.instagramAuthUrl = res.data?.instagram_auth_url
					this.facebookAuthUrl = res.data.facebook_auth_url

					return {
						instagramAuthUrl: this.instagramAuthUrl,
						facebookAuthUrl: this.facebookAuthUrl,
					}
				})
				.finally(() => {
					this.inFlightPromise = null
				})
		},
		openInstagramTab() {
			if (!this.instagramAuthUrl) return
			// if (this.isMobileBrowser && !this.isInstagramBrowser && this.facebookAuthUrl) {
			// 	this.openFacebookTab()
			// 	return
			// }
			window.open(this.instagramAuthUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
		},
		openFacebookTab() {
			if (this.facebookAuthUrl) {
				window.open(this.facebookAuthUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
			}
		},
	},
})
