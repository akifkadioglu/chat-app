<template>
	<Modal ref="modal" size="max-w-3xl" :default-footer="false" :showCloseButton="false" @closed="handleModalClosed">
		<transition
			name="slide"
			enter-active-class="animate__animated animate__fadeIn animate__faster"
			leave-active-class="animate__animated animate__fadeOut animate__faster"
			mode="out-in"
		>
			<Survey v-if="modalStage === 'survey'" @cancelSurveySubmit="submitSurvey" @closeModal="hideModal" />
			<Features
				v-else-if="modalStage === 'features'"
				:reasons="userReasons"
				:comment="userComment"
				@subscriptionCanceled="subscriptionCanceled"
				@closeModal="hideModal"
			/>
		</transition>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import Features from '~/components/Accounts/BillingTab/CancelSubscriptionModal/Features.vue'
import Survey from '~/components/Accounts/BillingTab/CancelSubscriptionModal/Survey.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts'

export default {
	components: { Survey, Features, Modal },
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	emits: ['subscriptionCanceled'],
	data() {
		return {
			modalStage: 'survey',
			userReasons: [],
			userComment: '',
		}
	},
	mounted() {
		this.$emitter.on('showCancelSubscriptionModal', this.openModal)
		this.$emitter.on('hideCancelSubscriptionModal', this.hideModal)
	},
	beforeUnmount() {
		this.$emitter.off('showCancelSubscriptionModal', this.openModal)
		this.$emitter.off('hideCancelSubscriptionModal', this.hideModal)
	},
	methods: {
		openModal() {
			this.modalStage = 'survey'
			this.userReasons = []
			this.userComment = ''
			this.$nextTick(() => this.$refs.modal?.showModal())
		},
		hideModal() {
			this.$refs.modal?.hideModal()
			this.modalStage = 'survey'
		},
		submitSurvey(reasons, comment) {
			this.userReasons = reasons
			this.userComment = comment
			this.modalStage = 'features'
		},
		subscriptionCanceled(subscription) {
			this.hideModal()
			this.$emit('subscriptionCanceled', subscription)
		},
		handleModalClosed() {
			this.modalStage = 'survey'
		},
	},
}
</script>
