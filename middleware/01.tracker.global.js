import apiList from '~/apis/ApiList.js'

export default defineNuxtRouteMiddleware((to, from) => {
	// İlk sayfa yüklenmesinde çalışmaması için kontrol
	if (import.meta.server || !import.meta.browser || from.name === undefined || Object.keys(from).length === 0) {
		return
	}

	const settingsStore = useSettingsStore()
	const requestAdapter = useRequestAdapter()
	const trackerStore = useTrackerStore()

	trackerStore.getFingerprint().then((fingerprint) => {
		settingsStore.path = to.path
		requestAdapter
			.post(
				apiList.tracker.track,
				{
					f: fingerprint,
				},
				{
					customHeaders: {
						url: window.location.protocol + '//' + window.location.host + to.fullPath,
					},
					silentErrors: true,
				},
			)
			.then((response) => {})
			.catch((e) => null)
	})
})
