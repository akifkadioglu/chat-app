<template>
	<Modal ref="modal" :closeable="closeable" :show-close-button="showCloseButton">
		<div class="flex flex-col gap-5 p-5 pb-0 max-w-2xl">
			<!-- Başlık -->
			<h2 class="text-xl text-base-content">
				{{ $t('components.flow.quick.components.openingDMRequiredModal.title') }}
			</h2>

			<!-- Açıklama Paragrafları -->
			<div class="space-y-2 text-muted">
				<p>
					{{ $t('components.flow.quick.components.openingDMRequiredModal.description') }}
				</p>
			</div>

			<!-- Alt Başlık -->
			<h3>
				{{ $t('components.flow.quick.components.openingDMRequiredModal.subtitle') }}
			</h3>

			<!-- Özellikler Listesi -->
			<div class="space-y-4 bg-base-200 rounded-lg p-6">
				<div class="flex items-start gap-4">
					<div class="my-auto">
						<i class="fa-regular fa-bell text-2xl" />
					</div>
					<div>
						<div class="font-semibold">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.followUp.title') }}
						</div>
						<span class="text-muted text-sm">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.followUp.description') }}
						</span>
					</div>
				</div>

				<!-- Grow your followers -->
				<div class="flex items-start gap-4">
					<div class="my-auto">
						<i class="fa-solid fa-user-plus text-2xl"></i>
					</div>
					<div>
						<div class="font-semibold">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.growFollowers.title') }}
						</div>
						<span class="text-muted text-sm">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.growFollowers.description') }}
						</span>
					</div>
				</div>

				<!-- Collect emails -->
				<div class="flex items-start gap-4">
					<div class="my-auto">
						<i class="fa-regular fa-envelope text-2xl" />
					</div>
					<div>
						<div class="font-semibold">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.collectEmails.title') }}
						</div>
						<span class="text-muted text-sm">
							{{ $t('components.flow.quick.components.openingDMRequiredModal.features.collectEmails.description') }}
						</span>
					</div>
				</div>
			</div>
			<div v-if="showButtons" class="flex justify-between">
				<button class="btn btn-primary btn-transition" @click="handleAddOpeningDM">
					<template v-if="hasOpeningDM">
						{{ $t('components.flow.quick.components.openingDMRequiredModal.addButton') }}
					</template>
					<template v-else>
						{{ $t('components.flow.quick.components.openingDMRequiredModal.enableButton') }}
					</template>
				</button>
				<button class="btn btn-soft btn-error btn-transition" @click="handleCloseOpeningDM">
					<template v-if="hasOpeningDM">
						{{ $t('components.flow.quick.components.openingDMRequiredModal.closeButton') }}
					</template>
					<template v-else>
						{{ $t('components.flow.quick.components.openingDMRequiredModal.skipButton') }}
					</template>
				</button>
			</div>
		</div>
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'

export default {
	components: { Modal },
	emits: ['addOpeningDM'],
	props: {
		hasOpeningDM: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			showButtons: true,
			closeable: true,
			showCloseButton: true,
		}
	},
	methods: {
		handleAddOpeningDM() {
			this.$emit('addOpeningDM')
			this.hideModal()
		},
		handleCloseOpeningDM() {
			this.$emit('closeOpeningDM')
			this.hideModal()
		},
		showModal(showButtons = true) {
			this.showButtons = showButtons
			this.closeable = !showButtons
			this.showCloseButton = !showButtons
			this.$refs.modal.showModal()
		},
		hideModal() {
			this.$refs.modal.hideModal()
		},
	},
}
</script>

<style scoped></style>
