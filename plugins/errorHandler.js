import { consoleLog } from '#imports'
import apiList from '~/apis/ApiList.js'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook('vue:error', async (error, instance, info) => {
		consoleLog('nuxtApp.vueApp:error', error, instance, info)

		if (error.message === 'Article not found') {
			return false
		}

		await nuxtApp.$requestAdapter.post(apiList.webErrorLogs, {
			error: error.message,
			stack: error.stack,
			component: instance?.$options?.name,
			info,
			path: instance?.$route?.path,
			isClient: process.client,
			props: instance?.$props,
			state: instance?.$data,
			server: useSettingsStore()?.serverName,
		})
	})
})
