<template>
	<div>
		<div class="flex flex-col gap-4">
			<div>
				<TriggerFlowSummary :node="node" />
			</div>
			<!-- Trigger Seçici -->
			<div class="w-full">
				<label class="label mb-2" ref="label">
					<span class="label-text font-medium">
						{{ $t('components.flow.node.actions.triggerFlow.selectFlowToTrigger') }}
					</span>
				</label>

				<CustomDropdown container="#appPage" ref="dropdown" placement="bottom-start" @show="onDropdownShow">
					<!-- Trigger Button -->
					<button class="btn btn-outline w-full justify-start flex-1 min-w-0" :disabled="activeFlowsLoading">
						<loading-element
							:is-loading="activeFlowsLoading"
							class="flex items-center justify-between flex-1 min-w-0 gap-2"
						>
							<span v-if="selectedFlow" class="flex items-center gap-2 flex-1 min-w-0">
								<i class="fa fa-paper-plane shrink-0" />
								<span class="truncate flex-1 min-w-0 text-left">#{{ selectedFlow.id }} {{ selectedFlow.name }}</span>
							</span>
							<span v-else class="flex items-center gap-2 flex-1 min-w-0">
								<i class="fa fa-plus shrink-0" />
								<span class="truncate flex-1 min-w-0 text-left">
									<template v-if="activeFlowsLoading">
										{{ $t('components.flow.node.actions.triggerFlow.loading') }}
									</template>
									<template v-else>
										{{ $t('components.flow.node.actions.triggerFlow.selectFlow') }}
									</template>
								</span>
							</span>
							<i class="fa fa-chevron-down shrink-0" />
						</loading-element>
					</button>

					<!-- Dropdown Content -->
					<template #popper="{ shown }">
						<div class="menu bg-base-100 rounded-lg shadow-lg mt-1 min-w-80">
							<loading-element :is-loading="activeFlowsLoading" class="block!">
								<ul v-if="activeFlows.length > 0" class="w-auto min-w-max max-h-60 overflow-y-auto">
									<li v-for="flow in activeFlows" :key="flow.id" class="my-1">
										<a
											href="javascript:"
											@click.stop="selectFlow(flow)"
											class="block py-3 px-4 hover:bg-base-200 rounded-lg"
										>
											<div class="flex items-start gap-3">
												<i class="fa fa-paper-plane text-primary mt-1"></i>
												<div class="flex-1 min-w-0">
													<div class="flex items-center gap-2">
														<span class="font-medium text-sm">#{{ flow.id }}</span>
														<span class="font-medium text-sm truncate">{{ flow.name }}</span>
													</div>
													<div class="text-xs text-muted mt-1">
														{{ flow.nodes?.length || 0 }} {{ $t('components.flow.node.actions.triggerFlow.steps') }}
														<span v-if="flow.publishedAt" class="ml-2"> • {{ formatDate(flow.publishedAt) }} </span>
													</div>
												</div>
											</div>
										</a>
									</li>
								</ul>
								<div v-else class="p-4 text-center">
									<i class="fa fa-exclamation-triangle text-warning text-2xl"></i>
									<p class="text-sm text-muted mt-2">
										{{ $t('components.flow.node.actions.triggerFlow.noActiveFlowsFound') }}
									</p>
								</div>
							</loading-element>
						</div>
					</template>
				</CustomDropdown>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import { Flow } from '~/models/Flow/Flow.ts'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { Node } from '~/models/Flow/Node.js'
import TriggerFlowSummary from '~/components/Flow/Node/Summaries/TriggerFlowSummary.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: { CustomDropdown, TriggerFlowSummary, LoadingElement },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			activeFlowsLoading: false,
			activeFlows: [],

			selectedFlowLoading: false,
			selectedFlow: null,
		}
	},
	mounted() {
		this.node.config = { ...this.node.config, selectedFlowId: this.node.config?.selectedFlowId || null }
		// Eğer flow seçili değilse veya seçili ama activeFlows boşsa API isteği at
		if (!this.selectedFlow || this.activeFlows.length === 0) {
			this.getActiveFlows()
		}

		if (this.node.config?.selectedFlowId) {
			this.getSelectedFlow()
		}

		// Dropdown dışına tıklandığında kapatmak için
		// document.addEventListener('click', this.handleOutsideClick)
	},
	beforeUnmount() {
		// document.removeEventListener('click', this.handleOutsideClick)
	},
	methods: {
		handleOutsideClick(event) {
			// // Dropdown ve içeriği dışına tıklandığında kapat
			// const dropdown = this.$refs.dropdown?.$el
			// if (dropdown && !dropdown.contains(event.target)) {
			// 	this.$refs.dropdown?.hide()
			// }
		},
		onDropdownShow() {
			// Dropdown açıldığında flow listesi boşsa API isteği at
			if (this.activeFlows.length === 0 && !this.activeFlowsLoading) {
				this.getActiveFlows()
			}
		},
		getActiveFlows() {
			const flowStore = useFlowStore()
			const chatAccountId = flowStore.flow.chatAccountId
			this.activeFlows = []
			if (!chatAccountId) return

			this.activeFlowsLoading = true
			this.$requestAdapter
				.get(apiList.chat.flow.chatAccountId.flows.actives, {
					chatAccountId: chatAccountId,
					params: {
						currentFlowId: flowStore.flow?.id,
					},
				})
				.then((response) => {
					consoleLog('Active flows:', response.data)
					this.activeFlows = response.data.map((f) => {
						return new Flow(f, this.$t)
					})
				})
				.catch((error) => {})
				.finally(() => {
					this.activeFlowsLoading = false
				})
		},
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
		selectFlow(flow) {
			consoleLog('Selected flow:', flow)
			this.node.config.selectedFlowId = flow.id
			this.selectedFlow = flow
			this.$refs.dropdown.hide()
		},
		formatDate(date) {
			if (!date) return ''
			const d = new Date(date)
			return d.toLocaleDateString('tr-TR', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		},
	},
}
</script>
