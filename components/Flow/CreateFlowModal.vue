<template>
	<Modal ref="modal" size="max-w-5xl">
		<div class="mb-2">
			<div class="flex items-baseline justify-between gap-2 pr-10">
				<div class="md:block" :class="{ hidden: showMobileSearch }">
					<div class="text-lg text-base-content">{{ $t('components.flow.createFlowModal.title') }}</div>
					<div class="text-muted text-xs md:text-sm">{{ $t('components.flow.createFlowModal.subtitle') }}</div>
				</div>

				<div class="flex items-center gap-2" :class="showMobileSearch ? 'w-full md:w-64' : 'w-auto md:w-64'">
					<!-- Mobile back button - sadece mobile search açıkken -->
					<span class="md:hidden">
						<i v-if="showMobileSearch" class="fa fa-arrow-left cursor-pointer" @click="closeSearch" />

						<i v-if="!showMobileSearch" class="fa fa-magnifying-glass fa-lg cursor-pointer" @click="openSearch" />
					</span>

					<input
						ref="searchInput"
						v-model="searchQuery"
						:placeholder="$t('components.flow.createFlowModal.searchPlaceholder')"
						:class="['input', showMobileSearch ? 'flex-1 md:w-64' : 'hidden md:block md:w-64']"
					/>
				</div>
			</div>
		</div>

		<div class="w-fit ml-auto">
			<CustomDropdown ref="scratchDropdown" placement="bottom-end">
				<button class="btn btn-soft btn-sm md:btn-md mb-1" :disabled="!!lockedCategoryKey">
					<i class="fa fa-plus" />
					{{ $t('components.flow.createFlowModal.startFromScratch.title') }}
				</button>
				<template #popper>
					<div class="py-4 px-4 menu">
						<span class="text-sm text-muted mb-2">
							{{ $t('components.flow.createFlowModal.startFromScratch.startTrigger.title') }}
						</span>
						<ul>
							<li>
								<a href="javascript:" @click="selectQuickFlow(QUICK_TYPES.sendDmFromComments)">
									<i class="fa-regular fa-comments" />
									{{ $t('components.flow.createFlowModal.startFromScratch.startTrigger.postComment') }}
								</a>
							</li>
							<li>
								<a href="javascript:" @click="selectQuickFlow(QUICK_TYPES.storyMentionReply)">
									<i class="fa-solid fa-at" />
									{{ $t('components.flow.createFlowModal.startFromScratch.startTrigger.storyMention') }}
								</a>
							</li>
							<li>
								<a href="javascript:" @click="selectQuickFlow(QUICK_TYPES.replyToStory)">
									<i class="fa-solid fa-reply" />
									{{ $t('components.flow.createFlowModal.startFromScratch.startTrigger.replyToStory') }}
								</a>
							</li>
						</ul>
						<div class="divider my-0" />
						<span class="text-sm text-muted mb-2">
							{{ $t('components.flow.createFlowModal.startFromScratch.startScratch.title') }}
						</span>
						<ul>
							<li>
								<localized-link name="flow-id" :params="{ id: 'new' }" @click="hideModal()">
									<i class="fa-regular fa-file-lines" />
									{{ $t('components.flow.createFlowModal.startFromScratch.startScratch.blank') }}
								</localized-link>
							</li>
							<li>
								<localized-link name="flow-diagram-id" :params="{ id: 'new' }" @click="hideModal()">
									<i class="fa fa-diagram-project" />
									{{ $t('components.flow.createFlowModal.startFromScratch.startDiagram.blank') }}
								</localized-link>
							</li>
						</ul>
					</div>
				</template>
			</CustomDropdown>
		</div>

		<div class="flex gap-3 divide-x divide-base-200">
			<div class="min-w-50 hidden sm:block">
				<ul class="menu space-y-2">
					<li v-if="!lockedCategoryKey">
						<a @click="selectCategory(null)" :class="{ 'menu-active': selectedCategoryKey === null }">
							{{ $t('components.flow.createFlowModal.allCategories') }}
						</a>
					</li>
					<li v-for="category in categories" :key="category.key">
						<a
							:class="[
								selectedCategoryKey === category.key ? 'menu-active' : '',
								!isCategoryAllowed(category.key) ? 'opacity-40 pointer-events-none' : '',
								category.isCommunity ? 'text-primary font-bold' : '',
							]"
							@click="isCategoryAllowed(category.key) && selectCategory(category.key)"
						>
							<i v-if="category.isCommunity" class="fa fa-users" />
							{{ $t(`components.flow.createFlowModal.categories.${category.key}`) }}
						</a>
					</li>
				</ul>
			</div>
			<div class="space-y-2 w-full">
				<div class="h-[calc(100vh-360px)] overflow-y-auto w-full">
					<!-- Community templates -->
					<template v-if="selectedCategoryKey === 'community'">
						<CommunityTemplatesList class="w-full" :searchQuery="searchQuery" @select="hideModal" />
					</template>
					<!-- All categories: flat list, no duplicates, with category tags -->
					<template v-else-if="!selectedCategoryKey">
						<div class="grid gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all pt-5">
							<template v-for="item in mixedItems" :key="item.key">
								<LocalizedLink
									v-if="item.community"
									name="flow-shared-slug"
									:params="{ slug: item.template.slug }"
									class="no-underline group block h-full"
									@click="hideModal"
								>
									<CreateFlowModalElement
										community
										:postAccount="getTemplateAccount(item.template)"
										:flowName="item.template.flow?.name"
										:usageCount="item.template.sourced_flows_count ?? item.template.sourcedFlowsCount ?? 0"
									/>
								</LocalizedLink>
								<CreateFlowModalElement
									v-else
									:type="item.flow.type"
									:title="$t(`components.flow.createFlowModal.quickFlows.${item.flow.type.key}.title`)"
									:description="$t(`components.flow.createFlowModal.quickFlows.${item.flow.type.key}.description`)"
									:iconClass="item.flow.iconClass"
									:showPro="item.flow.type.needsPro"
									:disabled="!isFlowAllowed(item.flow.type.key)"
									@click="!isFlowAllowed(item.flow.type.key) ? null : selectQuickFlow(item.flow.type)"
								/>
							</template>
						</div>
					</template>
					<!-- Single category selected -->
					<template v-else>
						<template v-for="(category, i) in filteredCategories" :key="category.key">
							<div class="divider pb-5" :class="{ 'pt-5': i > 0 }">
								{{ $t(`components.flow.createFlowModal.categories.${category.key}`) }}
							</div>
							<div class="grid gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all">
								<CreateFlowModalElement
									v-for="flow in categorizedFlows(category.key)"
									:key="flow.type.key"
									:type="flow.type"
									:title="$t(`components.flow.createFlowModal.quickFlows.${flow.type.key}.title`)"
									:description="$t(`components.flow.createFlowModal.quickFlows.${flow.type.key}.description`)"
									:iconClass="flow.iconClass"
									:showPro="flow.type.needsPro"
									:disabled="!isFlowAllowed(flow.type.key)"
									@click="!isFlowAllowed(flow.type.key) ? null : selectQuickFlow(flow.type)"
								/>
							</div>
						</template>
					</template>
				</div>
			</div>
		</div>
	</Modal>
</template>
<script>
import Modal from '~/components/GlobalComponents/Modal.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { QUICK_TYPES, quickFlowCategories, quickFlows } from '~/models/Flow/utils/quick.ts'
import CreateFlowModalElement from '~/components/Flow/CreateFlowModalElement.vue'
import CommunityTemplatesList from '~/components/Flow/CommunityTemplatesList.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import apiList from '~/apis/ApiList.js'

export default {
	components: { CustomDropdown, CreateFlowModalElement, CommunityTemplatesList, LocalizedLink, Modal },
	computed: {
		categorizedFlows() {
			return (categoryKey) => {
				const c = this.categories.find((c) => c.key === categoryKey)
				if (!c) return []
				return this.quickFlows.filter((f) => {
					const inCategory = c.flowKeys.some((k) => this.QUICK_TYPES[k]?.path === f.type.path)
					const matchesSearch = this.searchQuery
						? this.getFlowTitle(f.type.key).toLowerCase().includes(this.searchQuery.toLowerCase())
						: true
					return inCategory && matchesSearch
				})
			}
		},
		allUniqueFlows() {
			return this.quickFlows.filter((f) => {
				if (!this.searchQuery) return true
				return this.getFlowTitle(f.type.key).toLowerCase().includes(this.searchQuery.toLowerCase())
			})
		},
		filteredTemplates() {
			if (!this.searchQuery) return this.communityTemplates
			const q = this.searchQuery.toLowerCase()
			return this.communityTemplates.filter((t) => (t.flow?.name || '').toLowerCase().includes(q))
		},
		mixedItems() {
			const flows = this.allUniqueFlows.map((flow) => ({ community: false, flow, key: `flow-${flow.type.key}` }))
			const templates = this.filteredTemplates.slice(0, 3).map((template) => ({
				community: true,
				template,
				key: `template-${template.id}`,
			}))
			if (!flows.length) return templates
			if (!templates.length) return flows
			return [...flows.slice(0, 3), ...templates, ...flows.slice(3)]
		},
		filteredCategories() {
			const categories = this.categories.filter((c) => !c.isCommunity && this.categorizedFlows(c.key).length > 0)

			if (this.selectedCategoryKey) {
				return categories.filter((c) => c.key === this.selectedCategoryKey)
			}

			return categories
		},
		selectedChatAccount() {
			return this.chatAccountsStore.active
		},
	},
	data() {
		return {
			searchQuery: '',
			selectedCategoryKey: null,
			showMobileSearch: false,
			QUICK_TYPES,
			categories: quickFlowCategories,
			quickFlows: quickFlows,
			lockedCategoryKey: null,
			lockedPostId: null,
			lockedPostImg: null,
			lockedPostUsername: null,
			communityTemplates: [],
		}
	},
	setup() {
		return {
			localeRoute: useLocaleRoute(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	mounted() {
		this.loadCommunityTemplates()
		this.$emitter.on('showCreateFlowModal', (modalData) => {
			this.selectedCategoryKey = modalData?.params?.categoryKey || null
			this.lockedCategoryKey = modalData?.params?.categoryKey || null
			this.lockedPostId = modalData?.params?.postId || undefined
			this.lockedPostImg = modalData?.params?.postImg || undefined
			this.lockedPostUsername = modalData?.queries?.username || this.selectedChatAccount?.postAccount?.username
			this.showModal()
		})
		this.$emitter.on('hideCreateFlowModal', () => {
			this.hideModal()
		})
	},
	methods: {
		showModal() {
			this.$refs.modal?.showModal()
		},
		hideModal() {
			this.$refs.scratchDropdown.hide()
			this.$refs.modal?.hideModal()
		},
		openSearch() {
			this.showMobileSearch = true
			this.$nextTick(() => {
				this.$refs.searchInput?.focus()
			})
		},
		closeSearch() {
			this.showMobileSearch = false
			this.searchQuery = ''
		},
		getFlowTitle(flowKey) {
			return this.$t(`components.flow.createFlowModal.quickFlows.${flowKey}.title`)
		},
		selectCategory(key) {
			this.selectedCategoryKey = key
		},
		isCategoryAllowed(categoryKey) {
			if (!this.lockedCategoryKey) return true
			return this.lockedCategoryKey === categoryKey
		},
		isFlowAllowed(flowKey) {
			if (!this.lockedCategoryKey) return true
			const category = this.categories.find((c) => c.key === this.lockedCategoryKey)
			if (!category) return false
			return category.flowKeys.includes(flowKey)
		},
		loadCommunityTemplates() {
			this.$requestAdapter.get(apiList.chat.flow.library).then((res) => {
				this.communityTemplates = res.data
			})
		},
		getTemplateAccount(template) {
			const chat = template.flow?.chat_account || template.flow?.chatAccount
			return chat?.post_account || chat?.postAccount || null
		},
		selectQuickFlow(quickType) {
			if (quickType.needsPro && this.selectedChatAccount && !this.selectedChatAccount.subscribed) {
				this.hideModal()
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.selectedChatAccount,
					feature: 'quickFlow',
				})
				return
			}
			if (this.selectedChatAccount && !this.selectedChatAccount.isStatusActive) {
				this.hideModal()
				this.$emitter.emit('showRefreshPermissionModal', {
					chatAccount: this.selectedChatAccount,
				})
				return
			}

			this.hideModal()
			this.$router.push(
				this.localeRoute({
					name: 'flow-type-id',
					params: { id: 'new', type: quickType.path },
					query: {
						...this.$route.query,
						username: this.lockedPostUsername || undefined,
						postId: this.lockedPostId,
						postImg: this.lockedPostImg,
					},
				}),
			)
		},
	},
}
</script>
