<template>
	<Modal ref="modal" size="max-w-xl" bodyClass="p-2 md:p-4">
		<article class="flex flex-col gap-8">
			<header class="flex flex-col gap-4">
				<h2 class="text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-0">
					{{ $t('components.pricing.activeContactsInfoModal.title') }}
				</h2>
			</header>

			<section class="flex flex-col gap-5">
				<i18n-t
					keypath="components.pricing.activeContactsInfoModal.intro"
					tag="p"
					class="text-lg leading-relaxed text-base-content/90"
				>
					<template #highlight>
						<span class="bg-primary/10 text-primary font-semibold px-1.5 rounded">
							{{ $t('components.pricing.activeContactsInfoModal.highlight') }}
						</span>
					</template>
				</i18n-t>

				<aside
					class="relative pl-5 py-3 pr-4 border-l-2 border-primary bg-primary/5 rounded-r-md text-base-content/80 italic"
				>
					{{ $t('components.pricing.activeContactsInfoModal.countedOnce') }}
				</aside>
			</section>

			<div class="divider" />

			<section class="flex flex-col gap-3">
				<h3 class="text-2xl font-bold leading-tight mb-0">
					{{ $t('components.pricing.activeContactsInfoModal.overageTitle') }}
				</h3>
				<p class="text-base-content/85 leading-relaxed">
					{{ $t('components.pricing.activeContactsInfoModal.overageDescription') }}
				</p>
				<p class="text-base-content/85 leading-relaxed">
					{{ $t('components.pricing.activeContactsInfoModal.overageBilling') }}
				</p>
				<aside
					class="relative pl-5 py-3 pr-4 border-l-2 border-primary bg-primary/5 rounded-r-md text-base-content/85 leading-relaxed flex flex-col gap-2"
				>
					<p class="font-semibold text-base-content m-0 flex items-center gap-2">
						<i class="fa fa-shield-halved text-primary" />
						{{ $t('components.pricing.activeContactsInfoModal.overageCapTitle') }}
					</p>
					<p class="m-0">
						{{ $t('components.pricing.activeContactsInfoModal.overageCapDescription') }}
					</p>
					<p class="m-0">
						{{ $t('components.pricing.activeContactsInfoModal.overageCapDescriptionSecondary') }}
					</p>
				</aside>
				<p class="text-base-content/85 leading-relaxed">
					{{ $t('components.pricing.activeContactsInfoModal.overageUpgrade') }}
				</p>
			</section>
		</article>
	</Modal>
</template>

<script>
import Modal from '~/components/GlobalComponents/Modal.vue'

export default {
	components: { Modal },
	mounted() {
		this.$emitter.on('showActiveContactsInfoModal', this.showModal)
	},
	beforeUnmount() {
		this.$emitter.off('showActiveContactsInfoModal', this.showModal)
	},
	methods: {
		showModal() {
			this.$refs.modal?.showModal()
		},
	},
}
</script>
