<template>
	<div>
		<div v-if="chatAccount" class="flex items-center gap-3">
			<ProfilePicture
				:src="chatAccount.postAccount.profilePicture"
				size="32"
				:alt="$t('components.flow.node.triggers.partials.selectMedia.profileAlt')"
			/>
			<div>
				<p class="text-sm">{{ chatAccount.postAccount.name }}</p>
				<p class="text-xs text-base-content/70">@{{ chatAccount.postAccount.username }}</p>
			</div>
		</div>
		<div v-else class="flex items-center gap-3">
			<div class="avatar">
				<div class="w-12 rounded-full">
					<img src="/images/ui/user.png" :alt="$t('components.flow.node.triggers.partials.selectMedia.profileAlt')" />
				</div>
			</div>
			<label class="input">
				<i class="fa fa-at"></i>
				<input
					@input="debouncedSearchUser"
					type="text"
					class="grow input"
					:placeholder="$t('components.flow.node.triggers.partials.selectMedia.usernamePlaceholder')"
				/>
				<span v-if="isSearching" class="fa fa-spinner fa-spin" />
			</label>
		</div>

		<div v-auto-animate>
			<div class="w-full">
				<div
					ref="postsContainerRef"
					class="max-h-80 max-w-2xl"
					:class="{
						'overflow-y-auto': config.postType === CommentOnPostType.SELECTED_POSTS,
						'overflow-hidden':
							config.postType === CommentOnPostType.ALL_POSTS || config.postType === CommentOnPostType.NEXT_POST,
					}"
				>
					<div class="grid grid-cols-3 gap-3 mt-2">
						<div
							class="relative flex items-center gap-2"
							v-if="config.postType === CommentOnPostType.NEXT_POST || config.postType === CommentOnPostType.ALL_POSTS"
						>
							<div class="aspect-square w-full rounded-lg overflow-hidden border-2 transition-colors border-primary">
								<div class="h-full flex flex-col gap-2 justify-center items-center overflow-hidden opacity-50">
									<div>
										<i class="fa fa-image text-5xl" />
									</div>
									<div class="text-sm">{{ $t('components.flow.node.triggers.partials.selectMedia.nextPost') }}</div>
								</div>
							</div>
							<div
								class="absolute top-2 right-2 bg-primary text-primary-content rounded-full w-6 h-6 flex items-center justify-center"
							>
								<i class="fa fa-check text-xs"></i>
							</div>
						</div>
						<div
							v-for="(post, i) in posts"
							:key="i"
							@click="config.postType === CommentOnPostType.SELECTED_POSTS ? selectPost(post.id) : null"
							class="relative transition-all duration-200 hover:border-primary"
							:class="{ 'cursor-pointer': config.postType === CommentOnPostType.SELECTED_POSTS }"
						>
							<div
								class="aspect-square rounded-lg overflow-hidden border-2 transition-colors"
								:class="showSelectedStyle(post.id) ? 'border-primary opacity-50' : 'border-base-300'"
							>
								<img
									:src="post.imageUrl"
									:alt="$t('components.flow.node.triggers.partials.selectMedia.postAlt')"
									class="w-full h-full object-cover"
								/>
								<div class="absolute top-1 right-1">
									<MediaTypeBadge :mediaType="post.mediaType" :mediaProductType="post.mediaProductType" />
								</div>
							</div>
							<div
								v-if="showSelectedStyle(post.id)"
								class="absolute top-2 right-2 bg-primary text-primary-content rounded-full w-6 h-6 flex items-center justify-center"
							>
								<i class="fa fa-check text-xs"></i>
							</div>
						</div>
					</div>
					<Pagination
						v-if="!viewByAdmin"
						infiniteScroll
						:loading="postsLoading"
						:currentPage="1"
						:has-more="hasNextPage"
						@page-change="getPosts(false)"
					/>
				</div>
				<div class="label mt-2">
					<span class="text-xs flex gap-2 items-center">
						<loading-element :is-loading="postsLoading" size="12">
							<i class="fa fa-info-circle text-info" />
						</loading-element>

						<span v-if="config.postType === CommentOnPostType.SELECTED_POSTS">
							{{
								$t('components.flow.node.triggers.partials.selectMedia.selectedPostsLabel', {
									count: config.selectedPostIds?.length,
								})
							}}
						</span>
						<span v-else-if="config.postType === CommentOnPostType.ALL_POSTS">
							{{ $t('components.flow.node.triggers.partials.selectMedia.allPostsSelected') }}
						</span>
						<span v-else-if="config.postType === CommentOnPostType.NEXT_POST">
							{{ $t('components.flow.node.triggers.partials.selectMedia.nextPostSelected') }}
						</span>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import pkg from 'lodash'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import { ChatAccount } from '~/models/ChatAccount.js'
import { CommentOnPostType } from '~/models/Flow/utils/utils.ts'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import MediaTypeBadge from '~/components/GlobalComponents/MediaTypeBadge.vue'

const { debounce } = pkg

export default {
	components: { MediaTypeBadge, ProfilePicture, Pagination, LoadingElement },
	props: {
		chatAccount: {
			type: ChatAccount,
			default: null,
		},
		config: {
			type: Object,
		},
	},
	// admin/flow/[id].vue'dan gelen kişiler için olan bir kontrol
	inject: {
		viewByAdmin: {
			default: false,
		},
	},

	data() {
		return {
			CommentOnPostType,
			postsLoading: false,
			posts: [],
			isSearching: false,
			debouncedSearchUser: null,
			hasNextPage: true,
			afterCursor: '',
		}
	},
	computed: {
		showSelectedStyle() {
			return (postId) => {
				const isNext = this.config.postType === CommentOnPostType.NEXT_POST
				if (isNext) return false

				const isSelected = this.config.selectedPostIds?.includes(postId)
				const isAll = this.config.postType === CommentOnPostType.ALL_POSTS

				return isSelected || isAll
			}
		},
		selectedPostImgs() {
			return this.config.selectedPostImgs ?? []
		},
	},

	created() {
		this.debouncedSearchUser = debounce(this.searchUser, 1500)
	},
	mounted() {
		if (this.chatAccount) {
			consoleLog('getPosts çağırılıyor: Mounted')
			this.getPosts(true)
		}
		if (this.viewByAdmin) {
			this.posts = this.selectedPostImgs.map((img) => ({
				id: img,
				imageUrl: img,
			}))
		}
	},
	watch: {
		'config.postType'(newVal) {
			if (newVal !== CommentOnPostType.SELECTED_POSTS) {
				this.$refs.postsContainerRef.scrollTop = 0
			}
		},
		chatAccount(newVal, oldVal) {
			if (newVal?.id === oldVal?.id) return
			consoleLog('getPosts çağırılıyor: watch')
			this.getPosts(true)
		},
	},
	methods: {
		async getPosts(restart = false) {
			if (this.viewByAdmin) return
			this.postsLoading = true
			if (restart) {
				this.posts = []
				this.afterCursor = ''
			}
			await this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.medias.get, {
					chatAccountId: this.chatAccount.id,
					query: {
						afterCursor: this.afterCursor,
					},
				})
				.then((response) => {
					const existingIds = new Set(this.posts.map((p) => p.id))
					const newPosts = response.data.medias
						.filter((media) => !existingIds.has(media.id))
						.map((media) => ({
							id: media.id,
							imageUrl: media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url,
							mediaType: media.media_type,
							mediaProductType: media.media_product_type,
							shortcode: media.shortcode,
						}))
					this.posts = [...this.posts, ...newPosts]
					//eğer paging null gelirse hasNextPage'i false yapıyorum
					if (!response.data.paging) {
						this.hasNextPage = false
						return
					}
					this.hasNextPage = !!response.data.paging.next
					this.afterCursor = response.data.paging.after
				})
				.catch(() => {
					this.posts = []
				})
				.finally(() => {
					// this.syncSelectedPostMeta()
					this.postsLoading = false
				})
		},
		searchUser(e) {
			const value = e.target.value.trim()

			if (value.length > 0) {
				this.isSearching = true
				// Simulate API call delay
				setTimeout(() => {
					this.isSearching = false
				}, 1000)
			} else {
				this.isSearching = false
				this.config.selectedPostIds = []
				// this.config.selectedPostImgs = []
				// this.config.selectedPostShortcodes = []
			}
		},
		syncSelectedPostMeta() {
			if (!this.config.selectedPostIds?.length) {
				this.config.selectedPostImgs = []
				this.config.selectedPostShortcodes = []
				return
			}
			const imgs = []
			const shortcodes = []
			this.config.selectedPostIds.forEach((postId) => {
				const post = this.posts.find((p) => p.id === postId)
				imgs.push(post?.imageUrl ?? null)
				shortcodes.push(post?.shortcode ?? null)
			})
			this.config.selectedPostImgs = imgs
			this.config.selectedPostShortcodes = shortcodes
		},
		selectPost(id) {
			if (this.viewByAdmin) return
			const existingIndex = this.config.selectedPostIds?.indexOf(id) ?? -1
			const post = this.posts.find((p) => p.id === id)

			if (existingIndex === -1) {
				this.config.selectedPostIds.push(post.id)
			} else {
				this.config.selectedPostIds.splice(existingIndex, 1)
			}

			this.syncSelectedPostMeta()
		},
	},
}
</script>
