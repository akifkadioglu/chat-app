<template>
	<div class="h-full flex flex-col w-full bg-base-100 truncate min-w-64 relative">
		<div
			v-if="isFlushing"
			class="absolute inset-0 z-20 flex items-center justify-center bg-base-300/50"
		>
			<LoadingElement :is-loading="true" size="32" />
		</div>
		<div class="min-w-0 px-4 h-15 flex items-center justify-between" v-auto-animate>
			<div v-auto-animate class="w-full mb-1">
				<div v-if="showFilterBar" class="p-2 relative w-full">
					<div class="flex items-center gap-2">
						<i v-if="showFilterBar" class="fa fa-arrow-left cursor-pointer" @click="showFilterBar = false" />
						<input
							ref="searchInput"
							@input="debouncedFetchConversations"
							v-model="searchQuery"
							class="input w-full"
							:placeholder="$t('components.chat.sidebar.conversationList.searchPlaceholder')"
						/>
					</div>
					<i
						v-if="searchQuery"
						@click="clearSearchQuery"
						class="fa fa-xmark absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-1"
					/>
				</div>
				<h3 v-else class="text-base sm:text-lg text-base-content truncate">
					<!--					<i v-if="searchQuery" class="fa fa-magnifying-glass text-subtle" />-->
					{{ searchQuery || $t('components.chat.sidebar.conversationList.title') }}
				</h3>
			</div>
			<i v-if="!showFilterBar" class="fa fa-magnifying-glass cursor-pointer" @click="showFilterBar = true" />

			<!--			<i class="fa fa-filter cursor-pointer" @click="showFilterBar = !showFilterBar" />-->

			<!--			<i v-if="!showFilterBar" class="fa fa-filter cursor-pointer" @click="openFilterBar" />-->
			<!--			<SelectedAccount />-->
		</div>
		<div v-auto-animate>
			<!--			<div v-if="showFilterBar" class="p-5 pt-0 space-y-3">-->
			<!--				&lt;!&ndash; Search &ndash;&gt;-->
			<!--				<div class="relative">-->
			<!--					<input-->
			<!--						ref="searchInput"-->
			<!--						@input="debouncedFetchConversations"-->
			<!--						v-model="searchQuery"-->
			<!--						class="input input-sm w-full pr-8"-->
			<!--						:placeholder="$t('components.chat.sidebar.conversationList.searchPlaceholder')"-->
			<!--					/>-->
			<!--					<i-->
			<!--						v-if="searchQuery"-->
			<!--						@click="clearSearchQuery"-->
			<!--						class="fa fa-xmark absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-1 text-muted hover:text-base-content"-->
			<!--					/>-->
			<!--				</div>-->
			<!--				&lt;!&ndash; Assignee Filter &ndash;&gt;-->
			<!--				<div v-if="teamUsers.length > 0">-->
			<!--					<label class="label text-xs text-muted pb-1">-->
			<!--						{{ $t('components.chat.sidebar.conversationList.assigneeFilter') }}-->
			<!--					</label>-->
			<!--					<div class="flex items-center gap-1">-->
			<!--						<TeamUsersDropdown-->
			<!--							class="w-full"-->
			<!--							:selectedAssignedUserId="selectedAssignedUserId"-->
			<!--							@change="onAssigneeChange"-->
			<!--						/>-->
			<!--						<button-->
			<!--							v-if="selectedAssignedUserId !== null"-->
			<!--							@click="onAssigneeChange(null)"-->
			<!--							class="btn btn-sm btn-ghost btn-square text-error"-->
			<!--						>-->
			<!--							<i class="fa fa-xmark" />-->
			<!--						</button>-->
			<!--					</div>-->
			<!--				</div>-->
			<!--			</div>-->
			<div class="pb-1 flex justify-center -mt-1">
				<div role="tablist" class="tabs tabs-box tabs-xs w-auto">
					<button role="tab" class="tab" :class="{ 'tab-active': activeFilter === 'all' }" @click="setFilter('all')">
						{{ $t('components.chat.sidebar.conversationList.filters.all') }}
					</button>
					<button
						role="tab"
						class="tab"
						:class="{ 'tab-active': activeFilter === 'unread' }"
						@click="setFilter('unread')"
					>
						{{ $t('components.chat.sidebar.conversationList.filters.unread') }}
					</button>
				</div>
			</div>
			<div v-if="teamStore.team?.id">
				<label class="text-xs px-2">
					<input
						type="checkbox"
						class="checkbox checkbox-xs"
						:checked="selectedAssignedUserId == authStore.user?.id"
						@change="toggleAssignedToMe($event.target.checked)"
					/>
					<span>{{ $t('components.chat.sidebar.conversationList.assignedToMe') }}</span>
				</label>
			</div>
			<div v-if="devTestScenarioStore.getScenariosVisible()" class="flex gap-1 px-2 py-1 border-b border-base-200">
				<input v-model.number="simCount" type="number" min="1" class="input input-xs flex-1" placeholder="Adet" />
				<button class="btn btn-xs btn-warning" @click="simulateNewConversations">Yeni conversation ekle</button>
			</div>
			<button
				@click="loadPendingConversations"
				v-if="pendingNewConversationCount > 0"
				class="bg-primary text-primary-content px-2 py-1 text-xs flex justify-center w-full"
			>
				<i18n-t keypath="components.chat.sidebar.conversationList.newConversations" tag="span">
					<template #count>{{ pendingNewConversationCount }}</template>
				</i18n-t>
			</button>
		</div>
		<div v-if="currentScopeSlice" class="flex-1 overflow-y-auto overflow-x-hidden">
			<State :is-loading="pageLoading">
				<ul class="menu w-full bg-base-100 truncate" v-auto-animate="autoAnimateOptions">
					<DynamicScroller :key="currentScopeKey" :items="conversations" :min-item-size="60" key-field="uuid">
						<template #default="{ item, index, active }">
							<DynamicScrollerItem :key="item.uuid" :item="item" :active="active" :data-index="index">
								<ConversationListItem
									:key="item.uuid"
									:conversation="item"
									class="border-2 border-transparent rounded-lg"
									:class="{
										'bg-subtle': dragOverConversation === item.uuid,
									}"
									@conversationSelected="conversationSelected"
									@dragover.prevent="handleDragOver($event, item)"
									@dragleave="handleDragLeave($event, item)"
									@drop.prevent="handleDrop($event, item)"
								/>
							</DynamicScrollerItem>
						</template>

						<template #after>
							<Pagination
								:current-page="currentScopeSlice.currentPage"
								:has-more="currentScopeSlice.hasMore"
								:loading="currentScopeSlice.loading"
								:infinite-scroll="true"
								@page-change="getConversations"
							/>
						</template>
					</DynamicScroller>
				</ul>

				<!--				<template #error>-->
				<!--					<StateElement-->
				<!--						:title="$t('components.chat.sidebar.conversationList.errorState.title')"-->
				<!--						:content="$t('components.chat.sidebar.conversationList.errorState.message')"-->
				<!--					>-->
				<!--						<template #icon>-->
				<!--							<i class="fa fa-exclamation-triangle text-2xl" />-->
				<!--						</template>-->
				<!--						<template #buttons>-->
				<!--							<button :disabled="isLoading" @click="getConversations" class="btn btn-primary">-->
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
import ConversationListItem from '~/components/Chat/Sidebar/ConversationListItem.vue'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import SelectedAccount from '~/components/Chat/Sidebar/SelectedAccount.vue'
import { ChatAccount } from '~/models/ChatAccount.js'
import { Conversation } from '~/models/Conversation/Conversation.js'
import State from '~/components/GlobalComponents/State.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import debounce from 'lodash/debounce'
import { SLICE_KEYS } from '~/stores/conversations'
import TeamUsersDropdown from '~/components/Chat/Sidebar/TeamUsersDropdown.vue'

const STALE_AFTER_MS = 15 * 60_000

export default {
	props: {
		propsSelectedConversation: {
			type: Conversation,
			default: null,
		},
		selectedAccount: {
			type: ChatAccount,
			default: null,
		},
	},
	components: {
		TeamUsersDropdown,
		DynamicScrollerItem,
		DynamicScroller,
		LoadingElement,
		State,
		StateElement,
		ConversationListItem,
		SelectedAccount,
		Pagination,
	},
	setup() {
		return {
			conversationsStore: useConversationsStore(),
			localeRoute: useLocaleRoute(),
			chatAccountsStore: useChatAccountsStore(),
			authStore: useAuthStore(),
			teamStore: useTeamStore(),
			devTestScenarioStore: useDevTestScenarioStore(),
		}
	},
	mounted() {
		this.initFiltersFromQuery()
		if (this.currentScopeKey !== SLICE_KEYS.ALL) {
			this.conversationsStore.fetchConversations(SLICE_KEYS.ALL, 0, '').finally(() => {})
		}
		this.getConversations()
		this.$emitter.on('getConversations', this.getConversations)
		this.selectedAssignedUserId = this.$route.query.assignee
		document.addEventListener('visibilitychange', this.handleVisibilityChange)
	},
	data() {
		return {
			pageLoading: true,
			isLoading: false,
			searchQuery: '',
			showFilterBar: false,
			dragOverConversation: null,
			dragOverTimeout: null,
			activeFilter: 'all',
			selectedAssignedUserId: null,
			hiddenAt: null,
			simCount: 5,
			isFlushing: false,
		}
	},
	computed: {
		currentScopeKey() {
			return this.conversationsStore.currentScopeKey
		},
		currentScopeSlice() {
			return this.conversationsStore.currentScopeSlice
		},
		conversations() {
			return this.conversationsStore.conversationsForScope(
				this.currentScopeKey,
				this.searchQuery,
				this.selectedAssignedUserId,
			)
		},
		// teamUsers() {
		// 	return this.teamStore.teamMembers
		// },
		autoAnimateOptions() {
			if (this.isFlushing) return { duration: 0 }
			return {}
		},
		pendingNewConversationCount() {
			return Object.keys(this.conversationsStore.pendingConversations).length
		},
	},
	methods: {
		async getConversations(page = 1) {
			this.isLoading = true
			const unreadOnly = this.activeFilter === 'unread'
			await this.conversationsStore
				.fetchConversations(
					this.currentScopeKey,
					page,
					this.searchQuery.trim(),
					unreadOnly,
					this.selectedAssignedUserId,
				)
				.finally(() => {
					this.isLoading = false
				})
			this.pageLoading = false
		},
		setFilter(filter) {
			if (this.activeFilter === filter) return
			this.activeFilter = filter
			this.updateQueryParams()
			this.pageLoading = true
			this.getConversations(1)
		},
		toggleAssignedToMe(checked) {
			this.onAssigneeChange(checked ? this.authStore.user?.id : null)
		},
		onAssigneeChange(userId) {
			this.selectedAssignedUserId = userId
			this.updateQueryParams()
			this.pageLoading = true
			this.getConversations(1)
		},
		initFiltersFromQuery() {
			const { filter, assignee, q } = this.$route.query
			if (filter && ['all', 'unread'].includes(filter)) {
				this.activeFilter = filter
			}
			if (assignee) {
				this.selectedAssignedUserId = assignee
			}
			if (q) {
				this.searchQuery = q
			}
		},
		updateQueryParams() {
			this.$router.replace({
				query: {
					...this.$route.query,
					filter: this.activeFilter !== 'all' ? this.activeFilter : undefined,
					assignee: this.selectedAssignedUserId || undefined,
					q: this.searchQuery.trim() || undefined,
				},
			})
		},
		conversationSelected() {
			this.$emitter.emit('hideLeadingDrawer')
		},
		loadPendingConversations() {
			this.isFlushing = true
			this.conversationsStore.flushPendingConversations().finally(() => {
				this.isFlushing = false
			})
		},
		simulateNewConversations() {
			const count = Number(this.simCount) || 1
			const chatAccountId = this.chatAccountsStore.active?.id ?? this.chatAccountsStore.all?.[0]?.id ?? null
			if (!chatAccountId) {
				this.$toast?.error?.('Aktif chat account yok')
				return
			}
			const base = Date.now()
			for (let i = 0; i < count; i++) {
				const id = base + i
				const fake = {
					id,
					chat_account_id: chatAccountId,
					status: 1,
					assigned_user_id: null,
					last_message_at: new Date(base + i).toISOString(),
					last_message: {
						id: id * 10,
						content: { text: `Simüle mesaj #${i + 1}` },
						direction: 'incoming',
						created_at: new Date(base + i).toISOString(),
					},
					pinned_at: null,
					contact: {
						id: `sim-contact-${id}`,
						name: `Sim Kullanıcı ${i + 1}`,
						platform_accounts_instagram: { username: `sim_${i + 1}`, is_verified: false },
					},
				}
				this.conversationsStore.intakeNewConversation(fake)
			}
		},
		handleVisibilityChange() {
			if (document.visibilityState === 'hidden') {
				this.hiddenAt = Date.now()
			} else {
				this.checkStaleAndRefresh()
			}
		},
		checkStaleAndRefresh() {
			if (this.hiddenAt === null) return
			const elapsed = Date.now() - this.hiddenAt
			this.hiddenAt = null
			if (elapsed < STALE_AFTER_MS) return
			this.conversationsStore.refreshActiveScope()
		},
		getChatAccounts() {
			this.$emitter.emit('getChatAccounts')
		},
		debouncedFetchConversations: debounce(function () {
			this.updateQueryParams()
			return this.getConversations()
		}, 500),
		// openFilterBar() {
		// 	this.showFilterBar = true
		// 	this.$nextTick(() => {
		// 		this.$refs.searchInput.focus()
		// 	})
		// },
		// closeSearchBar() {
		// 	this.showFilterBar = false
		// 	this.searchQuery = ''
		// 	this.debouncedFetchConversations()
		// },
		clearSearchQuery() {
			this.searchQuery = ''
			this.debouncedFetchConversations()
			this.$nextTick(() => {
				this.$refs.searchInput.focus()
			})
		},
		handleDragOver(event, conversation) {
			// Dosya drag edildiğinde conversation'u aç
			if (event.dataTransfer && event.dataTransfer.types.includes('Files')) {
				// Visual feedback için hemen set et
				this.dragOverConversation = conversation.uuid

				// Önceki timeout'u temizle
				if (this.dragOverTimeout) {
					clearTimeout(this.dragOverTimeout)
				}

				// Sadece farklı conversation ise aç
				if (this.$route.query.c !== conversation.contact?.id?.toString()) {
					this.$router.push(
						this.localeRoute({
							name: 'chat',
							query: { c: conversation.contact?.id },
						}),
					)
				}
			}
		},
		handleDragLeave(event, conversation) {
			// Drag leave olduğunda timeout'u iptal et ve visual feedback'i temizle
			if (this.dragOverTimeout) {
				clearTimeout(this.dragOverTimeout)
				this.dragOverTimeout = null
			}

			setTimeout(() => {
				if (this.dragOverConversation === conversation.uuid) {
					this.dragOverConversation = null
				}
			}, 100)
		},
		handleDrop(event, conversation) {
			// Drop olduğunda visual feedback'i temizle
			this.dragOverConversation = null
		},
	},
	beforeUnmount() {
		this.$emitter.off('getConversations', this.getConversations)
		if (this.dragOverTimeout) {
			clearTimeout(this.dragOverTimeout)
		}
		document.removeEventListener('visibilitychange', this.handleVisibilityChange)
	},
}
</script>
