<template>
	<div>
		<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.removeTag.removeTagsFromContact') }}</h4>

		<div v-if="node.config.tagsToRemove && node.config.tagsToRemove.length > 0">
			<div
				v-for="(tag, index) in node.config.tagsToRemove"
				:key="`tag-${index}`"
				:class="tag.color ? `bg-tag-${tag.color}-light` : 'badge-outline'"
				class="badge badge-sm gap-2"
			>
				{{ tag.name }}
			</div>
		</div>
		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.removeTag.emptyState')" />
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
