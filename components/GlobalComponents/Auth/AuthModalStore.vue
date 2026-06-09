<template>
	<modal
		ref="modal"
		@close="consoleLog('Auth modal close')"
		@closed="consoleLog('Auth modal closed')"
		@opened="consoleLog('Auth modal opened')"
		@open="onModalShow"
	>
		<transition
			name="autModalFade"
			mode="out-in"
			enter-active-class="animate__animated animate__fadeIn"
			leave-active-class="animate__animated animate__fadeOut animate__faster"
		>
			<LoginForm
				v-if="content === 'login'"
				key="login"
				:in-modal="true"
				:next="$route.fullPath"
				@changeModalContent="changeModalContent"
				@authenticated="authenticated"
				titleTag="div"
			>
				<template #social>
					<div class="text-center">
						<google-sign-in @authenticated="authenticated" />
					</div>
				</template>
			</LoginForm>
			<RegisterForm
				v-else-if="content === 'register'"
				key="register"
				:in-modal="true"
				:next="$route.fullPath"
				@changeModalContent="changeModalContent"
				@authenticated="authenticated"
				titleTag="div"
			>
				<template #social>
					<google-sign-in @authenticated="authenticated" />
				</template>
			</RegisterForm>
			<ForgotPasswordForm
				v-else-if="content === 'forgotPassword'"
				key="forgotPassword"
				:in-modal="true"
				@changeModalContent="changeModalContent"
				@forgotPasswordSent="forgotPasswordSent"
				titleTag="div"
			/>
			<google-sign-in v-else @authenticated="authenticated" />
		</transition>
	</modal>
</template>

<script>
// import Bootstrap from '@/plugins/bootstrap'
import apiList from '@/apis/ApiList'
import ForgotPasswordForm from '~/components/GlobalComponents/Auth/ForgotPasswordForm.vue'
import RegisterChat from '~/components/GlobalComponents/Auth/RegisterChat.vue'
import LoginChat from '~/components/GlobalComponents/Auth/LoginChat.vue'
import GoogleSignIn from '~/components/GlobalComponents/Auth/GoogleSignIn.vue'
import { useAuthStore } from '#imports'
import Modal from '~/components/GlobalComponents/Modal.vue'

export default {
	components: {
		Modal,
		ForgotPasswordForm,
		RegisterForm: RegisterChat,
		LoginForm: LoginChat,
		GoogleSignIn,
	},
	data() {
		return {
			modal: null,
			content: 'login',
		}
	},
	setup() {
		return {
			auth: useAuthStore(),
		}
	},
	mounted() {
		if (!import.meta.browser) {
			return
		}

		if (!this.auth.loggedIn) {
			this.onModalShow()
		}

		this.$emitter.emit('initGoogleSignIn')

		this.$emitter.on('showAuthModal', (content = 'login') => {
			this.content = content
			this.$refs.modal?.showModal()
		})
	},
	methods: {
		changeModalContent(content) {
			this.content = content
		},
		async authenticated(accessToken) {
			consoleLog('AuthModalStore authenticated', accessToken)
			// await this.$auth.strategy.token.set(accessToken)
			await this.auth.setToken(accessToken)
			await this.$requestAdapter
				.get(apiList.auth.user)
				.then(async (user) => {
					await this.auth.setUser(user.data.user)
					this.$toast.success(
						this.$t('components.globalComponents.auth.common.welcomeMessage', { name: user.data.user.name }),
					)
				})
				.catch((err) => {})
				.finally()
			this.hideModal()
		},
		forgotPasswordSent() {
			this.hideModal()
		},
		hideModal() {
			const modal = this.$refs.modal
			if (modal) {
				modal.hideModal()
			}
		},
		onModalShow() {
			if (import.meta.client) {
				this.$emitter?.emit('initGoogleSignIn')
				this.$requestAdapter.getToken()
			}
		},
	},
}
</script>
