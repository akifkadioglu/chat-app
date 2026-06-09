<template>
	<label class="hover:bg-base-200 border border-subtle rounded-xl p-5 flex justify-between items-center">
		<span
			:class="{
				'text-muted': modelValue !== value,
				'font-bold': modelValue === value,
			}"
		>
			<i :class="iconClass"></i>
			<span class="ml-3">
				{{ label }}
			</span>
		</span>
		<input
			type="radio"
			name="profession"
			:checked="modelValue === value"
			@change="$emit('update:modelValue', value)"
			class="radio radio-sm radio-primary"
		/>
	</label>
</template>
<script>
export default {
	props: {
		value: {
			type: String,
		},
		label: {
			type: String,
		},
		iconClass: {
			type: String,
		},
		modelValue: {
			type: String,
			default: '',
		},
	},
	emits: ['update:modelValue'],
}
</script>

<style scoped></style>
