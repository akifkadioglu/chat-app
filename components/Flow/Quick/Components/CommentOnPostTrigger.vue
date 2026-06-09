<template>
	<div class="space-y-5">
		<slot name="title">
			<h2 class="text-xl font-semibold">
				{{ title || this.$t('components.flow.quick.components.commentOnPostTrigger.title') }}
			</h2>
		</slot>
		<div class="divider" />
		<div class="flex flex-col space-y-1">
			<QuickFlowElement
				:node-uuid="triggerNode?.uuid"
				:trigger-uuid="trigger?.uuid"
				:title="$t('components.flow.quick.components.commentOnPostTrigger.type.selectedPost')"
				:is-selected="config.postType === CommentOnPostType.SELECTED_POSTS"
				is-input-left
			>
				<template #content>
					<SelectMedia :config="config" :chatAccount="chatAccount" />
				</template>
				<template #leading>
					<input
						v-model="config.postType"
						:value="CommentOnPostType.SELECTED_POSTS"
						class="radio radio-sm"
						type="radio"
					/>
				</template>
			</QuickFlowElement>

			<QuickFlowElement
				:node-uuid="triggerNode?.uuid"
				:trigger-uuid="trigger?.uuid"
				:title="$t('components.flow.quick.components.commentOnPostTrigger.type.anyPost')"
				:is-selected="config.postType === CommentOnPostType.ALL_POSTS"
				is-input-left
			>
				<template #leading>
					<input v-model="config.postType" :value="CommentOnPostType.ALL_POSTS" class="radio radio-sm" type="radio" />
				</template>
			</QuickFlowElement>

			<QuickFlowElement
				:node-uuid="triggerNode?.uuid"
				:trigger-uuid="trigger?.uuid"
				:title="$t('components.flow.quick.components.commentOnPostTrigger.type.nextPost')"
				:is-selected="config.postType === CommentOnPostType.NEXT_POST"
				is-input-left
			>
				<template #leading>
					<input v-model="config.postType" :value="CommentOnPostType.NEXT_POST" class="radio radio-sm" type="radio" />
				</template>
			</QuickFlowElement>
		</div>
		<!--		<div v-if="showFilters">-->
		<!--			<div class="font-semibold text-gray-600">-->
		<!--				{{ $t('components.flow.quick.components.triggerKeywordSettings.title') }}-->
		<!--			</div>-->
		<!--			<Filters :filterOptions="config.filters" />-->
		<!--		</div>-->
		<TriggerKeywordSettings v-if="showFilters" :config="config" ref="step-2" />

		<QuickFlowElement
			v-if="showReplies"
			:node-uuid="triggerNode?.uuid"
			:trigger-uuid="trigger?.uuid"
			:is-selected="config.showReplyComment"
			:title="$t('components.flow.quick.components.commentOnPostTrigger.replyToCommentsLabel')"
		>
			<template #content>
				<ReplyCommentForm ref="ReplyCommentForm" v-if="config?.replyComments" :config="config" />
			</template>
			<template #trailing>
				<input type="checkbox" v-model="config.showReplyComment" checked="checked" class="toggle" />
			</template>
		</QuickFlowElement>
	</div>
</template>
<script>
import { CommentOnPostType, nodeTypes } from '~/models/Flow/utils/utils.ts'
import SelectMedia from '~/components/Flow/Node/Triggers/Partials/SelectMedia.vue'
import TriggerKeywordSettings from '~/components/Flow/Quick/Components/TriggerKeywordSettings.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import PostTypeMixin from '~/mixins/PostTypeMixin.js'
import Filters from '~/components/Flow/Quick/Components/Filters.vue'
import ReplyCommentForm from '~/components/Flow/Quick/Components/ReplyCommentForm.vue'
import ToggleSwitch from '~/components/Flow/Node/Triggers/Partials/ToggleSwitch.vue'
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	mixins: [PostTypeMixin],
	components: {
		ChatLogo,
		SimpliersLogo,
		ToggleSwitch,
		Filters,
		QuickFlowElement,
		TriggerKeywordSettings,
		SelectMedia,
		ReplyCommentForm,
	},
	props: {
		title: {
			type: String,
		},
		flow: {
			type: Flow,
			required: true,
		},
		showReplies: {
			type: Boolean,
			default: true,
		},
		showFilters: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['focusTrigger', 'focusNode'],
	setup() {
		return {
			chatAccountStore: useChatAccountsStore(),
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountStore.active
		},
		config() {
			return this.trigger?.config ?? {}
		},
		trigger() {
			return this.triggerNode?.triggers[0]
		},
		triggerNode() {
			return this.flow?.nodes.find((n) => n.type.key === nodeTypes.trigger.key)
		},
	},
	data() {
		return {
			CommentOnPostType,
		}
	},
	watch: {
		'config.showReplyComment'(val) {
			consoleLog('SETTING REPLY COMMENTS', val, this.config)
			if (val && (!this.config.replyComments || !this.config.replyComments.length)) {
				this.config.replyComments = []
				this.$tm('components.flow.quick.components.commentOnPostTrigger.replies').forEach((reply, i) => {
					this.config.replyComments[i] = this.$t('components.flow.quick.components.commentOnPostTrigger.replies.' + i)
				})
			}
		},
	},
	// mounted() {
	// this.setReplyComment()
	// },
	// methods: {
	// setReplyComment() {
	// 	if (!this.config.replyComments) {
	// 		this.config.replyComments = []
	// 	}
	// 	this.$tm('components.flow.quick.components.commentOnPostTrigger.replies').forEach((reply, i) => {
	// 		this.config.replyComments[i] = this.$t('components.flow.quick.components.commentOnPostTrigger.replies.' + i)
	// 	})
	// },
	// },
}
</script>

<style scoped></style>
