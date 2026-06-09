<template>
	<div class="max-w-md mx-auto rounded-2xl space-y-6">
		<!-- Heading -->
		<div class="text-center space-y-2">
			<i18n-t keypath="components.globalComponents.auth.registerForm.title" :tag="titleTag" class="text-2xl">
				<template #simpliers>
					<simpliers-logo />
				</template>
			</i18n-t>
			<h2 class="text-2xl">{{ $t('') }}</h2>
			<p class="text-base-content/70">{{ $t('components.globalComponents.auth.registerForm.text') }}</p>
		</div>

		<!-- Social -->
		<div>
			<slot name="social" />
		</div>

		<div class="divider">{{ $t('components.globalComponents.auth.common.or') }}</div>

		<VeeForm ref="form" v-slot="{ handleSubmit }" @submit="register" class="space-y-4">
			<!-- Error -->
			<ErrorHandler :error-message="errorMessage" />

			<!-- Name -->
			<VeeField
				v-slot="v"
				rules="required|twoWord"
				vid="name"
				:name="$t('components.globalComponents.auth.registerForm.nameLabel')"
				v-model="name"
			>
				<div>
					<label for="name" class="label">
						<span class="label-text">{{ $t('components.globalComponents.auth.registerForm.nameLabel') }}</span>
					</label>
					<input
						id="name"
						v-model="name"
						type="text"
						:placeholder="$t('components.globalComponents.auth.registerForm.namePlaceHolder')"
						autocomplete="name"
						class="input input-bordered w-full"
						:class="{
							'input-error': !v.meta.valid && v.meta.validated,
							'input-success': v.meta.valid && v.meta.validated,
						}"
						@input="name = $capitalize($event.target.value, $i18n.locale)"
					/>
					<label class="label">
						<span v-if="v.errors[0]" class="label-text-alt text-error text-sm">{{ v.errors[0] }}</span>
					</label>
				</div>
			</VeeField>

			<!-- Email -->
			<VeeField
				v-slot="v"
				rules="required|email"
				vid="email"
				:name="$t('components.globalComponents.auth.registerForm.emailLabel')"
				v-model="email"
			>
				<div>
					<label for="email" class="label">
						<span class="label-text">{{ $t('components.globalComponents.auth.registerForm.emailLabel') }}</span>
					</label>
					<input
						id="email"
						v-model="email"
						type="email"
						placeholder="email@site.com"
						autocomplete="email"
						class="input input-bordered w-full"
						:class="{
							'input-error': !v.meta.valid && v.meta.validated,
							'input-success': v.meta.valid && v.meta.validated,
						}"
					/>
					<label class="label">
						<span v-if="v.errors[0]" class="label-text-alt text-error text-sm">{{ v.errors[0] }}</span>
					</label>
				</div>
			</VeeField>

			<!-- Password -->
			<VeeField
				v-slot="v"
				rules="required|min:6"
				vid="password"
				:name="$t('components.globalComponents.auth.registerForm.passwordLabel')"
				v-model="password"
			>
				<div>
					<label for="password" class="label">
						<span class="label-text">
							{{ $t('components.globalComponents.auth.registerForm.passwordLabel') }}
						</span>
					</label>

					<!-- Input & Eye Button -->
					<div class="relative">
						<input
							id="password"
							v-model="password"
							:type="showPassword ? 'text' : 'password'"
							placeholder="********"
							autocomplete="new-password"
							class="input input-bordered w-full pr-10"
							:class="{
								'input-error': !v.meta.valid && v.meta.validated,
								'input-success': v.meta.valid && v.meta.validated,
							}"
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
			<!-- Password Confirmation -->
			<VeeField
				v-slot="v"
				:rules="'required|confirmed:' + $t('components.globalComponents.auth.registerForm.passwordLabel')"
				:name="$t('components.globalComponents.auth.registerForm.confirmPasswordLabel')"
				v-model="passwordConfirmation"
			>
				<div>
					<label for="password-confirmation" class="label">
						<span class="label-text">
							{{ $t('components.globalComponents.auth.registerForm.confirmPasswordLabel') }}
						</span>
					</label>

					<!-- Input & Eye Button -->
					<div class="relative">
						<input
							id="password-confirmation"
							v-model="passwordConfirmation"
							:type="showPasswordConfirmation ? 'text' : 'password'"
							placeholder="********"
							autocomplete="new-password"
							class="input input-bordered w-full pr-10"
							:class="{
								'input-error': !v.meta.valid && v.meta.validated,
								'input-success': v.meta.valid && v.meta.validated,
							}"
						/>
						<a
							v-if="!!passwordConfirmation"
							href="javascript:"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content"
							@click.prevent="showPasswordConfirmation = !showPasswordConfirmation"
						>
							<i v-if="showPasswordConfirmation" class="fa fa-eye-slash"></i>
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
			<button type="submit" class="btn-simpliers w-full" :disabled="isLoading" @click.prevent="handleSubmit(register)">
				<loading-element :is-loading="isLoading">
					{{ $t('components.globalComponents.auth.registerForm.registerButton') }}
				</loading-element>
			</button>

			<!-- Login -->
			<p class="text-center text-sm">
				{{ $t('components.globalComponents.auth.registerForm.loginText') }}
				<a v-if="inModal" href="javascript:" class="text-simpliers" @click="$emit('changeModalContent', 'login')">
					{{ $t('components.globalComponents.auth.registerForm.loginButton') }}
				</a>
				<localized-link v-else class="label-text-alt text-sm text-simpliers" name="auth-login" :query="$route.query">
					<span class="text-nowrap">{{ $t('components.globalComponents.auth.registerForm.loginButton') }}</span>
				</localized-link>
			</p>
		</VeeForm>
	</div>
</template>

<script>
import { consoleLog } from '#imports'
import { ErrorMessage, Field, Form } from 'vee-validate'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import authApiList from 'simpliers-nuxt-utils/authApiList'
import ErrorHandler from '~/components/GlobalComponents/Auth/ErrorHandler.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'

export default {
	components: {
		SimpliersLogo,
		LocalizedLink,
		ErrorHandler,
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
		name: null,
		email: null,
		password: null,
		passwordConfirmation: null,
		errorMessage: null,
		isLoading: false,
		showPassword: false,
		showPasswordConfirmation: false,
	}),
	setup() {
		return {
			auth: useAuthStore(),
		}
	},
	methods: {
		async register() {
			if (this.auth.loggedIn) {
				return
			}
			this.isLoading = true
			this.errorMessage = null
			await this.$requestAdapter
				.post(authApiList.auth.register, {
					name: this.name,
					email: this.email,
					password: this.password,
					passwordConfirmation: this.passwordConfirmation,
				})
				.then(async (response) => {
					consoleLog('response', response)
					this.auth.setToken(response.data.access_token)
					this.$emit('authenticated', response.data.access_token)
				})
				.catch((error) => {
					consoleLog('error', error.response)
					this.errorMessage = error.response?.data?.message ?? error.message
					if (error.response?.status === 422) {
						const flatErrors = error.response.data.errors
						flatErrors[this.$t('components.globalComponents.auth.registerForm.emailLabel')] = flatErrors.email
						this.$refs.form.setErrors(flatErrors ?? [])
					}
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
