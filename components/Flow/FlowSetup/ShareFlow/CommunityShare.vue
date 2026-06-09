<template>
	<div class="space-y-3 relative">
		<DevTestScenario :buttons="devButtons" />

		<div>
			<div class="mb-2">
				<span v-if="isPublished && status === LIBRARY_STATUS.PENDING" class="badge badge-xs badge-warning badge-soft">
					<i class="fa fa-clock" />
					{{ $t('components.flow.flowSetup.shareFlow.communityShare.pendingShort') }}
				</span>
				<span
					v-else-if="isPublished && status === LIBRARY_STATUS.ACTIVE"
					class="badge badge-xs badge-success badge-soft"
				>
					<i class="fa fa-circle-check" />
					{{ $t('components.flow.flowSetup.shareFlow.communityShare.activeShort') }}
				</span>
			</div>
			<div class="h4 mb-1 flex items-center gap-2">
				<span>{{ $t('components.flow.flowSetup.shareFlow.communityShare.title') }}</span>
			</div>
			<p class="text-xs text-muted">
				{{ $t('components.flow.flowSetup.shareFlow.communityShare.description') }}
			</p>
		</div>

		<button
			type="button"
			class="btn btn-soft btn-primary btn-sm w-full"
			:disabled="submitting || isSameVersion"
			@click="submitForReview"
		>
			<LoadingElement :isLoading="submitting" size="16">
				<span v-if="!!submittedVersion">
					{{ $t('components.flow.flowSetup.shareFlow.communityShare.form.updateButton') }}
				</span>
				<span v-else>
					{{ $t('components.flow.flowSetup.shareFlow.communityShare.form.submitButton') }}
				</span>
			</LoadingElement>
		</button>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import { LIBRARY_STATUS, SharedFlow } from '~/models/Flow/SharedFlow'
import DevTestScenario from '~/components/GlobalComponents/DevTestScenario.vue'
import apilist from '~/apis/ApiList.js'

export default {
	components: {
		DevTestScenario,
		LoadingElement,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	data() {
		return {
			LIBRARY_STATUS,
			submitting: false,
		}
	},
	computed: {
		currentVersion() {
			return this.flowStore.flow?.version ?? null
		},
		status() {
			return this.flowStore.flow?.sharedFlows?.library?.status ?? null
		},
		isPublished() {
			return this.flowStore.flow?.sharedFlows?.library?.isPublished || false
		},
		devButtons() {
			return [
				{ name: 'None', action: () => (this.flowStore.flow.sharedFlows.library = null) },
				{ name: 'Pending', action: () => this.setDevStatus(LIBRARY_STATUS.PENDING) },
				{ name: 'Active', action: () => this.setDevStatus(LIBRARY_STATUS.ACTIVE) },
				{ name: 'Rejected', action: () => this.setDevStatus(LIBRARY_STATUS.REJECTED) },
				{ name: 'Same version', action: () => this.setDevStatus(null, this.currentVersion) },
			]
		},
		submittedVersion() {
			return this.flowStore.flow?.sharedFlows?.library?.flowVersion?.version ?? null
		},
		isSameVersion() {
			return this.submittedVersion !== null && this.submittedVersion === this.currentVersion
		},
	},
	methods: {
		setDevStatus(status, version = '0.0.1') {
			this.flowStore.flow.sharedFlows.library = new SharedFlow({
				status,
				flowVersion: { id: 0, version },
			})
		},
		async submitForReview() {
			this.submitting = true

			let link = apiList.chat.flow.id.library.submit
			if (!!this.submittedVersion) {
				link = apilist.chat.flow.id.library.update
			}
			await this.$requestAdapter
				.post(
					link,
					{
						flowId: this.flowStore.flow.id,
					},
					{ id: this.flowStore.flow.id },
				)
				.then((response) => {
					this.flowStore.flow.sharedFlows.library = new SharedFlow(response?.data.library)
					this.$toast.success(this.$t('components.flow.flowSetup.shareFlow.communityShare.submittedToast'))
				})
				.finally(() => {
					this.submitting = false
				})
		},
	},
}
</script>
