<template>
	<Modal ref="upgradeModal" size="max-w-3xl" :showCloseButton="false" @closed="modalClosed" :closeable="allowClose">
		<div>
			<h2 class="h2 mb-5 text-center">
				<template v-if="feature === featureList.commentSignature">
					{{ $t('components.accounts.upgradeModal.commentSignatureTitle') }}
				</template>
				<template v-else-if="feature === featureList.randomizerStep">
					{{ $t('components.accounts.upgradeModal.features.randomizerStep') }}
				</template>
				<template v-else-if="feature === featureList.dataCollectionStep">
					{{ $t('components.accounts.upgradeModal.features.dataCollectionStep') }}
				</template>
				<template v-else-if="feature === featureList.replyCommentStep">
					{{ $t('components.accounts.upgradeModal.features.replyCommentStep') }}
				</template>
				<template v-else-if="feature === featureList.hideCommentStep">
					{{ $t('components.accounts.upgradeModal.features.hideCommentStep') }}
				</template>
				<template v-else-if="feature === featureList.commentOnLiveStarter">
					{{ $t('components.accounts.upgradeModal.features.commentOnLiveStarter') }}
				</template>
				<template v-else-if="feature === featureList.filterByIntent">
					{{ $t('components.accounts.upgradeModal.features.filterByIntent') }}
				</template>
				<template v-else-if="feature === featureList.filterBySentiment">
					{{ $t('components.accounts.upgradeModal.features.filterBySentiment') }}
				</template>
				<template v-else-if="feature === featureList.commentSentimentRule">
					{{ $t('components.accounts.upgradeModal.features.commentSentimentRule') }}
				</template>
				<template v-else-if="feature === featureList.commentScoreRule">
					{{ $t('components.accounts.upgradeModal.features.commentScoreRule') }}
				</template>
				<template v-else-if="feature === featureList.commentIntentRule">
					{{ $t('components.accounts.upgradeModal.features.commentIntentRule') }}
				</template>
				<template v-else>
					{{ $t('components.accounts.upgradeModal.title') }}
				</template>
			</h2>
			<div class="divider my-3" />
			<div>
				<Packages
					v-if="isModalOpen"
					:key="chatAccount?.id ?? 'generic'"
					:initialContactCount="initialContactCount"
					:lockedActiveContactsCount="chatAccount?.activeContactsCount ?? 0"
					hideFree
					showPricingTiers
					:showCalculator="false"
				>
					<template #tiersTitle>
						<h3 class="h4 font-black text-center">{{ $t('components.accounts.upgradeModal.tiersTitle') }}</h3>
					</template>
				</Packages>
			</div>
		</div>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import Packages from '~/components/Pricing/Packages.vue'
import featureList from '~/types/featureList.ts'

export default {
	components: { Packages, Modal },
	data() {
		return {
			chatAccount: null,
			feature: null,
			allowClose: true,
			isModalOpen: false,
		}
	},
	watch: {
		$route(to, from) {
			if (to.name !== from.name) {
				this.hideModal()
			}
		},
	},
	provide() {
		return {
			chatAccount: computed(() => this.chatAccount),
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		featureList() {
			return featureList
		},
		initialContactCount() {
			const contactsCount = this.chatAccount?.contactsCount ?? 0
			return Math.ceil(contactsCount + (contactsCount * 15) / 100)
		},
	},
	mounted() {
		this.$emitter.on('showUpgradeModal', (event) => {
			this.chatAccount = event.chatAccount
			this.feature = event.feature
			this.allowClose = event.allowClose ?? true

			this.isModalOpen = true

			this.$nextTick(() => {
				this.showModal()
			})
		})
		this.$emitter.on('hideUpgradeModal', () => {
			this.isModalOpen = false
			this.hideModal()
		})
	},
	methods: {
		showModal() {
			this.$refs.upgradeModal?.showModal()
		},
		hideModal() {
			this.$refs.upgradeModal?.hideModal()
		},
		modalClosed() {
			this.chatAccount = null
			this.feature = null
			this.allowClose = true
		},
	},
}
</script>
