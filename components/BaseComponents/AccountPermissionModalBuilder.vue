<template>
	<modal ref="modal" :show-close-button="false" :show-x-button="closeable" :closeable="closeable">
		<i
			@click="goBackOrFlows"
			class="absolute top-6 size-10 fa fa-chevron-left text-2xl text-muted cursor-pointer hover:-translate-x-2 transition-all duration-300"
			v-if="!closeable"
		/>
		<div>
			<!-- Sol Taraf - İllüstrasyon -->
			<div :class="[topBgClass]" class="flex-1 rounded-box flex flex-col items-center justify-center p-4 mt-2">
				<!-- Instagram İkonu -->
				<slot name="header">
					<div class="relative mb-8" v-if="showHeader">
						<img src="/images/ui/logos/instagram.png" alt="" class="w-16 h-16" />
						<!-- Dekoratif Elementler -->
						<div class="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full"></div>
						<div class="absolute -bottom-1 -left-2 w-4 h-4 bg-purple-400 rounded-full"></div>
					</div>
				</slot>
				<slot>
					<slot name="title">
						<h1 class="text-3xl mb-4">{{ title || $t('components.baseComponents.addAccountModal.title') }}</h1>
					</slot>
					<p class="max-w-xs">
						<slot name="description">
							<span v-if="description">{{ description }}</span>
							<i18n-t
								v-else
								:keypath="descriptionPath || 'components.baseComponents.addAccountModal.description'"
								tag="span"
							>
								<template #brand>
									<span><simpliers-logo /></span>
								</template>
							</i18n-t>
						</slot>
					</p>
				</slot>
			</div>

			<div class="flex-1 pt-4 flex flex-col justify-center">
				<div class="max-w-sm">
					<slot name="subtitle">
						<h3 class="text-lg mb-2">{{ subtitle || $t('components.baseComponents.addAccountModal.subtitle') }}</h3>
					</slot>
					<slot name="instructions">
						<p class="text-sm mb-8 leading-relaxed">
							{{ instructions || $t('components.baseComponents.addAccountModal.instructions') }}
						</p>
					</slot>
				</div>
				<!-- Instagram Butonu -->
				<slot name="button" />
			</div>
		</div>
	</modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'

export default {
	components: {
		SimpliersLogo,
		Modal,
	},
	props: {
		closeable: {
			type: Boolean,
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		descriptionPath: {
			type: String,
		},
		subtitle: {
			type: String,
		},
		instructions: {
			type: String,
		},
		showHeader: {
			type: Boolean,
			default: true,
		},
		topBgClass: {
			type: String,
			default: 'bg-instagram/10',
		},
	},
	setup() {
		return {
			localeRoute: useLocaleRoute(),
		}
	},
	methods: {
		showModal() {
			this.$refs.modal.showModal()
		},
		hideModal() {
			this.$refs.modal.hideModal()
		},
		goBackOrFlows() {
			this.hideModal()
			if (window.history.length > 1) {
				return this.$router.back()
			}
			this.$router.push(this.localeRoute('flows'))
		},
	},
}
</script>
