<template>
	<Modal ref="modal">
		<AgreementContent class="p-5" />
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import AgreementContent from '~/components/SubscriptionAgreement/AgreementContent.vue'

export default {
	name: 'TermsOfPayment',
	components: { AgreementContent, Modal },
	methods: {
		showModal() {
			this.$refs.modal.showModal()
		},
		hideModal() {
			this.$refs.modal.hideModal()
		},
	},
}
</script>

<style scoped></style>
