<template>
	<div class="max-w-md mx-auto rounded-2xl space-y-6">
		<!-- Heading -->
		<div class="text-center space-y-2">
			<i18n-t keypath="components.globalComponents.auth.forgotPasswordForm.title" :tag="titleTag" class="text-2xl">
				<template #simpliers>
					<simpliers-logo />
				</template>
			</i18n-t>
			<p class="text-base-content/70">{{ $t('components.globalComponents.auth.forgotPasswordForm.text') }}</p>
		</div>

		<VeeForm ref="form" v-slot="{ handleSubmit }" class="space-y-4">
			<!-- Error -->
			<ErrorHandler :error-message="errorMessage" />

			<!-- Email -->
			<VeeField
				v-slot="v"
				rules="required|email"
				vid="email"
				:name="$t('components.globalComponents.auth.forgotPasswordForm.emailLabel')"
				v-model="email"
			>
				<div>
					<!-- Label & Back to Login Link -->
					<div class="flex justify-between items-center">
						<label for="email" class="label">
							<span class="label-text">
								{{ $t('components.globalComponents.auth.forgotPasswordForm.emailLabel') }}
							</span>
						</label>
						<a
							v-if="inModal"
							href="javascript:"
							class="label-text-alt text-sm text-simpliers"
							@click="$emit('changeModalContent', 'login')"
						>
							<i class="fa fa-chevron-left mr-1" />
							{{ $t('components.globalComponents.auth.forgotPasswordForm.backToLoginButton') }}
						</a>
						<localized-link
							v-else
							name="auth-login"
							:query="$route.query"
							class="label-text-alt text-sm text-simpliers"
						>
							<i class="fa fa-chevron-left mr-1" />
							{{ $t('components.globalComponents.auth.forgotPasswordForm.backToLoginButton') }}
						</localized-link>
					</div>

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

			<!-- Submit -->
			<button
				type="submit"
				class="btn-simpliers w-full"
				:disabled="isLoading"
				@click.prevent="handleSubmit(forgotPassword)"
			>
				<loading-element :is-loading="isLoading">
					<span class="text-nowrap">{{
						$t('components.globalComponents.auth.forgotPasswordForm.sendLinkButton')
					}}</span>
				</loading-element>
			</button>
		</VeeForm>
	</div>
</template>

<script>
import { consoleLog, useAuthStore } from '#imports'
import authApiList from 'simpliers-nuxt-utils/authApiList'
import { ErrorMessage, Field, Form } from 'vee-validate'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
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
		email: null,
		errorMessage: null,
		isLoading: false,
	}),
	setup() {
		return {
			auth: useAuthStore(),
		}
	},
	methods: {
		async forgotPassword() {
			if (this.auth.loggedIn) {
				return
			}

			this.isLoading = true
			this.errorMessage = null
			await this.$requestAdapter
				.post(authApiList.auth.forgotPassword, {
					email: this.email,
				})
				.then(() => {
					this.$toast.success(this.$t('components.globalComponents.auth.forgotPasswordForm.successMessage'))
					this.$emit('forgotPasswordSent')
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

<style scoped></style>
