<template>
	<div>
		<VeeForm class="space-y-2">
			<div
				v-auto-animate
				v-for="(_, i) in config.replyComments"
				:key="i"
				class="border rounded-lg border-muted overflow-hidden"
			>
				<label v-auto-animate>
					<VeeField
						validate-on-input
						rules="required"
						:value="config.replyComments[i]"
						:name="`replyComment-${i}`"
						class="border-0! input w-full"
						:class="{
							'rounded-b-none': config.showSignature,
						}"
						@input="setInput(i, $event)"
						placeholder="Write a reply"
					/>
					<div v-if="config.showSignature" class="flex items-baseline pl-3 pr-1 pb-2 text-sm bg-base-100">
						<div class="flex-1 text-info">
							{{ config.signatureText }}
						</div>

						<div class="flex items-center gap-1 ml-2">
							<SignatureLanguagePicker
								class="shrink-0"
								v-if="config.showSignature"
								@click.stop
								:modelValue="config.signatureLocale"
								@update:modelValue="changeSignatureLanguage"
							/>
							<button
								type="button"
								@click="toggleSignature(false)"
								class="btn btn-ghost btn-xs"
								title="Remove signature"
							>
								<i class="fa fa-times" />
							</button>
						</div>
					</div>
				</label>
				<ErrorMessage :name="`replyComment-${i}`" v-slot="{ message }">
					<span v-if="message" class="text-error text-xs block px-3 pb-1">
						{{ $t('components.flow.quick.components.commentOnPostTrigger.validationMessage') }}
					</span>
				</ErrorMessage>
			</div>
		</VeeForm>
		<button
			v-if="!config.showSignature"
			class="flex items-center gap-2 mt-2 mx-1 text-muted link link-primary hover:underline!"
			@click="toggleSignature(true)"
		>
			<i18n-t
				keypath="components.flow.node.triggers.partials.replyComment.signatureLabel"
				tag="span"
				class="flex items-center gap-1 text-xs select-none"
			>
				<template #simpliersChat> <SimpliersLogo /> <ChatLogo /> </template>
			</i18n-t>
		</button>
	</div>
</template>

<script>
import { ErrorMessage, Field, Form } from 'vee-validate'
import SignatureLanguagePicker from '~/components/Flow/Node/Actions/Components/SignatureLanguagePicker.vue'
import { SIGNATURE_COMMENTS } from '~/models/Flow/utils/signatureMessages.ts'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'
import { customizeLocale } from '~/helpers/availableLanguages.js'
import featureList from '~/types/featureList.ts'

export default {
	components: {
		ChatLogo,
		SimpliersLogo,
		SignatureLanguagePicker,
		VeeField: Field,
		VeeForm: Form,
		ErrorMessage,
	},
	props: {
		config: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			locales: customizeLocale(this.sessionStore.data.country),
		}
	},
	mounted() {
		if (!this.config.signatureText) {
			this.config.signatureText = this.signatureText
		}

		if (!this.config.signatureLocale) {
			this.config.signatureLocale = this.locales.find((loc) => loc.code === this.$i18n.locale).locale
		}

		/*
		if (this.flowStore.flow.chatAccount.subscribed) {
			this.config.showSignature = false
		}*/
		if (!this.config.replyComments?.length) {
			this.config.replyComments = ['', '', '']
		}
	},
	computed: {
		signatureText() {
			const locale = this.config.signatureLocale || this.locales.find((loc) => loc.code === this.$i18n.locale).locale
			consoleLog('this.config.signatureLocale', locale)
			const messages = SIGNATURE_COMMENTS[locale] || SIGNATURE_COMMENTS.en_US
			return messages.text
		},
	},
	methods: {
		toggleSignature(val) {
			if (!val && !this.flowStore.flow.chatAccount?.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.flowStore.flow.chatAccount,
					feature: featureList.commentSignature,
				})
				this.config.showSignature = false
				this.$nextTick(() => {
					this.config.showSignature = true
				})
				return
			}
			this.config.showSignature = val
			this.config.signatureText = this.signatureText
		},
		changeSignatureLanguage(locale) {
			this.config.signatureLocale = locale
			this.$nextTick(() => {
				this.config.signatureText = this.signatureText
			})
		},
		setInput(i, event) {
			this.config.replyComments[i] = event.target.value
		},
	},
}
</script>
