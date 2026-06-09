<template>
	<Modal ref="modal" size="max-w-3xl" bodyClass="p-6">
		<div class="flex flex-col gap-4">
			<h3 class="text-2xl font-semibold">
				{{ $t('components.chat.dmAccessDisabledModal.title') }}
			</h3>
			<p class="text-muted">
				{{ $t('components.chat.dmAccessDisabledModal.description') }}
			</p>
			<img :src="imageSrc" :alt="$t('components.chat.dmAccessDisabledModal.title')" class="w-full rounded-lg" />
		</div>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'

export default {
	components: { Modal },
	setup() {
		return {
			i18n: useI18n(),
		}
	},
	computed: {
		imageSrc() {
			const locale = this.i18n.locale.value === 'tr' ? 'tr' : 'en'
			return `/images/ui/dm-access-disable-${locale}.jpeg`
		},
	},
	mounted() {
		this.$emitter.on('showDmAccessDisabledModal', this.open)
	},
	beforeUnmount() {
		this.$emitter.off('showDmAccessDisabledModal', this.open)
	},
	methods: {
		open() {
			this.$refs.modal.showModal()
		},
	},
}
</script>

<style scoped></style>
