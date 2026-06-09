<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.addTag.addTagsToContact') }}</h4>

		<div v-if="node.config.tags && node.config.tags.length > 0">
			<div
				v-for="(tag, index) in node.config.tags"
				:key="`tag-${index}`"
				:class="tag.color ? `bg-tag-${tag.color}-light` : 'badge-outline'"
				class="badge badge-sm gap-2"
			>
				{{ tag.name }}
			</div>
		</div>

		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.addTag.emptyState')" />
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'

export default {
	components: { NodeSummaryEmptyState },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
}
</script>
