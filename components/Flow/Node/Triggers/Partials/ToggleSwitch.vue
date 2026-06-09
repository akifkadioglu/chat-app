<template>
	<label class="relative inline-block w-11 h-6 flex-shrink-0 cursor-pointer self-baseline">
		<slot name="label" />
		<slot />
		<span class="">
			<input
				type="checkbox"
				class="peer sr-only"
				:checked="modelValue"
				@change="$emit('update:modelValue', $event.target.checked)"
			/>
			<span
				class="absolute inset-0 bg-muted rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-primary dark:bg-neutral-700"
			/>
			<span
				class="absolute top-1/2 start-0.5 -translate-y-1/2 size-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white"
			/>
		</span>
	</label>
</template>

<script>
export default {
	name: 'ToggleSwitch',
	props: {
		modelValue: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
}
</script>
