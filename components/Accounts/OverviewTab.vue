<template>
	<div class="bs container space-y-20" :key="chatAccountsStore.activeId">
		<div class="max-w-2xl mx-auto">
			<!-- Profil Bilgileri -->
			<ProfileInformation :account="chatAccountsStore.active" />

			<!-- Yatay Tab Menüsü -->
			<ul class="flex gap-6 mt-6 pt-6 border-t border-base-300 overflow-x-auto">
				<li v-for="tab in menuTabs" :key="tab.key">
					<localized-link
						name="account-tab"
						:params="{ tab: tab.key }"
						class="link link-hover text-muted flex items-center gap-1 underline decoration-1"
					>
						<i :class="tab.iconClass" />
						<span>{{ $t(`components.accounts.chatAccountSidebar.tabs.${tab.key}`) }}</span>
					</localized-link>
				</li>
			</ul>
		</div>
		<div class="max-w-2xl mx-auto">
			<OverviewFlows class="max-w-lg" />
		</div>
		<div>
			<div class="max-w-2xl mx-auto mb-2 px-4">
				<h2 class="text-2xl font-semibold">
					{{ $t('components.accounts.overviewTab.postsSection.title') }}
				</h2>
				<p class="text-sm text-muted mt-1">
					{{ $t('components.accounts.overviewTab.postsSection.description') }}
				</p>
			</div>

			<div class="overflow-x-auto w-full">
				<State
					:isLoading="postsStore.loading"
					:isEmpty="postsStore.posts.length === 0"
					:emptyTitle="$t('components.accounts.overviewTab.emptyPosts')"
				>
					<Posts :posts="postsStore.posts" :maxPostLength="maxPostsPreview" class="flex-nowrap w-max">
						<template #last v-if="!postsStore.loading && postsStore.posts.length >= maxPostsPreview">
							<div class="card rounded-lg w-72 bg-base-100 border border-dashed border-base-300">
								<div class="card-body gap-3 items-center">
									<div class="text-lg font-semibold text-center">
										{{ $t('components.accounts.posts.moreTitle') }}
									</div>
									<p class="text-sm text-muted">
										{{ $t('components.accounts.posts.moreDescription') }}
									</p>
									<localized-link name="posts" class="btn btn-soft btn-primary btn-transition w-full">
										{{ $t('components.accounts.posts.viewAllPosts') }}
									</localized-link>
								</div>
							</div>
						</template>
					</Posts>
				</State>
			</div>
		</div>

		<div class="max-w-2xl mx-auto">
			<Steps
				v-if="showSteps"
				:isLoading="isLoading"
				:publishFirstFlowCompleted="publishFirstFlowCompleted"
				:conversationCompleted="conversationCompleted"
				:commentOurPostCompleted="commentOurPostCompleted"
				:getFirstCommentCompleted="getFirstCommentCompleted"
			/>
		</div>

		<div>
			<FlowsOverview :key="chatAccountsStore.active?.id" />
		</div>
	</div>
</template>

<script>
import FlowsOverview from '~/components/Accounts/OverviewTab/FlowsOverview.vue'
import OverviewFlows from '~/components/Accounts/OverviewTab/OverviewFlows.vue'
import ProfileInformation from '~/components/Accounts/OverviewTab/ProfileInformation.vue'
import Steps from '~/components/Accounts/OverviewTab/Steps.vue'
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { TABS } from '~/models/ChatAccount'
import Posts from '~/components/Accounts/Posts/Posts.vue'
import State from '~/components/GlobalComponents/State.vue'

export default {
	components: {
		OverviewFlows,
		State,
		Posts,
		LocalizedLink,
		LoadingElement,
		Steps,
		FlowsOverview,
		ProfileInformation,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			postsStore: usePostsStore(),
		}
	},
	data() {
		return {
			TABS,
			maxPostsPreview: 5,
			showSteps: true,
			publishFirstFlowCompleted: false,
			conversationCompleted: false,
			commentOurPostCompleted: false,
			getFirstCommentCompleted: false,
			isLoading: true,
			postsLength: 0,
		}
	},
	computed: {
		menuTabs() {
			return [TABS.settings, TABS.attributes, TABS.billing, TABS.activities]
		},
	},
	mounted() {
		this.fetchOnboardingData()
		this.postsStore.fetchPosts()
	},
	methods: {
		fetchOnboardingData() {
			this.isLoading = true
			this.$requestAdapter
				.get(apiList.chat.instagram.chatAccountId.onboarding, {
					chatAccountId: this.chatAccountsStore.active.id,
				})
				.then((response) => {
					this.publishFirstFlowCompleted = response.data.published_flows_count >= 1
					this.getFirstCommentCompleted = response.data.comments_count >= 1
					this.conversationCompleted = response.data.conversations_count >= 1
					this.commentOurPostCompleted = !!response.data.commented_our_posts

					this.showSteps = !(
						this.publishFirstFlowCompleted &&
						this.getFirstCommentCompleted &&
						this.conversationCompleted &&
						this.commentOurPostCompleted
					)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
}
</script>
