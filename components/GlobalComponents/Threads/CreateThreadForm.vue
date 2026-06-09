<template>
	<VeeForm class="flex flex-col space-y-7" ref="form" v-slot="{ handleSubmit }" @submit="sendMessage">
		<div>
			<div>
				<label class="label mb-2" for="name">
					{{ $t('components.globalComponents.threads.createThreadForm.nameLabel') }}
				</label>
			</div>
			<VeeField
				id="name"
				v-model="name"
				:rules="{ required: true, twoWord: !auth.loggedIn }"
				vid="name"
				class="input w-full"
				:name="$t('components.globalComponents.threads.createThreadForm.nameLabel')"
				:validateOnInput="false"
				:validateOnChange="false"
				:validateOnBlur="false"
				:validate-on-mount="false"
				@input="name = $capitalize($event.target.value, $i18n.locale)"
				:readonly="auth.loggedIn && auth.user.name"
				:placeholder="$t('components.globalComponents.threads.createThreadForm.namePlaceHolder')"
				autocomplete="name"
				autofocus
			/>
			<ErrorMessage
				:name="$t('components.globalComponents.threads.createThreadForm.nameLabel')"
				class="text-error text-xs mt-1"
			/>
		</div>

		<div>
			<div>
				<label class="label mb-2" for="email">
					{{ $t('components.globalComponents.threads.createThreadForm.emailLabel') }}
				</label>
			</div>
			<VeeField
				id="email"
				v-slot="v"
				v-model="email"
				:readonly="auth.loggedIn && auth.user.email"
				rules="required|email"
				vid="email"
				class="input w-full"
				:name="$t('components.globalComponents.threads.createThreadForm.emailLabel')"
				:validateOnInput="false"
				:validateOnChange="false"
				:validateOnBlur="false"
				:validate-on-mount="false"
				placeholder="email@site.com"
				autocomplete="email"
				autofocus
			/>
			<ErrorMessage
				:name="$t('components.globalComponents.threads.createThreadForm.emailLabel')"
				class="text-error text-xs mt-1"
			/>
		</div>

		<div>
			<div>
				<label class="label mb-2" for="phone">
					{{ $t('components.globalComponents.threads.createThreadForm.phoneLabel') }}
				</label>
			</div>
			<VeeField
				v-slot="v"
				v-model="phone"
				rules="phone"
				vid="phone"
				:name="$t('components.globalComponents.threads.createThreadForm.phoneLabel')"
				:validateOnInput="false"
				:validateOnChange="false"
				:validateOnBlur="false"
				:validate-on-mount="false"
			>
				<div class="mb-4">
					<phone-mask
						id="phone"
						v-model="phone"
						:readonly="auth.loggedIn && auth.user.phone && !v.meta.validated && v.meta.valid"
						:class="{
							'input-error': !v.meta.valid && v.meta.validated,
							'input-success': v.meta.valid && v.meta.validated,
						}"
						class="input w-full"
						type="tel"
						autocomplete="phone"
						autofocus
					/>
				</div>
			</VeeField>
			<ErrorMessage
				:name="$t('components.globalComponents.threads.createThreadForm.phoneLabel')"
				class="text-error text-xs"
			/>
		</div>

		<div>
			<div>
				<label class="label mb-2" for="text">
					{{ $t('components.globalComponents.threads.createThreadForm.textLabel') }}
				</label>
			</div>
			<VeeField
				v-slot="v"
				v-model="text"
				rules="required|min:5"
				vid="text"
				:name="$t('components.globalComponents.threads.createThreadForm.textLabel')"
				:validateOnInput="false"
				:validateOnChange="false"
				:validateOnBlur="false"
				:validate-on-mount="false"
			>
				<TextareaAutosize
					id="text"
					v-model="text"
					:class="{
						'input-error': !v.meta.valid && v.meta.validated,
						'input-success': v.meta.valid && v.meta.validated,
					}"
					class="textarea w-full"
					placeholder=""
					type="text"
					autocomplete="text"
					autofocus
				/>
			</VeeField>

			<ErrorMessage
				:name="$t('components.globalComponents.threads.createThreadForm.textLabel')"
				class="text-error text-xs"
			/>
		</div>

		<div class="grid mb-3">
			<button
				type="submit"
				class="btn btn-primary btn-block btn-transition"
				:disabled="isLoading"
				@click.prevent="handleSubmit(sendMessage)"
			>
				<loading-element :is-loading="isLoading">
					{{ $t('components.globalComponents.threads.createThreadForm.sendButton') }}
				</loading-element>
			</button>
		</div>
	</VeeForm>
</template>

<script>
import apiList from '@/apis/ApiList'
import PhoneMask from '@/components/GlobalComponents/Elements/PhoneMask'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import TextareaAutosize from '~/components/GlobalComponents/Elements/TextareaAutosize.vue'
import { ErrorMessage, Field, Form } from 'vee-validate'
import { consoleLog } from '#imports'
// import { useAuthStore } from '~/stores/auth.js'

export default {
	components: {
		ErrorMessage,
		TextareaAutosize,
		LoadingElement,
		PhoneMask,
		VeeForm: Form,
		VeeField: Field,
		VeeErrorMessage: ErrorMessage,
	},
	setup() {
		return {
			auth: useAuthStore(),
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			name: this.auth.user?.name ?? '',
			email: this.auth.user?.email ?? '',
			phone: this.auth.user?.phone ?? '',
			text: '',
			isLoading: false,
			errorMessage: '',
		}
	},
	watch: {
		'auth.loggedIn'() {
			if (this.auth.loggedIn) {
				this.name = this.auth.user?.name
				this.email = this.auth.user?.email
				this.phone = this.auth.user?.phone
			}
		},
	},
	methods: {
		async sendMessage() {
			consoleLog('sendMessage')
			if (this.text === '') {
				this.errorMessage = this.$t('components.globalComponents.threads.createThreadForm.methods.textIsEmpty')
				return
			}
			this.errorMessage = ''

			this.isLoading = true
			this.errorMessage = ''
			const data = {
				name: this.name,
				email: this.email,
				phone: this.phone,
				text: this.text,
			}
			//
			let message = ''
			await this.$requestAdapter
				.post(apiList.thread.create, data)
				.then(() => {
					this.text = ''
					message = this.$t('components.globalComponents.threads.createThreadForm.methods.sentSuccessfully')
					this.$toast.success(message)
				})
				.catch((error) => {
					this.isLoading = false
					message = error.response.data.message
					this.errorMessage = message
				})
			this.isLoading = false
			this.$emit('sent', message)
		},
	},
}
</script>

<style scoped></style>
