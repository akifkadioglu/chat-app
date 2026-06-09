<template>
	<!-- Comment On Post -->
	<div v-if="triggerType === 'commentOnPost'" class="">
		<div class="flex items-center gap-2">
			<i class="fas fa-comment text-pink-500" />
			<span class="text-muted">{{ $t('components.flow.node.triggers.commentOnPost.description') }}</span>
		</div>
		<div v-if="showBadge" class="w-fit mt-2">
			<div v-if="showPostThumbnails" class="flex items-center gap-2">
				<div class="avatar-group -space-x-2 overflow-visible">
					<!-- Seçili Postlar -->
					<div
						v-if="[CommentOnPostType.SELECTED_POSTS, CommentOnPostType.ALL_POSTS].includes(trigger.config?.postType)"
						v-for="media in trigger.selectedPosts?.slice(0, 5)"
						:key="media.id"
						class="avatar rounded-lg ring-0 border-1 transition-transform duration-300 delay-100 hover:scale-200 hover:z-2 hover:shadow"
					>
						<div class="w-8">
							<img :src="media.thumbnail_url ?? media.media_url" alt="" />
						</div>
					</div>
					<!-- +N daha -->
					<div
						v-if="
							trigger.config?.postType === CommentOnPostType.SELECTED_POSTS &&
							trigger.config.selectedPostIds?.length > 5
						"
						class="avatar rounded-lg ring-0 border-1 bg-base-200 text-base-content"
					>
						<div class="w-8 flex items-center justify-center">+{{ trigger.config.selectedPostIds?.length - 5 }}</div>
					</div>
					<!-- Sonraki Post placeholder -->
					<div
						v-if="trigger.config?.postType === CommentOnPostType.NEXT_POST"
						class="avatar rounded-lg ring-0 border-1 border-base-100 bg-base-200 text-base-content"
					>
						<div class="w-8 h-8 flex items-center justify-center">
							<i class="fas fa-image text-muted" />
						</div>
					</div>
					<!-- Tüm Postlar +Hepsi -->
					<div
						v-if="trigger.config?.postType === CommentOnPostType.ALL_POSTS"
						class="min-h-8 px-2 flex items-center justify-center rounded-lg border-1 border-base-200 bg-base-200 text-base-content text-xs z-1"
					>
						<span class="text-xs font-medium">
							{{ $t('components.flow.node.triggers.partials.triggerSummary.plusAll') }}
						</span>
					</div>
				</div>
				<!-- Post Type Badge -->
				<div
					class="h-6 px-1 flex items-center justify-center rounded-sm border-1 border-base-200 bg-info-content text-info text-xs z-1"
				>
					{{ postTypeBadge }}
				</div>
			</div>

			<div v-else class="bg-subtle text-secondary px-2 py-0.5 rounded text-xs font-medium">
				{{ postTypeBadge }}
			</div>
		</div>
	</div>

	<!-- Received DM -->
	<div v-else-if="triggerType === 'receivedDM'" class="flex items-center gap-2">
		<i class="fas fa-envelope text-blue-500" />
		<span class="text-muted">{{ $t('components.flow.node.triggers.receivedDM.description') }}</span>
		<span v-if="dmBadge && showBadge" class="bg-subtle text-secondary px-2 py-0.5 rounded text-xs font-medium">
			{{ dmBadge }}
		</span>
	</div>

	<!-- Reply To Story -->
	<div v-else-if="triggerType === 'replyToStory'" class="flex items-center gap-2">
		<i class="fas fa-reply text-green-500" />
		<span class="text-muted">{{ $t('components.flow.node.triggers.replyToStory.description') }}</span>
	</div>

	<!-- Story Mention -->
	<div v-else-if="triggerType === 'storyMention'" class="flex items-center gap-2">
		<i class="fas fa-at text-purple-500" />
		<span class="text-muted">{{ $t('components.flow.node.triggers.storyMention.description') }}</span>
	</div>

	<div v-else-if="triggerType === 'commentOnLive'" class="flex items-center gap-2">
		<i class="fas fa-video text-red-500" />
		<span class="text-muted">{{ $t('components.flow.node.triggers.commentOnLive.description') }}</span>
	</div>

	<div v-else-if="triggerType === 'otherFlow'" class="flex items-center gap-2">
		<i class="fas fa-paper-plane text-primary" />
		<!-- TODO: Buradan diğer flow'a bağlantı ver-->
		<span class="badge badge-dash">
			<span class="text-gray-400">#{{ trigger.config.source_flow_id }}</span> Flow
		</span>
	</div>

	<!-- Unknown Trigger -->
	<div v-else class="flex items-center gap-2">
		<i class="fas fa-question text-muted" />
		<span class="text-muted">{{ $t('components.flow.node.triggers.unknownTrigger.description') }}</span>
	</div>
</template>

<script>
import { CommentOnPostType } from '~/models/Flow/utils/utils.js'
import { Trigger } from '~/models/Flow/Trigger.ts'
// import defaultConfigs from '~/models/Flow/utils/defaultConfigs.ts'

export default {
	props: {
		trigger: {
			type: Trigger,
			required: true,
		},
		showBadge: {
			type: Boolean,
			default: true,
		},
		showPostThumbnails: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		// const defaultConfig = defaultConfigs(this.$t)[nodeTypes.trigger.key]
		// this.trigger.config = {
		// 	...(defaultConfig[this.trigger.type.key] || {}),
		// 	...this.trigger.config,
		// }
		return {}
	},
	computed: {
		CommentOnPostType() {
			return CommentOnPostType
		},
		triggerType() {
			return this.trigger?.type?.key ?? null
		},
		postTypeBadge() {
			const postType = this.trigger.config?.postType
			if (postType === CommentOnPostType.NEXT_POST) {
				return this.$t('components.flow.node.triggers.partials.triggerSummary.nextPost')
			} else if (postType === CommentOnPostType.ALL_POSTS) {
				return this.$t('components.flow.node.triggers.partials.triggerSummary.allPosts')
			} else if (postType === CommentOnPostType.SELECTED_POSTS) {
				return this.$t('components.flow.node.triggers.partials.triggerSummary.selectedPosts', {
					count: this.trigger.config.selectedPostIds?.length || 0,
				})
			}
			return ''
		},
		// commentBadge() {
		// 	if (this.triggerType !== 'commentOnPost') return null
		//
		// 	const config = this.trigger.config
		// 	if (!config) return null
		//
		// 	if (config.postType === CommentOnPostType.NEXT_POST) {
		// 		return this.$t('components.flow.node.triggers.partials.triggerSummary.nextPost')
		// 	} else if (config.postType === CommentOnPostType.SELECTED_POSTS) {
		// 		return this.$t('components.flow.node.triggers.partials.triggerSummary.selectedPosts', {
		// 			count: config.selectedPostIds?.length || 0,
		// 		})
		// 	} else if (config.postType === CommentOnPostType.ALL_POSTS) {
		// 		return this.$t('components.flow.node.triggers.partials.triggerSummary.allPosts')
		// 	}
		// 	return null
		// },
		dmBadge() {
			if (this.triggerType !== 'receivedDM') return null

			const config = this.trigger.config
			if (!config?.filters) return null

			const includeCount = config.filters.includes?.length || 0
			const excludeCount = config.filters.excludes?.length || 0

			if (includeCount > 0 || excludeCount > 0) {
				return this.$t('components.flow.node.triggers.partials.triggerSummary.filtered')
			}
			return null
		},
	},
}
</script>
