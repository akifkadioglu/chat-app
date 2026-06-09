<template>
	<div class="relative rounded-xl p-4 overflow-hidden cursor-pointer min-h-[120px]" @click="$emit('enable')">
		<div class="relative z-1 flex items-start justify-between gap-3">
			<div class="flex-1 min-w-0">
				<span v-if="active" class="badge badge-success badge-soft rounded-md! mb-2">
					<i class="fa fa-check-circle text-[10px]" />
					{{ $t('components.accounts.overviewTab.featureToggles.enabled') }}
				</span>
				<div class="text-xl font-semibold">{{ label }}</div>
				<p v-if="description" class="text-xs mt-2 leading-relaxed max-w-[85%]">{{ description }}</p>
			</div>

			<button v-if="active" class="link text-sm shrink-0" @click.stop="$emit('manage')">
				{{ $t('components.accounts.overviewTab.featureToggles.goToFlow') }}
				<i class="fa fa-chevron-right text-xs link-icon" />
			</button>

			<button v-else class="shrink-0" :class="activeButtonClass" :disabled="loading" @click.stop="$emit('enable')">
				<LoadingElement class="flex items-center gap-1 shrink-0 w-fit" :isLoading="loading" size="20">
					{{ $t('components.accounts.overviewTab.featureToggles.enable') }}
					<i class="fa fa-chevron-right text-xs link-icon" />
				</LoadingElement>
			</button>
		</div>
		<div class="absolute -bottom-1 -right-1 size-24 opacity-15 rotate-12 pointer-events-none" aria-hidden="true">
			<slot name="icon" />
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		label: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		active: {
			type: Boolean,
			default: false,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		activeButtonClass: {
			type: String,
			default: '',
		},
	},
	emits: ['enable', 'manage'],
}
</script>
