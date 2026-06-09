<template>
	<AppLayout>
		<!-- Main Content -->
		<template #contentHeader>
			<div class="flex justify-between w-full flex-1 h-16 py-2 items-center">
				<!--<div>-->
				<h3 class="text-xl">{{ $t('pages.app.flows.title') }}</h3>
				<CreateFlowButton class="btn-sm" />
			</div>
		</template>
		<!-- Filters -->
		<div class="max-w-5xl mx-auto w-full pt-10 pb-3 xl:px-0 px-5">
			<FlowFilters
				:search="search"
				:post-ids="postIds"
				:trigger-type-keys="triggerTypeKeys"
				:sort-by="sortBy"
				:sort-direction="sortDirection"
				@update:search="onSearchChange"
				@update:post-ids="onPostIdsChange"
				@update:trigger-type-keys="onTriggerTypeKeysChange"
				@update:sort-by="onSortByChange"
				@update:sort-direction="onSortDirectionChange"
			/>
		</div>

		<div
			:class="{
				'my-auto ': loading || flows.length === 0,
			}"
		>
			<State
				:is-loading="loading && currentPage === 0"
				:is-empty="flows.length === 0"
				:empty-title="$t('pages.app.flows.emptyState.title')"
			>
				<div class="mb-8 px-5">
					<!-- Container with padding -->
					<div class="max-w-5xl mx-auto pb-10">
						<!-- Table Headers -->
						<div class="hidden md:flex items-center justify-between px-5">
							<div class="flex-1"></div>
							<div class="flex items-center gap-6 text-xs text-muted">
								<div class="w-16 text-center">{{ $t('pages.app.flows.table.headers.runs') }}</div>
								<div class="w-20 text-center">{{ $t('pages.app.flows.table.headers.uniqueContacts') }}</div>
								<div class="w-8"></div>
								<!-- Actions column -->
							</div>
						</div>

						<!-- Flow Cards -->
						<DynamicScroller :items="flows" :min-item-size="240" key-field="id" v-auto-animate>
							<template #default="{ item, index, active }">
								<DynamicScrollerItem :key="item.id" :item="item" :active="active" :data-index="index" class="py-3">
									<FlowCard
										:key="item.id"
										:flow="item"
										:stats="flowStats[item.id]"
										:stats-loading="statsLoading"
										@duplicate="handleDuplicate"
										@deleteFlow="deleteFlow"
										@view-analytics="handleViewAnalytics"
									/>
								</DynamicScrollerItem>
							</template>
						</DynamicScroller>
					</div>
				</div>
				<Pagination
					:currentPage="currentPage"
					:hasMore="hasMore"
					:loading="loading"
					:infinite-scroll="true"
					@page-change="goToPage"
				/>
				<template #emptyImg>
					<img v-img-error src="/images/icon.png" alt="simpliers chat" class="w-48 opacity-10" />
				</template>
				<template #emptyContent>
					<p class="text-muted mb-6">
						<i18n-t v-if="activeAccount?.postAccount" keypath="pages.app.flows.emptyState.description">
							<template #username>
								<span class="font-medium">{{ activeAccount.postAccount.username }}</span>
							</template>
						</i18n-t>
						<span v-else>{{ $t('pages.app.flows.emptyState.descriptionGeneral') }}</span>
					</p>

					<CreateFlowButton :title="$t('pages.app.flows.emptyState.createFirstFlowButton')" />
				</template>
			</State>
		</div>
	</AppLayout>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import AccountSelector from '~/components/Chat/Sidebar/AccountSelector.vue'
import FlowCard from '~/components/Flow/FlowCard.vue'
import FlowFilters from '~/components/Flow/FlowFilters.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import SelectedAccount from '~/components/Chat/Sidebar/SelectedAccount.vue'
import State from '~/components/GlobalComponents/State.vue'
import CreateFlowButton from '~/components/Flow/CreateFlowButton.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import pkg from 'lodash'

const { debounce } = pkg

export default {
	components: {
		DynamicScroller,
		DynamicScrollerItem,
		CreateFlowButton,
		State,
		SelectedAccount,
		LocalizedLink,
		AccountSelector,
		FlowCard,
		FlowFilters,
		Pagination,
	},
	setup() {
		definePageMeta({
			layout: 'app',
			middleware: ['auth-custom'],
		})

		return {
			chatAccountStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			loading: false,
			statsLoading: false,
			flows: [],
			flowStats: {},
			statusFilter: '',
			currentPage: 0,
			hasMore: false,
			search: '',
			postIds: [],
			triggerTypeKeys: [],
			sortBy: '',
			sortDirection: 'desc',
		}
	},
	created() {
		this.loadFiltersFromRoute()
	},
	computed: {
		activeAccount() {
			return this.chatAccountStore.active
		},
	},
	watch: {
		'$route.query': {
			handler() {
				this.loadFiltersFromRoute()
			},
			deep: true,
		},
		activeAccount: {
			handler(newVal, oldVal) {
				if (newVal?.id !== oldVal?.id) {
					this.search = ''
					this.postIds = []
					this.triggerTypeKeys = []
					this.sortBy = ''
					this.sortDirection = 'desc'
					this.updateRouteQuery()
					this.resetAndFetch()
				}
			},
			immediate: false,
		},
	},
	mounted() {
		this.getAllFlows()
	},
	methods: {
		resetAndFetch() {
			this.flows = []
			this.flowStats = {}
			this.currentPage = 0
			this.hasMore = false
			this.getAllFlows(1)
		},
		debouncedResetAndFetch: debounce(function () {
			this.resetAndFetch()
		}, 400),
		async getAllFlows(page = 1) {
			this.loading = true

			// Backend'den tek istekte tüm flows'ları al
			await this.$requestAdapter
				.post(apiList.chat.flow.flows, {
					page,
					chatAccountId: this.activeAccount?.id || null,
					search: this.search,
					postIds: this.postIds,
					triggerTypeKeys: this.triggerTypeKeys,
					sortBy: this.sortBy || undefined,
					sortDirection: this.sortBy ? this.sortDirection : undefined,
				})
				.then((response) => {
					this.currentPage = response.data.current_page
					this.hasMore = !!response.data.next_page_url

					// Flow objelerine dönüştür
					const newFlows = response.data.data.map((flow) => {
						flow.triggers =
							flow.last_flow_version?.graph?.nodes.find((n) => n.type?.key === nodeTypes.trigger?.key)?.triggers ?? []
						const commentTrigger = flow.triggers.find((t) => t.type.key === triggerTypes.commentOnPost.key)
						if (commentTrigger) {
							commentTrigger.selectedPosts = flow.last_flow_version.selectedPosts
						}
						return new Flow(flow, this.$t)
					})

					this.flows = [...this.flows, ...newFlows]

					// sortBy runs veya uniqueContacts ise backend zaten stats dahil ediyor
					const sortIncludesStats = this.sortBy === 'runs' || this.sortBy === 'uniqueContacts'
					if (!sortIncludesStats) {
						const newFlowIds = newFlows.map((f) => f.id)
						this.fetchFlowStats(newFlowIds)
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		fetchFlowStats(flowIds) {
			if (!flowIds.length) return
			this.statsLoading = true
			this.$requestAdapter
				.post(apiList.chat.flow.flowStats, { flowIds })
				.then((response) => {
					this.flowStats = { ...this.flowStats, ...(response.data || {}) }
				})
				.catch(() => {})
				.finally(() => {
					this.statsLoading = false
				})
		},
		duplicateFlow(flow) {
			// TODO: Implement flow duplication
			this.$toast.info(this.$t('pages.app.flows.notifications.duplicateFeatureComingSoon'))
		},
		deleteFlow(flow) {
			const index = this.flows.findIndex((f) => f.id === flow.id)
			consoleLog(index)
			if (index > -1) {
				this.flows.splice(index, 1)
				consoleLog('deleted')
			}
		},
		viewAnalytics(flow) {
			// TODO: Implement analytics view
			this.$toast.info(this.$t('pages.app.flows.notifications.analyticsFeatureComingSoon'))
		},
		// FlowCard event handlers
		handleDuplicate(flow) {
			this.duplicateFlow(flow)
		},
		handleViewAnalytics(flow) {
			this.viewAnalytics(flow)
		},
		// Pagination methods
		goToPage(page) {
			this.getAllFlows(page)
		},
		// Filter methods
		onSearchChange(value) {
			this.search = value
			this.updateRouteQuery()
			this.debouncedResetAndFetch()
		},
		onPostIdsChange(value) {
			this.postIds = value
			this.updateRouteQuery()
			this.debouncedResetAndFetch()
		},
		onTriggerTypeKeysChange(value) {
			this.triggerTypeKeys = value
			this.updateRouteQuery()
			this.debouncedResetAndFetch()
		},
		onSortByChange(value) {
			this.sortBy = value
			this.updateRouteQuery()
			this.debouncedResetAndFetch()
		},
		onSortDirectionChange(value) {
			this.sortDirection = value
			this.updateRouteQuery()
			this.debouncedResetAndFetch()
		},
		updateRouteQuery() {
			const query = {}

			const username = this.activeAccount?.postAccount?.username
			if (username) query.username = username
			if (this.search) query.search = this.search
			if (this.postIds.length > 0) query.postIds = this.postIds.join(',')
			if (this.triggerTypeKeys.length > 0) query.triggerTypeKeys = this.triggerTypeKeys.join(',')
			if (this.sortBy) query.sortBy = this.sortBy
			if (this.sortBy) query.sortDirection = this.sortDirection

			this.$router.push({ query })
		},
		loadFiltersFromRoute() {
			const query = this.$route?.query || {}
			this.search = query.search || ''
			this.postIds = query.postIds ? query.postIds.split(',') : []
			this.triggerTypeKeys = query.triggerTypeKeys ? query.triggerTypeKeys.split(',') : []
			this.sortBy = query.sortBy || ''
			this.sortDirection = query.sortDirection || 'desc'
		},
	},
}
</script>
