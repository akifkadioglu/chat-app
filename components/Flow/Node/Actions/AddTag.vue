<template>
	<div>
		<!--			<Teleport defer v-if="summaryRefElement && node.config.tags && node.config.tags.length" :to="summaryRefElement">-->
		<div :key="node.uuid" v-if="node.config.tags && node.config.tags.length" class="mb-4">
			<h4 class="text-sm font-medium mb-2">
				{{ title || $t('components.flow.node.actions.addTag.addTagsToContact') }}
			</h4>

			<div
				v-for="(tag, index) in node.config.tags"
				:key="`tag-${index}`"
				:class="tag.color ? `bg-tag-${tag.color}-light` : 'badge-outline'"
				class="badge badge-sm gap-2 cursor-pointer"
				@click="removeTag(tag)"
			>
				{{ tag.name }}
				<i class="fa fa-times-circle text-xs"></i>
			</div>
		</div>
		<!--			</Teleport>-->
		<div>
			<Tag :chat-account-id="flowStore.flow.chatAccountId" :existing-tags="node.config.tags" @addTag="addTag" />
		</div>
	</div>
</template>
<script>
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'

import { Node } from '~/models/Flow/Node.js'

export default {
	components: { Tag },
	props: {
		node: {
			type: Node,
			required: true,
		},
		title: {
			type: String,
			default: null,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		addTag(tag) {
			consoleLog('this.node.config tag', this.node.config, tag)
			if (!this.node.config.tags) {
				this.node.config.tags = []
			}
			this.node.config.tags.push(tag)
		},
		removeTag(tag) {
			this.node.config.tags = this.node.config.tags.filter((t) => t !== tag)
		},
	},
}
</script>
