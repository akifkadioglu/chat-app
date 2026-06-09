<template>
	<div tabindex="-1" class="px-3 py-4">
		<label>
			<span class="flex cursor-pointer">
				<span class="grow">
					<span class="flex items-start justify-between gap-3">
						<span class="flex items-center gap-3 min-w-0 flex-1">
							<slot name="icon">
								<i :class="iconClass"></i>
							</slot>
							<slot name="title">
								{{ title }}
							</slot>
						</span>
						<!-- switch -->
						<ToggleSwitch v-model="internalValue" />
					</span>
					<p class="text-xs text-base-content/70 mt-2">
						<slot name="description">{{ description }}</slot>
					</p>
				</span>
			</span>
		</label>

		<slot />
	</div>
</template>
<script>
import { useId } from 'vue'
import ToggleSwitch from '~/components/Flow/Node/Triggers/Partials/ToggleSwitch.vue'

export default {
	name: 'Switch',
	components: { ToggleSwitch },
	props: {
		id: {
			type: String,
			default() {
				return useId()
			},
		},
		title: String,
		description: String,
		iconClass: String,
		modelValue: {
			default: false,
		},
	},
	emits: ['update:modelValue'],
	computed: {
		internalValue: {
			get() {
				return this.modelValue
			},
			set(val) {
				this.$emit('update:modelValue', val)
			},
		},
	},
}
</script>
