<template>
	<div>
		<!-- Selected Flow Preview -->
		<loading-element v-if="node.config.selectedFlowId" :is-loading="selectedFlowLoading">
			<div v-if="selectedFlow" class="p-4 border border-base-200 rounded-lg bg-base-50">
				<div class="flex items-start gap-3">
					<!--					<i class="fa fa-paper-plane text-primary mt-1"></i>-->
					<div class="flex-1 min-w-0">
						<!-- Flow Header -->
						<div class="flex items-center gap-2 mb-2">
							<span class="font-medium text-sm shrink-0">#{{ selectedFlow.id }}</span>
							<span class="font-medium text-sm truncate">{{ selectedFlow.name }}</span>
							<div v-if="selectedFlow.isPublished" class="shrink-0">
								<span class="badge badge-success badge-xs">{{
									$t('components.flow.node.actions.triggerFlow.published')
								}}</span>
							</div>
						</div>

						<!-- Flow Stats -->
						<div v-if="selectedFlow.isPublished" class="flex justify-between gap-4 text-sm text-muted mb-3">
							<div class="flex flex-col items-center gap-1">
								<i class="fas fa-code-branch" style="font-size: 10px" />
								<span>v{{ selectedFlow.publishedFlowVersion?.version }}</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<i class="fas fa-layer-group" style="font-size: 10px" />
								<span
									>{{ selectedFlow.raw?.nodes_count || 0 }}
									{{ $t('components.flow.node.actions.triggerFlow.steps') }}</span
								>
							</div>
							<div class="flex flex-col items-center gap-1">
								<i class="fas fa-user" style="font-size: 10px" />
								<span>
									<span class="text-muted">#{{ selectedFlow.raw?.published_user?.id }}</span>
									<span>{{ selectedFlow.raw?.published_user?.name }}</span>
								</span>
							</div>
						</div>

						<!-- Trigger Summary -->
						<div v-if="visibleTriggers.length > 0" class="flex flex-col gap-1">
							<TriggerSummary
								v-for="trigger in visibleTriggers"
								:key="trigger.id"
								:trigger="trigger"
								:showPostThumbnails="false"
							/>
						</div>
					</div>
				</div>
			</div>
		</loading-element>
		<NodeSummaryEmptyState v-else :text="$t('components.flow.node.summaries.triggerFlow.emptyState')" />
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import { Flow } from '~/models/Flow/Flow.ts'
import { Node } from '~/models/Flow/Node.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import TriggerSummary from '~/components/Flow/Node/Triggers/Partials/TriggerSummary.vue'
import NodeSummaryEmptyState from '~/components/Flow/Node/Summaries/NodeSummaryEmptyState.vue'
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.ts'
import { Trigger } from '~/models/Flow/Trigger.ts'

export default {
	components: {
		NodeSummaryEmptyState,
		LoadingElement,
		TriggerSummary,
	},
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	computed: {
		visibleTriggers() {
			return (
				this.selectedFlow?.publishedFlowVersion?.graph?.nodes
					.find((n) => (n.type = nodeTypes.trigger.key))?.triggers
					?.filter((t) => t.trigger_type?.key !== triggerTypes.postback.key)
					.map((t) => new Trigger(t)) || []
			)
		},
	},
	watch: {
		'node.config.selectedFlowId'(newVal, oldVal) {
			if (this.selectedFlowLoading) return
			if (newVal !== oldVal) {
				this.getSelectedFlow()
			}
		},
	},
	data() {
		return {
			selectedFlowLoading: false,
			selectedFlow: null,
		}
	},
	mounted() {
		if (this.node.config?.selectedFlowId) {
			this.getSelectedFlow()
		}
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		getSelectedFlow() {
			this.selectedFlowLoading = true

			this.$requestAdapter
				.get(apiList.chat.flow.chatAccountId.flows.selected, {
					chatAccountId: this.flowStore.flow.chatAccountId,
					params: {
						flowId: this.node.config.selectedFlowId,
					},
				})
				.then((response) => {
					this.selectedFlow = new Flow(response.data, this.$t)
				})
				.catch((error) => {})
				.finally(() => {
					this.selectedFlowLoading = false
				})
		},
	},
}
</script>
