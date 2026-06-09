<template>
	<Modal ref="modal" :closeable="true" :show-close-button="false" size="max-w-md">
		<div class="text-center">
			<div class="mb-4">
				<i class="fa-solid fa-circle-exclamation text-warning text-6xl"></i>
			</div>
			<h3 class="text-lg font-bold mb-3">
				{{ $t('components.globalComponents.instagramBrowserWarning.title') }}
			</h3>
			<p class="text-sm opacity-70 mb-6 text-left">
				{{ $t('components.globalComponents.instagramBrowserWarning.message') }}
			</p>
			<!--			<button-->
			<!--				v-if="isIOS"-->
			<!--				@click="openInSafari"-->
			<!--				class="btn btn-primary w-full btn-transition mb-2"-->
			<!--			>-->
			<!--				<i class="fa-brands fa-safari mr-2"></i>-->
			<!--				{{ $t('components.globalComponents.instagramBrowserWarning.openInSafariButton') }}-->
			<!--			</button>-->
			<button @click="closeModal" class="btn w-full btn-transition" :class="isIOS ? 'btn-ghost' : 'btn-primary'">
				{{ $t('components.globalComponents.instagramBrowserWarning.okButton') }}
			</button>
		</div>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'

export default {
	components: {
		Modal,
	},
	data() {
		return {
			isIOS: false,
		}
	},
	mounted() {
		// this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
		this.$refs.modal?.showModal()
	},
	methods: {
		closeModal() {
			this.$refs.modal?.hideModal()
		},
		// openInSafari() {
		// 	const url = window.location.href.replace(/^https?:\/\//, '')
		// 	window.location.href = `x-safari-https://${url}`
		// },
	},
}
</script>
