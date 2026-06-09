<template>
	<div>
		<button class="fixed top-2 left-0 z-50 btn btn-xs btn-warning" v-bind="$attrs" @click="$refs.modal.showModal()">
			[DEV] Show Diagram
		</button>
		<Modal ref="modal" :bodyClass="bodyClass" size="max-w-screen" @opened="growModal" @closed="shrinkModal">
			<div class="w-full h-full">
				<Diagram v-if="showDiagram" />
			</div>
		</Modal>
	</div>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import Diagram from '~/components/Flow/Diagram/Diagram.vue'
export default {
	components: { Modal, Diagram },
	data() {
		return {
			bodyClass: '',
			showDiagram: false,
		}
	},
	methods: {
		growModal() {
			this.bodyClass = 'w-full h-dvh'
			this.showDiagram = true
		},
		shrinkModal() {
			this.bodyClass = ''
			this.showDiagram = false
		},
	},
}
</script>
