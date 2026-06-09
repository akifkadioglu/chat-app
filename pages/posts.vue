<template>
	<AppLayout sidebarTrailingWidthClasses="w-4/5 max-w-80 lg:min-w-80 border-r border-subtle">
		<template #contentHeader>
			<div class="flex items-center justify-between w-full px-2">
				<span class="text-lg">
					{{ $t('pages.app.posts.title') }}
				</span>
				<button class="btn btn-primary btn-soft" @click="refetchPosts">
					<i class="fa fa-refresh sm:mr-1" />
					<span class="hidden sm:block">
						{{ $t('pages.app.posts.fetchPosts') }}
					</span>
				</button>
			</div>
		</template>
		<div class="pt-5 pb-10 px-4" :key="chatAccount?.id">
			<State
				:isLoading="firstLoading"
				:isEmpty="postsStore.currentPage > 0 && postsStore.posts.length === 0"
				:emptyTitle="$t('pages.app.posts.emptyTitle')"
			>
				<Posts
					:posts="postsStore.posts"
					class="grid! grid-cols-[repeat(auto-fill,minmax(15rem,15rem))]! justify-center!"
					postWidth="w-full"
				/>
				<Pagination
					infinite-scroll
					:loading="postsStore.loading"
					:current-page="postsStore.currentPage"
					:has-more="postsStore.hasMore"
					@page-change="postsStore.fetchPosts($event)"
				/>
			</State>
		</div>
	</AppLayout>
</template>
<script>
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import ChatAccountSidebar from '~/components/Accounts/ChatAccountSidebar.vue'
import Posts from '~/components/Accounts/Posts/Posts.vue'
import State from '~/components/GlobalComponents/State.vue'

export default {
	components: { State, Posts, ChatAccountSidebar, Pagination },
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})
		return {
			chatAccountsStore: useChatAccountsStore(),
			postsStore: usePostsStore(),
		}
	},
	data() {
		return {
			firstLoading: true,
			posts: [],
			postsLoading: false,
		}
	},
	computed: {
		chatAccount() {
			return this.chatAccountsStore.active
		},
	},
	watch: {
		'chatAccount.id'() {
			this.$nextTick(() => {
				this.fetchPosts()
			})
		},
	},
	mounted() {
		this.postsStore.resetCurrentSlice()
		this.firstLoading = true
		this.fetchPosts()
	},
	methods: {
		refetchPosts() {
			this.postsStore.resetCurrentSlice()
			this.firstLoading = true
			this.fetchPosts()
		},
		fetchPosts() {
			this.postsStore.fetchPosts(1).finally(() => {
				this.firstLoading = false
			})
		},
	},
}
</script>

<style scoped></style>
