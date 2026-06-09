<template>
	<div class="flex flex-wrap items-center gap-3">
		<!-- Search Input (Left) -->
		<label class="input input-sm input-bordered flex items-center gap-2 w-64">
			<i class="fa fa-search text-muted" />
			<input
				v-model="searchValue"
				type="text"
				class="input"
				:placeholder="$t('pages.app.flows.filters.searchByName')"
				@input="debouncedEmitSearch"
			/>
			<button v-if="searchValue" class="btn btn-xs btn-ghost btn-circle" @click="clearSearch">
				<i class="fa fa-times" />
			</button>
		</label>

		<!-- Trigger Type Filter Dropdown -->
		<CustomDropdown :distance="8">
			<button class="btn btn-sm gap-2 btn-ghost border border-base-300">
				<i class="fa fa-bolt" />
				{{ $t('pages.app.flows.filters.filterByTrigger') }}
				<span v-if="selectedTriggerTypes.length > 0" class="badge badge-primary badge-soft badge-sm">
					{{ selectedTriggerTypes.length }}
				</span>
				<i class="fa fa-chevron-down text-xs" />
			</button>

			<template #popper>
				<div class="p-3 w-64">
					<div class="flex items-center justify-between mb-3">
						<p class="text-sm font-medium">{{ $t('pages.app.flows.filters.selectTriggerTypes') }}</p>
						<button
							v-if="selectedTriggerTypes.length > 0"
							class="btn btn-xs btn-ghost text-error"
							@click="clearTriggerTypes"
						>
							<i class="fa fa-times" />
						</button>
					</div>
					<div class="flex flex-col gap-1">
						<label
							v-for="trigger in availableTriggerTypes"
							:key="trigger.key"
							class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
						>
							<input
								type="checkbox"
								class="checkbox checkbox-sm"
								:checked="isSelectedTriggerType(trigger.key)"
								@change="toggleTriggerType(trigger.key)"
							/>
							<i :class="trigger.icon" class="text-muted w-4" />
							<span class="text-sm">{{ $t(`pages.app.flows.filters.triggerTypes.${trigger.key}`) }}</span>
						</label>
					</div>
				</div>
			</template>
		</CustomDropdown>

		<!-- Post Filter Dropdown -->
		<CustomDropdown :distance="8" @show="onPostDropdownShow">
			<button class="btn btn-sm gap-2 btn-ghost border border-base-300">
				<i v-if="selectedPostIds.length === 0" class="fa fa-image" />
				<template v-else-if="selectedPostIds.length === 1 && selectedPostPreviews[0]">
					<div class="w-5 h-5 rounded overflow-hidden">
						<img
							v-img-error
							:src="selectedPostPreviews[0].thumbnail_url ?? selectedPostPreviews[0].media_url"
							class="w-full h-full object-cover"
							alt="post thumbnail"
						/>
					</div>
				</template>
				<i v-else class="fa fa-images" />
				{{ $t('pages.app.flows.filters.filterByPost') }}
				<span v-if="selectedPostIds.length > 0" class="badge badge-primary badge-soft badge-sm">
					{{ selectedPostIds.length }}
				</span>
				<i class="fa fa-chevron-down text-xs" />
			</button>

			<template #popper>
				<div class="p-3 w-80 max-h-96 overflow-hidden flex flex-col">
					<div class="flex items-center justify-between mb-3">
						<p class="text-sm font-medium">{{ $t('pages.app.flows.filters.selectPost') }}</p>
						<button v-if="selectedPostIds.length > 0" class="btn btn-xs btn-ghost text-error" @click="clearPostFilter">
							<i class="fa fa-times" />
						</button>
					</div>

					<div class="flex-1 overflow-y-auto">
						<div v-if="postsLoading && posts.length === 0" class="flex justify-center py-8">
							<span class="loading loading-spinner loading-md"></span>
						</div>
						<div v-else class="grid grid-cols-3 gap-2">
							<div
								v-for="post in posts"
								:key="post.id"
								@click="togglePostFilter(post)"
								class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:opacity-80"
								:class="
									isSelectedPost(post.id)
										? 'border-primary ring-2 ring-primary/30'
										: 'border-transparent hover:border-base-300'
								"
							>
								<img :src="post.thumbnail_url ?? post.media_url" class="w-full h-full object-cover" />
								<div
									v-if="isSelectedPost(post.id)"
									class="absolute inset-0 bg-primary/20 flex items-center justify-center"
								>
									<div class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center">
										<i class="fa fa-check text-xs" />
									</div>
								</div>
							</div>
						</div>
						<Pagination
							v-if="posts.length > 0"
							class="mt-3"
							:current-page="postsCurrentPage"
							:has-more="postsHasMore"
							:loading="postsLoading"
							:infinite-scroll="true"
							@page-change="loadMorePosts"
						/>
					</div>
				</div>
			</template>
		</CustomDropdown>

		<!-- Sort Dropdown -->
		<CustomDropdown ref="sortingDropdown" :distance="8">
			<button class="btn btn-sm gap-2 btn-ghost border border-base-300">
				<i class="fa fa-sort" />
				<template v-if="selectedSortBy">
					{{ sortLabel }}
				</template>
				<template v-else>
					{{ $t('pages.app.flows.filters.sortBy') }}
				</template>
				<i class="fa fa-chevron-down text-xs" />
			</button>

			<template #popper>
				<div class="p-3 w-fit min-w-56">
					<div class="flex items-center justify-between mb-3">
						<p class="text-sm font-medium">{{ $t('pages.app.flows.filters.sortBy') }}</p>
						<button v-if="selectedSortBy" class="btn btn-xs btn-ghost text-error" @click="clearSort">
							<i class="fa fa-times" />
						</button>
					</div>
					<div class="flex flex-col gap-1">
						<button
							v-for="option in flatSortOptions"
							:key="option.key + '-' + option.direction"
							class="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors w-full text-left"
							:class="{
								'bg-primary/10 text-primary font-medium':
									selectedSortBy === option.key && selectedSortDirection === option.direction,
							}"
							@click="selectSort(option.key, option.direction)"
						>
							<span class="text-sm">
								{{ $t(`pages.app.flows.filters.sortLabels.${option.label}`) }}
							</span>
						</button>
					</div>
				</div>
			</template>
		</CustomDropdown>
	</div>
</template>

<script>
import pkg from 'lodash'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { triggerTypes } from '~/models/Flow/utils/utils.ts'
import apiList from '~/apis/ApiList.js'

const { debounce } = pkg

export default {
	name: 'FlowFilters',
	components: {
		CustomDropdown,
		Pagination,
	},
	props: {
		search: {
			type: String,
			default: '',
		},
		postIds: {
			type: Array,
			default: () => [],
		},
		triggerTypeKeys: {
			type: Array,
			default: () => [],
		},
		sortBy: {
			type: String,
			default: '',
		},
		sortDirection: {
			type: String,
			default: 'desc',
		},
	},
	emits: ['update:search', 'update:postIds', 'update:triggerTypeKeys', 'update:sortBy', 'update:sortDirection'],
	setup() {
		return {
			chatAccountStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			searchValue: this.search,
			selectedPostIds: [...this.postIds],
			selectedTriggerTypes: [...this.triggerTypeKeys],
			selectedSortBy: this.sortBy,
			selectedSortDirection: this.sortDirection,
			debouncedEmitSearch: null,
			flatSortOptions: [
				{ key: 'runs', direction: 'desc', label: 'runsDesc' },
				{ key: 'runs', direction: 'asc', label: 'runsAsc' },
				{ key: 'uniqueContacts', direction: 'desc', label: 'uniqueContactsDesc' },
				{ key: 'uniqueContacts', direction: 'asc', label: 'uniqueContactsAsc' },
				{ key: 'createdAt', direction: 'desc', label: 'createdAtDesc' },
				{ key: 'createdAt', direction: 'asc', label: 'createdAtAsc' },
			],
			availableTriggerTypes: [
				{ key: triggerTypes.commentOnPost.key, icon: 'fa fa-comment' },
				{ key: triggerTypes.receivedDM.key, icon: 'fa fa-envelope' },
				{ key: triggerTypes.storyMention.key, icon: 'fa fa-at' },
				{ key: triggerTypes.replyToStory.key, icon: 'fa fa-reply' },
				{ key: triggerTypes.commentOnLive.key, icon: 'fa fa-video' },
			],
			posts: [],
			postsLoading: false,
			postsCurrentPage: 0,
			postsHasMore: true,
		}
	},
	computed: {
		activeAccount() {
			return this.chatAccountStore.active
		},
		sortLabel() {
			const option = this.flatSortOptions.find(
				(o) => o.key === this.selectedSortBy && o.direction === this.selectedSortDirection,
			)
			return option ? this.$t(`pages.app.flows.filters.sortLabels.${option.label}`) : ''
		},
		selectedPostPreviews() {
			return this.selectedPostIds.map((id) => this.posts.find((p) => String(p.id) === String(id))).filter(Boolean)
		},
	},
	watch: {
		search(newVal) {
			this.searchValue = newVal
		},
		postIds: {
			handler(newVal) {
				this.selectedPostIds = [...newVal]
			},
			deep: true,
		},
		triggerTypeKeys: {
			handler(newVal) {
				this.selectedTriggerTypes = [...newVal]
			},
			deep: true,
		},
		sortBy(newVal) {
			this.selectedSortBy = newVal
		},
		sortDirection(newVal) {
			this.selectedSortDirection = newVal
		},
		'activeAccount.id'() {
			this.posts = []
			this.postsCurrentPage = 0
			this.postsHasMore = true
		},
	},
	created() {
		this.debouncedEmitSearch = debounce(() => {
			this.$emit('update:search', this.searchValue)
		}, 300)
	},
	methods: {
		clearSearch() {
			this.searchValue = ''
			this.$emit('update:search', '')
		},
		onPostDropdownShow() {
			if (this.posts.length === 0) {
				this.fetchPosts(true)
			}
		},
		async fetchPosts(restart = false, page = 1) {
			if (restart) {
				this.posts = []
				this.postsCurrentPage = 0
			}

			this.postsLoading = true

			await this.$requestAdapter
				.get(apiList.chat.posts.get, {
					query: {
						chatAccountId: this.activeAccount?.id,
						page,
					},
				})
				.then((response) => {
					const newPosts = response.data.data
					newPosts.forEach((post) => {
						if (!this.posts.some((p) => p.id === post.id)) {
							this.posts.push(post)
						}
					})
					this.postsCurrentPage = response.data.current_page
					this.postsHasMore = !!response.data.next_page_url
				})
				.catch((error) => {
					console.error('Posts fetch error:', error)
				})
				.finally(() => {
					this.postsLoading = false
				})
		},
		isSelectedPost(postId) {
			return this.selectedPostIds.some((id) => String(id) === String(postId))
		},
		togglePostFilter(post) {
			const index = this.selectedPostIds.findIndex((id) => String(id) === String(post.id))
			if (index === -1) {
				this.selectedPostIds.push(post.id)
			} else {
				this.selectedPostIds.splice(index, 1)
			}
			this.$emit('update:postIds', [...this.selectedPostIds])
		},
		clearPostFilter() {
			this.selectedPostIds = []
			this.$emit('update:postIds', [])
		},
		loadMorePosts(page) {
			this.fetchPosts(false, page)
		},
		isSelectedTriggerType(key) {
			return this.selectedTriggerTypes.includes(key)
		},
		toggleTriggerType(key) {
			const index = this.selectedTriggerTypes.indexOf(key)
			if (index === -1) {
				this.selectedTriggerTypes.push(key)
			} else {
				this.selectedTriggerTypes.splice(index, 1)
			}
			this.$emit('update:triggerTypeKeys', [...this.selectedTriggerTypes])
		},
		clearTriggerTypes() {
			this.selectedTriggerTypes = []
			this.$emit('update:triggerTypeKeys', [])
		},
		selectSort(key, direction) {
			if (this.selectedSortBy === key && this.selectedSortDirection === direction) {
				this.clearSort()
				return
			}
			this.selectedSortBy = key
			this.selectedSortDirection = direction
			this.$emit('update:sortBy', this.selectedSortBy)
			this.$emit('update:sortDirection', this.selectedSortDirection)
			this.$refs.sortingDropdown.hide()
		},
		clearSort() {
			this.selectedSortBy = ''
			this.selectedSortDirection = 'desc'
			this.$emit('update:sortBy', '')
			this.$emit('update:sortDirection', 'desc')
			this.$refs.sortingDropdown.hide()
		},
	},
}
</script>
