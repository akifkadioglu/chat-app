<template>
	<div>
		<SelectPostTypeSelector :isLastPostLoading v-model="config.postType" :options="options" />

		<div v-auto-animate>
			<SelectMedia class="mt-5" :config="config" :chat-account="chatAccount" />
		</div>
	</div>
</template>
<script>
import { CommentOnPostType } from '~/models/Flow/utils/utils.js'
import SelectPostTypeSelector from '~/components/Flow/Node/Triggers/Partials/SelectPostTypeSelector.vue'
import SelectMedia from '~/components/Flow/Node/Triggers/Partials/SelectMedia.vue'
import { ChatAccount } from '~/models/ChatAccount.js'
import PostTypeMixin from '~/mixins/PostTypeMixin.js'

export default {
	mixins: [PostTypeMixin],
	components: { SelectPostTypeSelector, SelectMedia },
	props: {
		config: {
			type: Object,
			required: true,
		},
		chatAccount: {
			type: ChatAccount,
			default: null,
		},
	},
	data() {
		// this.config.postType = this.config.postType || CommentOnPostType.ALL_POSTS
		return {}
	},
	computed: {
		CommentOnPostType() {
			return CommentOnPostType
		},
		options() {
			return [
				{
					value: CommentOnPostType.ALL_POSTS,
					title: this.$t('components.flow.node.triggers.partials.selectPostType.allPostsTitle'),
					description: this.$t('components.flow.node.triggers.partials.selectPostType.allPostsDescription'),
					icon: 'fa fa-border-all fa-lg',
				},
				{
					value: CommentOnPostType.NEXT_POST,
					title: this.$t('components.flow.node.triggers.partials.selectPostType.nextPostTitle'),
					description: this.$t('components.flow.node.triggers.partials.selectPostType.nextPostDescription'),
					icon: 'fa fa-right-long fa-lg',
				},
				{
					value: CommentOnPostType.SELECTED_POSTS,
					title: this.$t('components.flow.node.triggers.partials.selectPostType.selectSpecificTitle'),
					description: this.$t('components.flow.node.triggers.partials.selectPostType.selectSpecificDescription'),
					icon: 'fa-regular fa-square-check fa-lg',
				},
			]
		},
	},
	methods: {
		closeDropdown() {
			if (typeof document !== 'undefined' && document.activeElement) {
				document.activeElement.blur()
			}
		},
	},
}
</script>
