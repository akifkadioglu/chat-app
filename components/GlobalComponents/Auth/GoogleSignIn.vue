<template>
	<div ref="googleSignIn" class="gsi-wrapper" />
</template>

<script>
import { consoleLog } from '#imports'
import loadExternalScript from '~/helpers/loadExternalScript'

export default {
	data() {
		return {
			google: null,
		}
	},
	setup() {
		return {
			autModalStore: useAuthModalStore(),
			auth: useAuthStore(),
			colorMode: useColorMode(),
		}
	},
	computed: {
		googleSignInInitialized: {
			get() {
				return this.autModalStore.googleSignInInitialized
			},
			set(value) {
				this.autModalStore.googleSignInInitialized = value
			},
		},
	},
	mounted() {
		if (!this.googleSignInInitialized) {
			console.log('GoogleSignIn mounted initialized')
			this.initGoogleSignIn()
		}
		this.$emitter.on('loadGoogleSignIn', this.loadGoogleSignIn)

		this.$emitter.on('initGoogleSignIn', this.initGoogleSignIn)

		this.$emitter.on('promptGoogleSignIn', this.promptGoogleSignIn)
	},
	created() {
		this.$emitter.on('loadGoogleSignIn', this.loadGoogleSignIn)

		this.$emitter.on('initGoogleSignIn', this.initGoogleSignIn)

		this.$emitter.on('promptGoogleSignIn', this.promptGoogleSignIn)
	},
	methods: {
		async loadGoogleSignIn() {
			await new Promise((resolve) => {
				if (this.googleSignInInitialized) {
					consoleLog('googleSignInInitialized', window.google)
					resolve()
				}
				loadExternalScript('https://accounts.google.com/gsi/client').then(() => {
					window.google?.accounts.id.initialize({
						client_id: useRuntimeConfig().public.googleClientId,
						scope: 'profile email name',
						callback: this.handleCredentialResponse, // method to run after user clicks the Google sign in button
						context: 'signin',
					})
					this.googleSignInInitialized = true
					resolve()
				})
			})
		},
		async initGoogleSignIn() {
			await this.loadGoogleSignIn()
			// render button
			window.google?.accounts.id.renderButton(this.$refs.googleSignIn, {
				type: 'standard',
				text: 'continue_with',
				shape: 'rectangular',
				size: 'large',
				theme: this.colorMode.value === 'dark' ? 'filled_black' : '',
				logo_alignment: 'left',
				locale: this.$i18n.locale,
			})
		},
		async promptGoogleSignIn() {
			if (this.auth.loggedIn) {
				return
			}
			await this.loadGoogleSignIn()
			window.google?.accounts.id.prompt((notification) => {
				if (notification.isNotDisplayed()) {
					document.cookie = 'g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT'
					window.google.accounts.id.prompt()
				}
			})
		},
		async handleCredentialResponse(response) {
			consoleLog('response', response)
			await this.$requestAdapter
				.post(authApiList.auth.google.login, {
					credential: response.credential,
					from_app: 'api',
				})
				.then(async (response) => {
					this.$emit('authenticated', response.data.access_token)
				})
		},
	},
}
</script>

<style scoped></style>
