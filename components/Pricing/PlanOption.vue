<template>
	<label
		class="flex flex-1 relative border rounded-lg px-3 py-1 transition duration-100"
		:class="[
			planGroupKey === currentPlanGroupKey ? 'border-primary bg-primary/5' : 'border-subtle hover:border-secondary',
			disabled ? 'opacity-40' : '',
		]"
	>
		<input
			:checked="planGroupKey === currentPlanGroupKey"
			@input="$emit('update:currentPlanGroupKey', planGroupKey), change()"
			class="radio radio-xs radio-primary absolute top-2 right-2"
			type="radio"
			:value="planGroupKey"
		/>
		<span>
			<span class="block text-xs text-muted text-nowrap font-light">{{ $t('components.pricing.planOption.lessThan') }}</span>
			<span class="block text-xl font-semibold text-primary">{{ formattedLimit }}</span>
			<span class="block text-xs text-muted font-light">{{ $t('components.pricing.planOption.contacts') }}</span>
		</span>
	</label>
</template>
<script>
export default {
	props: {
		limit: {
			type: Number,
			required: true,
		},
		currentPlanGroupKey: {
			type: String,
		},
		planGroupKey: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:currentPlanGroupKey'],
	computed: {
		formattedLimit() {
			return this.$formatSocialCount(this.limit, this.$i18n.locale)
		},
	},
	methods: {
		change() {
			this.$nextTick(() => {
				this.$emit('change')
			})
		},
	},
}
</script>

<style scoped></style>
