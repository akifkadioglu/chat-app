<template>
	<modal ref="modal" :show-close-button="false" :show-x-button="closeable" :closeable="closeable">
		<i
			@click="goBackOrFlows"
			class="absolute top-6 size-10 fa fa-chevron-left text-2xl text-muted cursor-pointer hover:-translate-x-2 transition-all duration-300"
			v-if="!closeable"
		/>

		<div>
			<!-- Sol Taraf - İllüstrasyon -->
			<div class="flex-1 bg-error-content rounded-box flex flex-col items-center justify-center p-4 mt-2">
				<!-- Instagram İkonu -->
				<div class="relative mb-8">
					<i class="fa fa-circle-exclamation text-6xl text-error mb-5" />
				</div>

				<div class="text-3xl mb-4">{{ $t('components.baseComponents.refreshPermissionModal.title') }}</div>
				<p class="max-w-xs">
					{{ $t('components.baseComponents.refreshPermissionModal.description') }}
				</p>
			</div>

			<!-- Sağ Taraf - Form -->
			<div class="flex-1 pt-4 flex flex-col justify-center">
				<div class="max-w-sm">
					<p class="text-sm mb-8 leading-relaxed">
						{{ $t('components.baseComponents.refreshPermissionModal.instructions') }}
					</p>
				</div>
				<!-- Instagram Butonu -->
				<RefreshPermissionButton
					v-if="isModalOpen"
					:title="$t('components.baseComponents.refreshPermissionModal.button')"
					titleClass="text-md"
					class="btn-transition bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<template #icon>
						<i class="fa-brands fa-instagram" />
					</template>
				</RefreshPermissionButton>
			</div>
		</div>
	</modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import AccountPermissionModalBuilder from '~/components/BaseComponents/AccountPermissionModalBuilder.vue'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'

export default {
	components: {
		RefreshPermissionButton,
		AccountPermissionModalBuilder,
		SimpliersLogo,
		Modal,
	},
	data() {
		return {
			closeable: false,
			isModalOpen: false,
		}
	},
	mounted() {
		this.$emitter.on('showRefreshPermissionModal', (attrs) => {
			this.closeable = attrs?.closeable ?? true
			this.isModalOpen = true
			this.$refs.modal?.showModal()
		})
		this.$emitter.on('hideRefreshPermissionModal', () => {
			this.isModalOpen = false
			this.$refs.modal?.hideModal()
		})
	},
	methods: {
		goBackOrFlows() {
			this.$refs.modal?.hideModal()
			if (window.history.length > 1) {
				return this.$router.back()
			}
			this.$router.push(this.localeRoute('flows'))
		},
	},
}
</script>
