<template>
	<div class="flex justify-between items-center">
		<label :for="id" class="flex flex-col flex-1">
			<slot>
				<span>{{ title }}</span>
			</slot>
			<slot name="description">
				<span class="text-sm text-muted">{{ description }}</span>
			</slot>
		</label>
		<slot name="action" :id="id">
			<input
				:id="id"
				type="checkbox"
				@change="$emit('update:modelValue', $event.target.checked)"
				:checked="modelValue"
				class="toggle toggle-primary ml-4"
			/>
		</slot>
	</div>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		modelValue: {
			type: Boolean,
		},
	},
	watch: {
		modelValue(value) {
			this.$emit('update:modelValue', value)
		},
	},
	data() {
		return {
			id: useId(),
		}
	},
}
</script>

<style scoped></style>
