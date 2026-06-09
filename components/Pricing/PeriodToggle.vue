<template>
	<div class="bg-muted p-1 rounded-full flex gap-1 w-full max-w-xs sm:w-48 mx-auto">
		<button
			v-for="opt in options"
			:key="opt"
			class="rounded-full w-full transition duration-200 relative text-sm py-2 px-3 sm:text-xs sm:py-1 sm:px-1"
			:class="selected === opt ? 'bg-base-100 shadow-lg' : 'hover:text-primary'"
			@click="select(opt)"
		>
			{{ $t(`components.pricing.stackedPlan.${opt}`) }}
			<span
				v-if="opt === PERIODS.yearly && savingsPercent"
				class="absolute -top-1 right-1 -translate-y-1/2 sm:right-0 sm:translate-x-1/2"
			>
				<i18n-t
					keypath="components.pricing.stackedPlan.saveShort"
					tag="span"
					class="badge badge-soft badge-sm badge-success"
				>
					<template #percent>
						<span class="font-semibold">
							{{ $t('components.pricing.stackedPlan.percentage', { number: savingsPercent }) }}
						</span>
					</template>
				</i18n-t>
			</span>
		</button>
	</div>
</template>

<script>
import { PERIODS } from '~/models/Pricing/Plan.ts'

export default {
	props: {
		initialValue: {
			type: String,
			default: PERIODS.monthly,
		},
		savingsPercent: {
			type: Number,
			default: null,
		},
	},
	emits: ['change'],
	data() {
		return {
			PERIODS,
			options: [PERIODS.monthly, PERIODS.yearly],
			selected: this.initialValue,
		}
	},
	mounted() {
		this.$emitter.on('periodToggleChange', this.syncPeriod)
	},
	beforeUnmount() {
		this.$emitter.off('periodToggleChange', this.syncPeriod)
	},
	methods: {
		select(opt) {
			if (this.selected === opt) return
			this.selected = opt
			this.$emit('change', opt)
		},
		syncPeriod(period) {
			this.selected = period
		},
	},
}
</script>
