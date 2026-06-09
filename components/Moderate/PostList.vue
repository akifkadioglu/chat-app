<template>
	<div class="h-full flex flex-col w-full bg-base-100 truncate">
		<div class="min-w-0 px-4 border-b border-base-300 h-15 flex items-center">
			<h3 class="text-base sm:text-lg text-base-content truncate">
				{{ $t('components.comments.postList.title') }}
			</h3>
			<!--			<SelectedAccount />-->
		</div>

		<div class="flex-1 overflow-y-auto space-y-2 overflow-x-hidden">
			<State
				:is-loading="pageLoading"
				:isEmpty="!posts.length"
				:empty-title="$t('components.moderate.postList.noPosts')"
			>
				<ul class="menu w-full bg-base-100 gap-2 truncate">
					<DynamicScroller :items="posts" :min-item-size="60" key-field="id" ref="scroller">
						<template #default="{ item, index, active }">
							<DynamicScrollerItem :key="item.id" :item="item" :active="active" :data-index="index">
								<li class="my-1">
									<div
										v-if="item.id === 'all'"
										class="flex items-center w-full p-3 rounded-lg truncate cursor-pointer"
										:class="{ 'menu-active': !activePost }"
										@click="selectAllPosts"
									>
										<div class="flex flex-wrap items-center gap-3">
											<div class="stack w-10 h-10 stack-start">
												<div
													v-for="(stackPost, index) in stackPosts"
													:key="index"
													class="rounded-lg border border-muted overflow-hidden"
												>
													<img
														v-if="stackPost?.mediaUrl"
														v-img-error
														:src="stackPost.mediaUrl"
														:alt="stackPost.caption || 'Post'"
														class="w-full h-full object-cover"
													/>
													<div v-else class="w-full h-full bg-secondary flex items-center justify-center">
														<i class="fa fa-image text-base-content/40 text-xs"></i>
													</div>
												</div>
											</div>
											<div>
												<div class="font-medium">
													{{ $t('components.moderate.postList.allPosts.title') }}
												</div>
												<div class="text-xs text-muted">
													{{ $t('components.moderate.postList.allPosts.description') }}
												</div>
											</div>
										</div>
									</div>
									<div
										v-else
										class="flex items-center w-full px-3 py-1 rounded-lg truncate cursor-pointer"
										:class="[
											{ 'menu-active': activePost?.id === item?.id },
											{ 'bg-warning/30': temporaryHighlightId === item?.id },
											`border-account ${item.chatAccount?.borderAccountColor}`,
										]"
										@click="selectPost(item)"
									>
										<PostPreview :post="item" />
									</div>
								</li>
							</DynamicScrollerItem>
						</template>

						<template #after>
							<Pagination
								:current-page="currentScopeSlice.currentPage"
								:has-more="currentScopeSlice.hasMore"
								:loading="currentScopeSlice.loading"
								:infinite-scroll="true"
								@page-change="getPosts"
							/>
						</template>
					</DynamicScroller>
				</ul>
				<!--				<ul class="menu w-full bg-base-100 gap-2 truncate" v-auto-animate>-->
				<!--					<li class="w-full truncate">-->
				<!--						<div-->
				<!--							class="flex items-center w-full p-3 rounded-lg"-->
				<!--							:class="{ 'menu-active': !activePost }"-->
				<!--							@click="selectAllPosts"-->
				<!--						>-->
				<!--							<div class="flex items-center gap-3">-->
				<!--								<div class="stack w-10 h-10 stack-start">-->
				<!--									<div-->
				<!--										v-for="(stackPost, index) in stackPosts"-->
				<!--										:key="index"-->
				<!--										class="rounded-lg border border-muted overflow-hidden"-->
				<!--									>-->
				<!--										<img-->
				<!--											v-if="stackPost?.mediaUrl"-->
				<!--											v-img-error-->
				<!--											:src="stackPost.mediaUrl"-->
				<!--											:alt="stackPost.caption || 'Post'"-->
				<!--											class="w-full h-full object-cover"-->
				<!--										/>-->
				<!--										<div v-else class="w-full h-full bg-secondary flex items-center justify-center">-->
				<!--											<i class="fa fa-image text-base-content/40 text-xs"></i>-->
				<!--										</div>-->
				<!--									</div>-->
				<!--								</div>-->
				<!--								<div>-->
				<!--									<div class="font-medium">All Posts</div>-->
				<!--									<div class="text-xs opacity-70">Tüm gönderileri görüntüle</div>-->
				<!--								</div>-->
				<!--							</div>-->
				<!--						</div>-->
				<!--					</li>-->
				<!--					<li v-for="(post, index) in posts" :key="post.id" class="w-full truncate">-->
				<!--						<div-->
				<!--							class="flex flex-col items-start w-full"-->
				<!--							:class="[-->
				<!--								{ 'menu-active': activePost?.id === post?.id },-->
				<!--								`border-account ${post.chatAccount?.borderAccountColor}`,-->
				<!--							]"-->
				<!--							@click="selectPost(post)"-->
				<!--						>-->
				<!--							<PostPreview :post="post" />-->
				<!--						</div>-->
				<!--					</li>-->
				<!--				</ul>-->
				<!--				<Pagination-->
				<!--					:current-page="currentScopeSlice.currentPage"-->
				<!--					:total-pages="currentScopeSlice.lastPage"-->
				<!--					:loading="currentScopeSlice.loading"-->
				<!--					:infinite-scroll="true"-->
				<!--					@page-change="getPosts"-->
				<!--				/>-->
				<template #emptyButtons>
					<button :disabled="isLoading" @click="getPosts" class="btn btn-primary">
						<LoadingElement size="16" :is-loading="isLoading">
							<i class="fa fa-refresh" />
						</LoadingElement>
						{{ $t('components.chat.sidebar.conversationList.errorState.reloadButton') }}
					</button>
				</template>
				<!--				<template #error>-->
				<!--					<StateElement-->
				<!--						:title="$t('components.chat.sidebar.conversationList.errorState.title')"-->
				<!--						:content="$t('components.chat.sidebar.conversationList.errorState.message')"-->
				<!--					>-->
				<!--						<template #icon>-->
				<!--							<i class="fa fa-exclamation-triangle text-2xl" />-->
				<!--						</template>-->
				<!--						<template #buttons>-->
				<!--							<button :disabled="isLoading" @click="getPosts" class="btn btn-primary">-->
				<!--								<LoadingElement size="16" :is-loading="isLoading">-->
				<!--									<i class="fa fa-refresh" />-->
				<!--								</LoadingElement>-->
				<!--								{{ $t('components.chat.sidebar.conversationList.errorState.reloadButton') }}-->
				<!--							</button>-->
				<!--						</template>-->
				<!--					</StateElement>-->
				<!--				</template>-->
			</State>
		</div>
	</div>
</template>

<script>
// import ErrorState from '~/components/Chat/Sidebar/ConversationList/ErrorState.vue'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import PostPreview from '~/components/Moderate/PostPreview.vue'
import SelectedAccount from '~/components/Chat/Sidebar/SelectedAccount.vue'
import State from '~/components/GlobalComponents/State.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

export default {
	props: {
		selectedAccount: {
			type: Object,
			default: null,
		},
		highlightedPostId: {
			type: Number,
			default: null,
		},
	},
	components: {
		DynamicScrollerItem,
		DynamicScroller,
		LoadingElement,
		State,
		SelectedAccount,
		PostPreview,
		Pagination,
	},
	setup() {
		return {
			commentsStore: useCommentsStore(),
		}
	},
	mounted() {
		this.getPosts()
		this.$emitter.on('getPosts', this.getPosts)
	},
	data() {
		return {
			pageLoading: true,
			isLoading: false,
			temporaryHighlightId: null,
			postRefs: [],
			highlightTimeout: null,
		}
	},
	computed: {
		currentScopeKey() {
			return this.commentsStore.postScopeKey
		},
		currentScopeSlice() {
			return this.commentsStore.postScopeSlice
		},
		posts() {
			const posts = this.commentsStore.postsForScope(this.currentScopeKey)
			if (posts.length > 0) {
				return [{ id: 'all' }, ...posts]
			}
			return []
		},
		activePost() {
			return this.commentsStore.activePost
		},
		stackPosts() {
			return this.posts.slice(1, 3)
		},
	},
	methods: {
		setPostRef(el) {
			if (el) this.postRefs.push(el)
		},
		getPosts(page = 1) {
			consoleLog('Fetching posts for page:', page)
			this.isLoading = true
			this.commentsStore
				.fetchPosts(this.currentScopeKey, page)
				.then((r) => null)
				.catch((e) => null)
				.finally(() => {
					this.pageLoading = false
					this.isLoading = false
				})
		},
		selectPost(post) {
			this.$emitter.emit('selectPost', post)
			this.$emitter.emit('hideLeadingDrawer')
		},
		selectAllPosts() {
			this.$emitter.emit('selectPost', null)
			this.$emitter.emit('hideLeadingDrawer')
		},
		async scrollToPostAndHighlight(postId) {
			// TODO :: DynamicScroll'un kendi scroll'u çalışmıyor nedenini bul
			// if (this.$refs.scroller && this.$refs.scroller.scrollToItem) {
			// 	const postIndex = this.posts.findIndex((post) => post.id === postId)
			// 	if (postIndex !== -1) {
			// 		consoleLog('postIndex', postIndex)
			// 		this.$refs.scroller.scrollToItem(postIndex)
			// 	}
			// }
			// Method 2: DOM scroll fallback
			const index = this.posts.findIndex((p) => p.id === postId)
			const el = document.querySelector(`[data-index="${index}"]`)
			if (!el) return

			el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })

			const observer = new IntersectionObserver(
				(entries, obs) => {
					if (entries[0].isIntersecting) {
						setTimeout(() => {
							this.temporaryHighlightId = postId
						}, 200)
						obs.disconnect()
					}
				},
				{
					threshold: 0.9, // %90 görünür olunca tetikle
				},
			)

			observer.observe(el)
		},
	},
	watch: {
		currentScopeKey() {
			this.getPosts()
		},
		temporaryHighlightId(newId) {
			if (!newId) return
			// Önceki timeout'u iptal et
			if (this.highlightTimeout) {
				clearTimeout(this.highlightTimeout)
			}
			// Yeni timeout başlat
			this.highlightTimeout = setTimeout(() => {
				this.temporaryHighlightId = null
				this.highlightTimeout = null
			}, 2000)
		},
	},
}
</script>

<style scoped>
[data-index] {
	scroll-margin-top: 80px;
}
</style>
