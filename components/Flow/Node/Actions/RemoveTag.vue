<template>
	<div>
<!--		<Teleport :to="summaryRefElement" v-if="summaryRefElement && node.config.tagsToRemove && node.config.tagsToRemove.length">-->
			<div v-if="node.config.tagsToRemove && node.config.tagsToRemove.length" class="mb-4">
				<h4 class="text-sm font-medium mb-2">{{ $t('components.flow.node.actions.removeTag.removeTagsFromContact') }}</h4>

				<div
					v-for="(tag, index) in node.config.tagsToRemove"
					:key="`tag-${index}`"
					:class="tag.color ? `bg-tag-${tag.color}-light` : 'badge-outline'"
					class="badge badge-sm gap-2 cursor-pointer"
					@click="removeTagFromList(tag)"
				>
					{{ tag.name }}
					<i class="fa fa-times-circle text-xs"></i>
				</div>
			</div>
<!--		</Teleport>-->

		<div>
			<Tag
				:chat-account-id="flowStore.flow.chatAccountId"
				:existing-tags="node.config.tagsToRemove"
				@addTag="addTagToRemoveList"
			/>
		</div>
	</div>
</template>

<script>
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'

export default {
	components: { Tag },
	props: {
		node: {
			type: Object,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		addTagToRemoveList(tag) {
			if (!this.node.config.tagsToRemove) {
				this.node.config.tagsToRemove = []
			}
			this.node.config.tagsToRemove.push(tag)
		},
		removeTagFromList(tag) {
			this.node.config.tagsToRemove = this.node.config.tagsToRemove.filter((t) => t !== tag)
		},
	},
}
</script>
