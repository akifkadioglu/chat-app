<template>
	<Modal ref="modal" :closeable="false" :showCloseButton="false">
		<div v-if="!threeDSecureContent" class="text-center">
			<loading-element />
		</div>
		<iframe v-else class="w-full h-[700px]" :src="'data:text/html;charset=utf-8;base64,' + threeDSecureContent" />
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement, Modal },
	data() {
		return {
			threeDSecureContent: null,
		}
	},
	emits: ['paymentSuccess', 'errorMessage'],
	methods: {
		showModal(content) {
			this.threeDSecureContent = content
			window.addEventListener('message', this.handleThreeDSecureMessage, false)
			this.$refs.modal.showModal()
		},
		hideModal() {
			window.removeEventListener('message', this.handleThreeDSecureMessage)
			this.$refs.modal.hideModal()
		},
		handleThreeDSecureMessage(event) {
			consoleLog('ThreeDSecureModal event', event)
			const iFrameData = event.data.data
			consoleLog('iFrameData', iFrameData)
			if (iFrameData.status) {
				this.$emit('paymentSuccess', iFrameData.data)
				this.hideModal()
				return
			}
			if (iFrameData.data && iFrameData.data.message) {
				this.$emit('errorMessage', iFrameData.data.message)
				this.hideModal()
				return
			}
		},
	},
}
</script>

<style scoped></style>
