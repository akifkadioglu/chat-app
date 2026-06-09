<template>
	<CustomDropdown
		ref="dropdown"
		:popperTriggers="[]"
		container="#appPage"
		placement="auto-end"
		@show="onDropdownShow"
		@hide="onDropdownHide"
	>
		<!-- This will be the popover reference (for the events and position) -->
		<slot name="triggerButton">
			<button ref="triggerButton" class="btn btn-ghost btn-sm" type="button">
				<i class="fa fa-plus" />
				{{ $t('components.flow.addNodePartials.addAction.buttonText') }}
			</button>
		</slot>

		<!-- This will be the content of the popover -->
		<template #popper="{ shown }">
			<div class="max-h-[90vh] overflow-y-auto">
				<div class="menu bg-base-100 rounded-lg shadow-lg mt-1" :inert="!shown">
					<div class="menu-title">
						<slot name="dropdownTitle">
							<span class="text-sm">{{ $t('components.flow.addNodePartials.addAction.dropdownTitle') }}</span>
						</slot>
					</div>

					<CustomDropdown v-if="simplifiedList" placement="right" @shown="advancedNodeActionsDropdownShown">
						<button class="btn w-full btn-soft btn-primary btn-transition">
							<i class="fa fa-plus" />
							{{ $t('components.flow.addNodePartials.addAction.moreActions') }}
							<i class="fa fa-chevron-right" />
						</button>
						<template #popper>
							<div class="max-h-[90vh] overflow-y-auto">
								<div class="menu bg-base-100 rounded-lg shadow-lg mt-1" :inert="!shown">
									<AdvancedNodeActions
										ref="advancedNodeActions"
										:hideConsentRequiredActions="hideConsentRequiredActions"
										:isResultAction="isResultAction"
										@addNode="$emit('addNode', $event)"
										:showAddConditionButton="showAddConditionButton"
									/>
								</div>
							</div>
						</template>
					</CustomDropdown>
					<div v-else>
						<AdvancedNodeActions
							ref="advancedNodeActions"
							:hideConsentRequiredActions="hideConsentRequiredActions"
							:isResultAction="isResultAction"
							:showAddConditionButton="showAddConditionButton"
							@addNode="$emit('addNode', $event)"
						/>
					</div>
					<template v-if="$slots.additionalAction">
						<div class="divider my-0" />
						<ul class="w-auto min-w-max">
							<slot name="additionalAction" />
						</ul>
					</template>
				</div>
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import AddNodeRenderer from '~/components/Flow/AddNodePartials/AddNodeRenderer.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import NodeTypeBadge from '~/components/Flow/NodeTypeBadge.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import AdvancedNodeActions from '~/components/Flow/AddNodePartials/AdvancedNodeActions.vue'

export default {
	props: {
		isResultAction: {
			type: Boolean,
			default: false,
		},
		hideConsentRequiredActions: {
			type: Boolean,
			default: false,
		},
		simplifiedList: {
			type: Boolean,
			default: false,
		},
		showAddConditionButton: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		// Mock flowStore if not available
		// const flowStore = {
		// 	flow: {
		// 		privateReplyUuid: null,
		// 		hasCommentTrigger: false,
		// 		chatAccount: {
		// 			subscribed: true,
		// 		},
		// 	},
		// }

		return {
			flowStore: useFlowStore(),
		}
	},
	components: {
		AdvancedNodeActions,
		ProBadge,
		CustomDropdown,
		NodeTypeBadge,
		LoadingElement,
		LocalizedLink,
		AddNodeRenderer,
	},
	emits: ['addNode', 'dropdown-opened', 'dropdown-closed'],
	methods: {
		onDropdownShow() {
			this.$emit('dropdown-opened')
			setTimeout(() => {
				this.$refs.advancedNodeActions.$refs.searchInput.focus()
			}, 100)
		},
		onDropdownHide() {
			this.$emit('dropdown-closed')
		},
		hideDropdown() {
			this.$refs.dropdown?.hide()
		},
		showDropdown() {
			this.$refs.dropdown?.show()
		},
		advancedNodeActionsDropdownShown() {
			consoleLog('advancedNodeActionsDropdownShown')
			setTimeout(() => {
				this.$refs.advancedNodeActions.$refs.searchInput.focus()
			}, 100)
		},
	},
}
</script>
