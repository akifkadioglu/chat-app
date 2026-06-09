<template>
	<div
		class="pl-3 pr-8 py-2 rounded-lg relative overflow-visible flex items-center gap-2 w-full border h-10 shrink-0"
		:style="style"
	>
		<i :class="icon" class="text-xs" />
		<div class="truncate">
			<span v-if="label">{{ label }}</span>
			<span v-else>&nbsp;</span>
		</div>
		<i v-if="websiteLink" class="fa fa-chain fa-lg ml-auto -mr-6 opacity-50" />
		<Handle
			v-else
			:position="position"
			type="source"
			connectable="single"
			:id="handleId"
			class="node-handle top-1/2 mr-4"
		/>
	</div>
</template>

<script>
import { Handle } from '@vue-flow/core'

export default {
	components: {
		Handle,
	},
	props: {
		handleId: {
			type: String,
			required: true,
		},
		position: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			default: '',
		},
		icon: {
			type: String,
			default: 'fa fa-reply',
		},
		color: {
			type: String,
			default: '#3b82f6',
		},
		websiteLink: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		style() {
			return {
				backgroundColor: `${this.color}15`,
				borderColor: `${this.color}30`,
				color: this.color,
			}
		},
	},
}
</script>
