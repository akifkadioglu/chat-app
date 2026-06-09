<template>
	<modal ref="modal" :show-close-button="false" :show-x-button="closeable" :closeable="closeable">
		<div>
			<!-- Sol Taraf - İllüstrasyon -->
			<div class="flex-1 bg-instagram/10 rounded-box flex flex-col items-center justify-center p-4 mt-2">
				<!-- Instagram İkonu -->
				<div class="relative mb-8">
					<img src="/images/ui/logos/instagram.png" alt="instagram logo" class="w-16 h-16" />
					<!-- Dekoratif Elementler -->
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full"></div>
					<div class="absolute -bottom-1 -left-2 w-4 h-4 bg-purple-400 rounded-full"></div>
				</div>

				<h2 class="text-3xl mb-4">{{ $t('components.baseComponents.addAccountModal.title') }}</h2>
				<p class="max-w-xs">
					<i18n-t keypath="components.baseComponents.addAccountModal.description" tag="span">
						<template #brand>
							<span><simpliers-logo /></span>
						</template>
					</i18n-t>
				</p>
			</div>

			<!-- Sağ Taraf - Form -->
			<div class="flex-1 pt-4 flex flex-col justify-center space-y-4">
				<div class="max-w-sm">
					<h3 class="text-lg mb-2">{{ $t('components.baseComponents.addAccountModal.subtitle') }}</h3>
					<p class="text-sm leading-relaxed">
						{{ $t('components.baseComponents.addAccountModal.instructions') }}
					</p>
				</div>

				<div v-if="isModalOpen" class="my-8 flex-1 flex flex-col gap-2">
					<!-- Instagram Butonu -->
					<RefreshPermissionButton
						purpose="login"
						:loading="loading"
						:disabled="loading"
						:title="$t('components.baseComponents.addAccountModal.connectWithInstagram')"
						titleClass=""
						class="btn-transition bg-blue-500 hover:bg-blue-600 text-white font-medium text-md py-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<template #icon>
							<i class="fa-brands fa-instagram" />
						</template>
					</RefreshPermissionButton>
					<!--					v-if="authStore.user?.id === 2516852"-->
					<RefreshPermissionButton
						purpose="login"
						:loading="loading"
						:disabled="loading"
						:title="$t('components.baseComponents.addAccountModal.connectWithMetaButton')"
						titleClass=""
						class="btn-transition bg-transparent hover:bg-blue-600 border border-blue-500 hover:text-base-100 text-blue-500 font-medium text-md py-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						:platform="PLATFORMS.FACEBOOK"
					>
						<template #icon>
							<i class="fa-brands fa-meta" />
						</template>
					</RefreshPermissionButton>
				</div>

				<MetaProviderNotice />
			</div>
		</div>
	</modal>
</template>

<script>
import AccountPermissionModalBuilder from '~/components/BaseComponents/AccountPermissionModalBuilder.vue'

import Modal from '~/components/GlobalComponents/Modal.vue'
import apiList from '~/apis/ApiList.js'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'
import { PLATFORMS } from '~/models/Social.ts'
import ApprovedByMeta from '~/components/Landing/Components/ApprovedByMeta.vue'
import MetaProviderNotice from '~/components/GlobalComponents/MetaProviderNotice.vue'

export default {
	computed: {
		PLATFORMS() {
			return PLATFORMS
		},
	},
	components: {
		MetaProviderNotice,
		ApprovedByMeta,
		AccountPermissionModalBuilder,
		RefreshPermissionButton,
		SimpliersLogo,
		Modal,
	},
	setup() {
		return {
			authStore: useAuthStore(),
		}
	},
	data() {
		return {
			instagramAuthUrl: '',
			closeable: false,
			loading: true,
			isModalOpen: false,
		}
	},
	mounted() {
		this.$emitter.on('showAddAccountModal', this.onShow)
		this.$emitter.on('hideAddAccountModal', this.onHide)
		this.$emitter.on('setLoadingAddAccountModal', this.onSetLoading)
	},
	beforeUnmount() {
		this.$emitter.off('showAddAccountModal', this.onShow)
		this.$emitter.off('hideAddAccountModal', this.onHide)
		this.$emitter.off('setLoadingAddAccountModal', this.onSetLoading)
	},
	methods: {
		onShow(attrs) {
			this.closeable = attrs?.closeable ?? true
			this.loading = false
			this.isModalOpen = true
			this.$refs.modal?.showModal()
		},
		onHide() {
			this.loading = false
			this.isModalOpen = false
			this.$refs.modal?.hideModal()
		},
		onSetLoading(e) {
			console.log('setLoadingAddAccountModal', e)
			if (e?.status) {
				this.loading = true
				this.closeable = false
			}

			if (e?.status === false) {
				this.loading = false
				this.closeable = true

				if (e.data?.message) {
					this.$toast.error(e.data.message)
				}
			}
		},
	},
}
</script>

<style scoped></style>
