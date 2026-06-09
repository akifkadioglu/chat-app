<template>
	<State
		:isLoading="chatAccountsStore.isChatAccountsPublishedFlowsLoading"
		:isEmpty="flows && flows.length === 0"
		:emptyContent="$t('components.accounts.overviewTab.flowsOverview.emptyState.content')"
	>
		<div>
			<div class="flex items-center flex-wrap justify-between mb-2">
				<h2 class="text-xl text-nowrap">
					<i class="fa fa-paper-plane text-primary mr-2" />
					{{ $t('components.accounts.overviewTab.flowsOverview.title') }}
				</h2>
				<localized-link name="flows" class="ml-auto">
					{{ $t('components.accounts.overviewTab.flowsOverview.flowCount', { count: flows?.length || 0 }) }}
					<i class="fa fa-chevron-right link-icon" />
				</localized-link>
			</div>
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr class="[&_th]:font-normal [&_td]:text-normal!">
							<th></th>
							<th>{{ $t('components.accounts.overviewTab.flowsOverview.table.headers.flowName') }}</th>
							<th>{{ $t('components.accounts.overviewTab.flowsOverview.table.headers.starters') }}</th>
							<th>{{ $t('components.accounts.overviewTab.flowsOverview.table.headers.runs') }}</th>
							<th>{{ $t('components.accounts.overviewTab.flowsOverview.table.headers.uniqueContacts') }}</th>
							<th>{{ $t('components.accounts.overviewTab.flowsOverview.table.headers.lastPublished') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(flow, index) in flows" :key="flow.id" class="[&_td]:text-sm">
							<td class="text-muted">{{ index + 1 }}</td>
							<td class="font-medium">
								<localized-link :name="flow.route.name" :params="flow.route.params" class="flex gap-2">
									<span class="text-subtle"> #{{ flow.id }} </span>
									<span v-tooltip="flow.name" class="truncate underline hover:text-simpliers max-w-[280px]">
										{{ flow.name }}
									</span>
								</localized-link>
							</td>
							<td>
								<div v-for="trigger in filteredTriggers(flow)" class="">
									<div class="flex items-center gap-2 py-2 w-max">
										<i
											class="fa-solid"
											:class="{
												'fa-comment text-pink-500': trigger.trigger_type?.key === triggerTypes.commentOnPost.key,
												'fa-reply text-green-500': trigger.trigger_type?.key === triggerTypes.replyToStory.key,
												'fa-envelope text-blue-500': trigger.trigger_type?.key === triggerTypes.receivedDM.key,
												'fa-at text-purple-500': trigger.trigger_type?.key === triggerTypes.storyMention.key,
												'fa-video text-red-500': trigger.trigger_type?.key === triggerTypes.commentOnLive.key,
											}"
										/>
										<span>
											{{ trigger.trigger_type?.label }}
										</span>
									</div>
								</div>
							</td>
							<td class="text-center">{{ flow.raw.flow_runs_count }}</td>
							<td class="text-center">{{ flow.raw.unique_contacts_count }}</td>
							<td class="flex w-max">
								{{ dayjs(flow.publishedAt).format('DD MMM YYYY HH:mm') }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<template #emptyTitle>
			<span class="text-2xl font-bold">{{ $t('components.accounts.overviewTab.flowsOverview.emptyState.title') }}</span>
		</template>
		<template #emptyButtons>
			<div class="space-y-2 w-full max-w-sm mx-auto">
				<CreateFlowButton class="my-8" />

				<div class="divider text-xs text-subtle">
					{{ $t('components.accounts.overviewTab.flowsOverview.emptyState.dividerText') }}
				</div>

				<localized-link name="flows" class="gap-2 hover:text-simpliers transition-all duration-200">
					<span>{{ $t('components.accounts.overviewTab.flowsOverview.emptyState.viewAllFlows') }}</span>
					<i class="fa fa-chevron-right link-icon" />
				</localized-link>
			</div>
		</template>
	</State>
</template>

<script>
import State from '~/components/GlobalComponents/State.vue'
import CreateFlowButton from '~/components/Flow/CreateFlowButton.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import dayjs from 'dayjs'
import StateElement from '~/components/GlobalComponents/StateElement.vue'

export default {
	components: { StateElement, LocalizedLink, CreateFlowButton, State },
	setup() {
		return {
			flowStore: useFlowStore(),
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		nodeTypes() {
			return nodeTypes
		},
		activeAccountId() {
			return this.chatAccountsStore.active?.id
		},
		flows() {
			return this.chatAccountsStore.active?.publishedFlows || []
		},

		filteredTriggers() {
			return (flow) =>
				(flow.raw?.triggers || []).filter(
					(t) =>
						![triggerTypes.postback.key, triggerTypes.quickReply.key, triggerTypes.otherFlow.key].includes(
							t.trigger_type?.key,
						),
				)
		},
	},
	data() {
		return {
			triggerTypes,
		}
	},
	mounted() {
		this.chatAccountsStore.fetchPublishedFlows(this.activeAccountId)
	},
	watch: {
		// activeAccountId: {
		// 	immediate: true,
		// 	handler(id) {
		// 		if (id) {
		// 			this.chatAccountsStore.fetchPublishedFlows(id)
		// 		}
		// 	},
		// },
	},
	methods: {
		dayjs,
	},
}
</script>
