<template>
	<div class="flex w-full items-center px-4 gap-4" :class="{ 'h-15': !post }">
		<!-- Sol: Post veya Stack -->
		<div v-if="post" class="flex items-center gap-4 shrink-0">
			<div v-if="post?.chatAccount" class="relative">
				<div :class="`ring-2 ${post.chatAccount.ringColor || 'ring-base-300'} ring-opacity-60`" class="rounded-full">
					<ProfilePicture
						:alt="post.chatAccount.postAccount?.username || 'User'"
						:src="post.chatAccount.postAccount?.profilePicture"
						:size="24"
					/>
				</div>
			</div>
			<div class="shrink-0">
				<div v-if="post?.mediaUrl" class="w-12 h-12 bg-base-200 rounded-lg overflow-hidden relative">
					<img v-img-error :src="post.mediaUrl" :alt="post.caption || 'Post'" class="w-full h-full object-cover" />
					<div class="absolute top-0.5 right-0.5">
						<div class="bg-black/60 text-white px-1 py-0.5 rounded text-xs">
							<i v-if="post.mediaType === 'VIDEO'" class="fa fa-play"></i>
							<i v-else-if="post.mediaType === 'CAROUSEL_ALBUM'" class="fa fa-images"></i>
							<i v-else class="fa fa-image"></i>
						</div>
					</div>
				</div>
				<div v-else class="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
					<i class="fa fa-image text-base-content/40"></i>
				</div>
			</div>
			<div>
				<div>{{ $t('components.moderate.postHeader.comments') }}</div>
			</div>
		</div>

		<div v-else class="flex items-center gap-4 shrink-0">
			<div class="stack w-12 h-12 stack-start">
				<div
					v-for="(stackPost, index) in stackPosts"
					:key="index"
					class="rounded-lg border border-base-300 overflow-hidden"
				>
					<img
						v-if="stackPost?.mediaUrl"
						v-img-error
						:src="stackPost.mediaUrl"
						:alt="stackPost.caption || 'Post'"
						class="w-full h-full object-cover"
					/>
					<div v-else class="w-full h-full bg-base-200 flex items-center justify-center">
						<i class="fa fa-image text-base-content/40 text-xs"></i>
					</div>
				</div>
			</div>
			<div>
				{{ $t('components.moderate.postHeader.allComments') }}
			</div>
		</div>

		<!-- Sağ: Filter Dropdown -->
		<CommentFilterDropdown class="ml-auto" />
	</div>
</template>

<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import CommentFilterDropdown from '~/components/Moderate/CommentFilterDropdown.vue'

import { Post } from '~/models/Post/Post.js'

export default {
	name: 'PostHeader',
	components: {
		ProfilePicture,
		CommentFilterDropdown,
	},
	props: {
		post: {
			type: Post,
			default: null,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			commentsStore: useCommentsStore(),
		}
	},
	computed: {
		currentScopeKey() {
			return this.commentsStore.postScopeKey
		},
		stackPosts() {
			return this.commentsStore.postsForScope(this.currentScopeKey).slice(0, 3)
		},
	},
	methods: {
		viewPost() {
			if (this.post?.permalink) {
				window.open(this.post.permalink, '_blank')
			}
		},
	},
}
</script>

<style scoped></style>
