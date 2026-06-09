<template>
	<div class="border-subtle border rounded-lg px-5 pt-4 pb-2 group">
		<div class="flex flex-col md:flex-row items-start justify-between">
			<div class="flex-1 w-full order-1 md:order-0">
				<div class="flex flex-wrap md:flex-nowrap md:items-start md:justify-between gap-4">
					<div class="w-full truncate">
						<div class="mb-5" v-auto-animate>
							<div v-if="flow.isPublished">
								<span class="badge badge-success badge-sm">{{ $t('components.flow.flowCard.status.published') }}</span>

								<div class="flex gap-2 text-sm text-secondary mt-3">
									<!--							<div class="flex items-center gap-1">-->
									<!--								<i class="fas fa-code-branch" style="font-size: 10px" />-->
									<!--								<span>v{{ flow.publishedFlowVersion.version }}</span>-->
									<!--							</div>-->
									<div class="flex items-center gap-1">
										<i class="fas fa-layer-group" style="font-size: 10px" />
										<span>{{ $t('components.flow.flowCard.stats.steps', { count: flow.raw.nodes_count }) }}</span>
									</div>
									<div class="flex items-center gap-1">
										<i class="fas fa-user" style="font-size: 10px" />
										<span class="text-muted">#{{ flow.raw?.published_user?.id }}</span>
										<span>{{ flow.raw?.published_user?.name }}</span>
									</div>
								</div>
							</div>

							<span v-else class="badge badge-secondary badge-soft badge-sm">
								{{ $t('components.flow.flowCard.status.draft') }}
							</span>
						</div>

						<!--				<hr class="border-subtle my-4" v-if="flow.isPublished" />-->

						<div class="flex items-center gap-3 flex-1 min-w-0">
							<!-- Flow Icon -->
							<i
								class="fas fa-paper-plane text-lg bg-linear-to-r from-blue-500 to-purple-600 py-1 bg-clip-text text-transparent shrink-0"
							/>

							<!-- Flow Title -->
							<h3 class="truncate">
								<small class="text-muted"># {{ flow.id }}</small>
								{{ flow.name || 'Untitled' }}
							</h3>

							<div v-if="flow.isPublished" class="relative">
								<ToggleSwitch v-model="isPublished" @update:modelValue="askToChangeToggleStatus" class="my-auto" />
								<span v-if="statusLoading" class="absolute left-0 top-0 w-full bg-white opacity-70 text-center">
									<LoadingElement />
								</span>
							</div>
						</div>
					</div>

					<!-- Stats -->
					<div
						class="flex items-center justify-end gap-8 text-sm basis-full md:basis-auto md:ml-auto order-4 md:order-none"
					>
						<!-- Runs -->
						<div class="text-center">
							<div v-if="showStatsSkeleton" class="w-16 h-7 bg-base-300 animate-pulse rounded" />
							<div v-else class="flex items-center justify-center gap-1">
								<i class="fas fa-play text-primary text-xl"></i>
								<span class="font-medium text-primary text-2xl">{{
									$formatNumber(effectiveStats.flowRunsCount, $i18n.locale)
								}}</span>
							</div>
						</div>

						<!-- Unique Contacts -->
						<div class="text-center">
							<div v-if="showStatsSkeleton" class="w-16 h-7 bg-base-300 animate-pulse rounded" />
							<div v-else class="flex items-center justify-center gap-1">
								<i class="fas fa-eye text-accent text-xl"></i>
								<span class="font-medium text-accent text-2xl">{{
									$formatNumber(effectiveStats.uniqueContactsCount, $i18n.locale)
								}}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="my-2 pl-5 w-full">
					<div
						v-if="flow.raw.triggers?.length === 0"
						class="min-w-full md:min-w-sm max-w-lg border border-subtle rounded-md p-2"
					>
						<span class="text-muted">{{ $t('components.flow.flowCard.noTriggers') }}</span>
					</div>
					<div
						v-for="trigger in filteredTriggers(flow)"
						:key="trigger.id"
						class="min-w-full md:min-w-sm max-w-lg border border-subtle rounded-md p-2 my-1"
					>
						<TriggerSummary :trigger="new Trigger(trigger)" />
					</div>
				</div>
			</div>
			<!-- Actions -->
			<CustomDropdown ref="actionsDropdown" class="order-0 ml-auto md:ml-10 md-order-none" placement="bottom-end">
				<button class="btn btn-sm btn-ghost">
					<i class="fas fa-ellipsis-h"></i>
				</button>

				<template #popper>
					<div class="rounded-lg shadow-lg p-2 menu">
						<localized-link
							:name="flow.route.name"
							:params="flow.route.params"
							class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
						>
							<i class="fas fa-edit mr-2 w-4 text-center"></i>
							{{ $t('components.flow.flowCard.actions.edit') }}
						</localized-link>

						<button
							@click="editWithDiagram(flow.typeKey)"
							class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded"
						>
							<i class="fas fa-project-diagram mr-2 w-4 text-center" />
							{{ $t('components.flow.flowCard.actions.editWithDiagram') }}
						</button>

						<button
							@click="handleDuplicate"
							class="menu-item flex items-center px-4 py-2 text-sm w-full text-left rounded pointer-events-none opacity-50"
							disabled
							v-tooltip="$t('components.chat.content.messageInput.comingSoon')"
						>
							<i class="fas fa-copy mr-2 w-4 text-center"></i>
							{{ $t('components.flow.flowCard.actions.duplicate') }}
						</button>

						<div class="divider my-1"></div>

						<button
							@click="handleDelete"
							class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-error/10 w-full text-left rounded"
						>
							<i class="fas fa-trash mr-2 w-4 text-center"></i>
							{{ $t('components.flow.flowCard.actions.delete') }}
						</button>
					</div>
				</template>
			</CustomDropdown>
		</div>

		<div class="flex gap-2 justify-between items-center mt-5 flex-wrap text-xs">
			<!-- Left: Trigger Info -->

			<!-- Right: Metadata -->
			<!--			<div-->
			<!--				class="grid grid-cols-2 items-end gap-2 text-xs basis-full md:basis-auto md:flex md:flex-col flex-wrap mt-5 md:mt-0"-->
			<!--			>-->
			<div class="flex items-center gap-1">
				<i class="fas fa-clock" style="font-size: 10px"></i>
				<span>{{ flow.updatedAt.toLocaleDateString() }}</span>
				<span>{{ flow.updatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }}</span>
			</div>
			<!--				<div class="flex items-center gap-1">-->
			<!--					<i class="fas fa-code-branch" style="font-size: 10px"></i>-->
			<!--					<span>{{ flow.raw.last_flow_version.version }}</span>-->
			<!--				</div>-->
			<div class="flex items-center gap-1 flex-wrap justify-end">
				<div class="flex items-baseline gap-1">
					<i class="fas fa-user"></i>
					<span class="text-muted">#{{ flow.raw?.last_flow_version?.user.id }}</span>
				</div>
				<span>{{ flow.raw?.last_flow_version?.user.name }}</span>
			</div>
			<!--			</div>-->
		</div>

		<hr class="border-subtle my-4" />
		<div class="flex justify-between">
			<AccountProfile
				:size="24"
				:profile-picture="flow.chatAccount.postAccount.profilePicture"
				:name="flow.chatAccount.postAccount.name"
				:username="flow.chatAccount.postAccount.username"
			/>

			<div>
				<LocalizedLink
					class="btn btn-soft btn-primary btn-sm group-hover:!btn-active group-hover:!text-white !transition-all duration-100"
					:name="flow.route.name"
					:params="flow.route.params"
				>
					<i
						:class="{
							'fa fa-feather': flow.typeKey === FLOW_TYPE_KEYS.quick,
							'fa fa-diagram-project': flow.typeKey === FLOW_TYPE_KEYS.diagram,
							'fa fa-layer-group': flow.typeKey === FLOW_TYPE_KEYS.basic,
						}"
					/>
					{{ $t('components.flow.flowCard.actions.view') }}
					<i class="fa fa-chevron-right ml-1 link-icon" />
				</LocalizedLink>
			</div>
		</div>
	</div>
</template>

<script>
import apiList from '~/apis/ApiList.js'
import { Flow, FLOW_STATUS_DRAFT, FLOW_STATUS_PUBLISHED } from '~/models/Flow/Flow.ts'
import ToggleSwitch from '~/components/Flow/Node/Triggers/Partials/ToggleSwitch.vue'
import TriggerSummary from '~/components/Flow/Node/Triggers/Partials/TriggerSummary.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { FLOW_TYPE_KEYS, triggerTypes } from '~/models/Flow/utils/utils.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'

export default {
	emits: ['duplicate', 'deleteFlow', 'updated'],
	components: {
		LocalizedLink,
		CustomDropdown,
		AccountProfile,
		LoadingElement,
		TriggerSummary,
		ToggleSwitch,
	},
	props: {
		flow: {
			type: Flow,
			required: true,
		},
		stats: {
			type: Object,
			default: null,
		},
		statsLoading: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			localeRoute: useLocaleRoute(),
		}
	},
	computed: {
		effectiveStats() {
			return {
				flowRunsCount: this.stats?.flow_runs_count ?? this.flow.raw.flow_runs_count,
				uniqueContactsCount: this.stats?.unique_contacts_count ?? this.flow.raw.unique_contacts_count,
			}
		},
		showStatsSkeleton() {
			return this.statsLoading && !this.stats
		},
		filteredTriggers() {
			return (flow) =>
				flow.raw.triggers.filter(
					(t) =>
						![triggerTypes.postback.key, triggerTypes.quickReply.key, triggerTypes.otherFlow.key].includes(
							t.trigger_type?.key,
						),
				) || []
		},
	},
	data() {
		return {
			Trigger,
			FLOW_TYPE_KEYS,
			statusLoading: false,
			isPublished: false,
		}
	},
	mounted() {
		this.isPublished = this.flow.isPublished
	},
	beforeUnmount() {
		this.$swal.close()
	},
	methods: {
		handleDuplicate() {
			this.$emit('duplicate', this.flow)
		},
		askToChangeToggleStatus() {
			this.$swal
				.fire({
					title: this.$t('components.flow.flowCard.toggleStatusConfirm.title'),
					text: this.$t('components.flow.flowCard.toggleStatusConfirm.text', { flowName: this.flow.name }),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonText: this.$t('components.flow.flowCard.toggleStatusConfirm.confirmButton'),
					cancelButtonText: this.$t('components.flow.flowCard.toggleStatusConfirm.cancelButton'),
					// reverseButtons: true,
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.handleToggleStatus()
						return
					}
					this.isPublished = !this.isPublished
				})
		},
		handleToggleStatus() {
			this.statusLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.flow.id.changeStatus,
					{
						status: !this.isPublished ? FLOW_STATUS_DRAFT : FLOW_STATUS_PUBLISHED,
					},
					{
						chatAccountId: this.flow.chatAccountId,
						id: this.flow.id,
					},
				)
				.then((res) => {
					// this.flow.update(res.data, this.flow)
					this.flow.update(res.data, this.flow)
					if (this.flow.status === FLOW_STATUS_PUBLISHED) {
						this.flow.chatAccount.publishedFlows.push(this.flow)
					} else if (this.flow.status === FLOW_STATUS_DRAFT) {
						this.flow.chatAccount.publishedFlows = this.flow.chatAccount.publishedFlows.filter(
							(flow) => flow.id !== this.flow.id,
						)
					}
				})
				.catch((err) => {
					console.error(err)
				})
				.finally(() => {
					this.statusLoading = false
					this.isPublished = this.flow.isPublished
				})
		},
		async handleDelete() {
			this.$refs.actionsDropdown.hide()
			const result = await this.$swal.fire({
				title: this.$t('components.flow.flowCard.deleteConfirm.title'),
				text: this.$t('components.flow.flowCard.deleteConfirm.text', { flowName: this.flow.name }),
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: this.$t('components.flow.flowCard.deleteConfirm.confirmButton'),
				cancelButtonText: this.$t('components.flow.flowCard.deleteConfirm.cancelButton'),
				// reverseButtons: true,
			})

			if (!result.isConfirmed) {
				return
			}
			await this.$requestAdapter
				.get(apiList.chat.flow.id.delete, {
					chatAccountId: this.flow.chatAccountId,
					id: this.flow.id,
				})
				.then((res) => {
					this.$emit('deleteFlow', this.flow)
				})
				.catch((err) => {
					console.error(err)
				})
				.finally(() => {})
		},
		editWithDiagram(typeKey) {
			const route = this.localeRoute({ name: 'flow-diagram-id', params: { id: this.flow.id } })
			if (typeKey === FLOW_TYPE_KEYS.diagram) {
				this.$router.push(route)
				return
			}
			// TODO :: çevirilerle biraz uğraş
			this.$swal
				.fire({
					title: this.$t('components.flow.flowCard.editWithDiagram.title'),
					text: this.$t('components.flow.flowCard.editWithDiagram.text', {
						typeKey: this.$t('components.flow.flowCard.editWithDiagram.typeKey.' + typeKey),
					}),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonText: this.$t('components.flow.flowCard.editWithDiagram.confirmButton'),
					cancelButtonText: this.$t('components.flow.flowCard.editWithDiagram.cancelButton'),
					reverseButtons: true,
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.$router.push(route)
					}
				})
		},
	},
}
</script>
