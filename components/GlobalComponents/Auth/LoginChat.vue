<template>
	<div class="max-w-md mx-auto rounded-2xl space-y-6">
		<!-- Heading -->
		<div class="text-center space-y-2">
			<i18n-t keypath="components.globalComponents.auth.loginForm.title" :tag="titleTag" class="text-2xl">
				<template #simpliers>
					<simpliers-logo />
				</template>
			</i18n-t>
			<p class="text-base-content/70">{{ $t('components.globalComponents.auth.loginForm.text') }}</p>
		</div>

		<!-- Social -->
		<div v-if="$slots.social">
			<slot name="social" />
			<div class="divider">{{ $t('components.globalComponents.auth.common.or') }}</div>
		</div>

		<VeeForm ref="form" v-slot="{ handleSubmit }" class="space-y-4" @submit="login">
			<!-- Error -->
			<ErrorHandler :error-message="errorMessage" />

			<!-- Email -->
			<VeeField
				v-slot="v"
				v-model="email"
				:name="$t('components.globalComponents.auth.loginForm.emailLabel')"
				rules="required|email"
				vid="email"
			>
				<div>
					<label for="email" class="label">
						<span class="label-text">{{ $t('components.globalComponents.auth.loginForm.emailLabel') }}</span>
					</label>
					<input
						id="email"
						v-model="email"
						:class="{
							'input-error': !v.meta.valid && v.meta.validated,
							'input-success': v.meta.valid && v.meta.validated,
						}"
						autocomplete="email"
						class="input input-bordered w-full"
						placeholder="email@site.com"
						type="email"
					/>
					<label class="label">
						<span v-if="v.errors[0]" class="label-text-alt text-error text-sm">{{ v.errors[0] }}</span>
					</label>
				</div>
			</VeeField>

			<!-- Password -->
			<VeeField
				v-slot="v"
				v-model="password"
				:name="$t('components.globalComponents.auth.loginForm.passwordLabel')"
				rules="required"
			>
				<div>
					<div class="flex justify-between items-center">
						<label for="password" class="label">
							<span class="label-text">
								{{ $t('components.globalComponents.auth.loginForm.passwordLabel') }}
							</span>
						</label>
						<a
							v-if="inModal"
							class="label-text-alt text-sm text-simpliers"
							href="javascript:"
							@click="$emit('changeModalContent', 'forgotPassword')"
						>
							{{ $t('components.globalComponents.auth.loginForm.forgotPasswordLink') }}
						</a>
						<localized-link
							v-else
							class="label-text-alt text-sm text-simpliers"
							name="auth-forgot-password"
							:query="$route.query"
						>
							{{ $t('components.globalComponents.auth.loginForm.forgotPasswordLink') }}
						</localized-link>
					</div>

					<div class="relative">
						<input
							id="password"
							v-model="password"
							:class="{
								'input-error': !v.meta.valid && v.meta.validated,
								'input-success': v.meta.valid && v.meta.validated,
							}"
							:type="showPassword ? 'text' : 'password'"
							autocomplete="current-password"
							class="input input-bordered w-full pr-10"
							placeholder="********"
						/>
						<a
							v-if="!!password"
							href="javascript:"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content"
							@click.prevent="showPassword = !showPassword"
						>
							<i v-if="showPassword" class="fa fa-eye-slash"></i>
							<i v-else class="fa fa-eye"></i>
						</a>
					</div>

					<!-- Error Message -->
					<label class="label">
						<span v-if="v.errors[0]" class="label-text-alt text-error text-sm">
							{{ v.errors[0] }}
						</span>
					</label>
				</div>
			</VeeField>

			<!-- Submit -->
			<button
				:disabled="isLoading || auth.loggedIn"
				class="btn-simpliers w-full"
				type="submit"
				@click.prevent="handleSubmit(login)"
			>
				<loading-element :is-loading="isLoading" size="16">
					<span class="text-nowrap">{{ $t('components.globalComponents.auth.loginForm.loginButton') }}</span>
				</loading-element>
			</button>

			<!-- Register -->
			<p class="text-center text-sm">
				{{ $t('components.globalComponents.auth.loginForm.registerText') }}

				<a v-if="inModal" class="text-simpliers" href="javascript:" @click="$emit('changeModalContent', 'register')">
					{{ $t('components.globalComponents.auth.loginForm.registerButton') }}
				</a>
				<localized-link v-else class="label-text-alt text-sm text-simpliers" name="index" :query="$route.query">
					{{ $t('components.globalComponents.auth.loginForm.registerButton') }}
				</localized-link>
			</p>
		</VeeForm>
	</div>
</template>

<script>
import { consoleLog } from '#imports'
import { ErrorMessage, Field, Form } from 'vee-validate'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import authApiList from 'simpliers-nuxt-utils/authApiList'
import ErrorHandler from '~/components/GlobalComponents/Auth/ErrorHandler.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'

export default {
	components: {
		SimpliersLogo,
		ErrorHandler,
		LocalizedLink,
		LoadingElement,
		VeeForm: Form,
		VeeField: Field,
		VeeErrorMessage: ErrorMessage,
	},
	props: {
		inModal: {
			type: Boolean,
			default: false,
		},
		titleTag: {
			type: String,
			default: 'h1',
		},
	},
	data: () => ({
		email: null,
		password: null,
		errorMessage: null,
		isLoading: false,
		showPassword: false,
	}),
	setup() {
		return {
			auth: useAuthStore(),
		}
	},
	methods: {
		async login() {
			if (this.auth.loggedIn) {
				return
			}
			this.isLoading = true
			this.errorMessage = null
			await this.$requestAdapter
				.post(authApiList.auth.login, {
					email: this.email,
					password: this.password,
				})
				.then(async (response) => {
					this.auth.setToken(response.data.access_token)
					this.$emit('authenticated', response.data.access_token)
				})
				.catch((error) => {
					consoleLog('error', error.response)
					this.errorMessage = error.response?.data?.message ?? error.message
					if (error.response?.status === 422) {
						this.$refs.form.setErrors(error.response.data.errors ?? [])
					}
				})

			this.isLoading = false
		},
	},
}
</script>
