<template>
	<div class="inline-flex items-center bg-base-100 rounded-lg relative" :class="containerClass">
		<button
			@click="decrease"
			class="btn btn-primary btn-soft btn-square absolute z-2"
			:class="[buttonClass, buttonLeftClass]"
			:disabled="modelValue <= min"
		>
			<i class="fa fa-minus" :class="iconClass" />
		</button>

		<input
			:value="modelValue"
			@input="onInput"
			type="number"
			:min="min"
			:max="max"
			class="input border-none text-center [field-sizing:content] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			:class="inputClass"
			@focus="selectAll"
		/>

		<button
			@click="increase"
			class="btn btn-primary btn-soft btn-square absolute z-2"
			:class="[buttonClass, buttonRightClass]"
			:disabled="modelValue >= max"
		>
			<i class="fa fa-plus" :class="iconClass" />
		</button>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Number,
			required: true,
		},
		min: {
			type: Number,
			default: 1,
		},
		max: {
			type: Number,
			default: 100,
		},
		step: {
			type: Number,
			default: 1,
		},
		size: {
			type: String,
			default: 'sm',
			validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
		},
	},
	emits: ['update:modelValue'],
	watch: {
		modelValue: {
			handler(value) {
				if (value < this.min) {
					this.$emit('update:modelValue', this.min)
				} else if (value > this.max) {
					this.$emit('update:modelValue', this.max)
				}
			},
			immediate: true,
		},
	},
	computed: {
		containerClass() {
			const sizes = {
				xs: 'p-1',
				sm: 'p-1.5',
				md: 'p-2',
				lg: 'p-2.5',
			}
			return sizes[this.size]
		},
		buttonClass() {
			const sizes = {
				xs: 'btn-xs rounded-md',
				sm: 'btn-sm',
				md: 'btn-md',
				lg: 'btn-lg',
			}
			return sizes[this.size]
		},
		buttonLeftClass() {
			const sizes = {
				xs: 'left-1',
				sm: 'left-1.5',
				md: 'left-2',
				lg: 'left-2.5',
			}
			return sizes[this.size]
		},
		buttonRightClass() {
			const sizes = {
				xs: 'right-1',
				sm: 'right-1.5',
				md: 'right-2',
				lg: 'right-2.5',
			}
			return sizes[this.size]
		},
		inputClass() {
			const sizes = {
				xs: 'input-xs px-8 min-w-20 rounded-md',
				sm: 'input-sm px-11 min-w-28',
				md: 'input-md px-14 min-w-36',
				lg: 'input-lg px-16 min-w-44',
			}
			return sizes[this.size]
		},
		iconClass() {
			const sizes = {
				xs: 'text-xs',
				sm: 'text-sm',
				md: 'text-base',
				lg: 'text-lg',
			}
			return sizes[this.size]
		},
	},
	methods: {
		increase() {
			if (this.modelValue < this.max) {
				const newValue = Math.min(this.modelValue + this.step, this.max)
				this.$emit('update:modelValue', newValue)
			}
		},
		decrease() {
			if (this.modelValue > this.min) {
				const newValue = Math.max(this.modelValue - this.step, this.min)
				this.$emit('update:modelValue', newValue)
			}
		},
		onInput(event) {
			const value = Number(event.target.value)
			if (!isNaN(value)) {
				this.$emit('update:modelValue', value)
			}
		},
		selectAll(event) {
			event.target.select()
		},
	},
}
</script>
