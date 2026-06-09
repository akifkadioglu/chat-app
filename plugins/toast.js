// plugins/toast.js
import { defineNuxtPlugin } from '#app'
import ToastPlugin from 'vue-toast-notification'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(ToastPlugin, {
		position: 'bottom-right',
		pauseOnHover: true,
	})
})
