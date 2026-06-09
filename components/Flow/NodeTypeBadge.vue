<template>
	<span v-if="labelOnly">
		{{ nodeType.label }}
	</span>
	<span
		v-else
		class="badge badge-soft"
		:class="{
			'badge-success': nodeType.key === nodeTypes.trigger.key,
			'badge-accent': nodeTypes.actions.hasOwnProperty(nodeType.key),
			'badge-warning': nodeType.key === nodeTypes.conditions.comparison.key,
		}"
	>
		<i class="fa" :class="nodeIcon" />
		<span v-if="showLabel">{{ nodeType.label }}</span>
		<slot />
	</span>
</template>
<script>
import { nodeTypes } from '~/models/Flow/utils/utils.js'
import { NodeType } from '~/models/Flow/NodeType.js'

export default {
	name: 'NodeTypeBadge',
	props: {
		nodeType: {
			type: NodeType,
			required: true,
		},
		showLabel: {
			type: Boolean,
			default: false,
		},
		labelOnly: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
	},
	data() {
		const nodeIcons = {
			trigger: 'fa-play',
			addTag: 'fa-tag',
			removeTag: 'fa-tag',
			delay: 'fa-hourglass-half',
			externalRequest: 'fa-external-link-alt',
			sendMessage: 'fa-envelope',
			dataCollection: 'fa-database',
			comparison: 'fa-balance-scale',
			triggerFlow: 'fa-random',
			pauseFlows: 'fa fa-pause',
			signature: 'fa-signature',
		}
		return {
			nodeIcon: nodeIcons[this.nodeType.key] || 'fa-cube',
		}
	},
}
</script>
