<template>
	<CustomDropdown ref="shareDropdown" :triggers="[]" placement="bottom-start">
		<button class="btn btn-sm btn-info btn-transition" :disabled="loading" @click="openDropdown">
			<LoadingElement :isLoading="loading" size="16">
				<span class="flex flex-nowrap gap-1 items-baseline">
					<i class="fa fa-arrow-up-from-bracket" />
					<span class="hidden lg:block">{{ $t('components.flow.flowSetup.shareFlowDropdown.button') }}</span>
				</span>
			</LoadingElement>
		</button>
		<template #popper>
			<div class="p-5 w-80 max-w-dvw space-y-4">
				<ShareFlowPersonalShare :link="personalLink" :loading="personalLoading" />
				<div class="border-t border-base-200" />
				<ShareFlowCommunityShare @submitted="hideDropdown" />
			</div>
		</template>
	</CustomDropdown>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import ShareFlowPersonalShare from '~/components/Flow/FlowSetup/ShareFlow/PersonalShare.vue'
import ShareFlowCommunityShare from '~/components/Flow/FlowSetup/ShareFlow/CommunityShare.vue'
import { createJSONByFlow } from '~/models/Flow/utils/utils.ts'
import { SharedFlow } from '~/models/Flow/SharedFlow.ts'
import apiList from '~/apis/ApiList.js'

export default {
	components: {
		CustomDropdown,
		LoadingElement,
		ShareFlowPersonalShare,
		ShareFlowCommunityShare,
	},
	props: {
		saveFunc: {
			type: Function,
			required: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			runtimeConfig: useRuntimeConfig(),
		}
	},
	data() {
		return {
			loading: false,
			lastSavedVersion: null,
			personalLink: '',
			personalLoading: false,
			lastSharedVersion: null,
		}
	},
	methods: {
		async openDropdown() {
			if (this.flowStore.flow.version && this.lastSavedVersion === this.flowStore.flow.version) {
				this.$refs.shareDropdown.show()
				this.preparePersonalLink()
				return
			}
			this.lastSavedVersion = this.flowStore.flow.version
			this.loading = true
			await this.saveFunc()
			this.$refs.shareDropdown.show()
			this.preparePersonalLink()
			this.loading = false
		},
		preparePersonalLink() {
			if (this.flowStore.flow.version && this.lastSharedVersion === this.flowStore.flow.version) {
				return
			}
			this.lastSharedVersion = this.flowStore.flow.version
			this.personalLoading = true
			this.personalLink = ''
			this.$requestAdapter
				.post(
					apiList.chat.flow.id.share.index,
					{
						version: this.flowStore.flow.version,
						graph: createJSONByFlow(this.flowStore.flow.toJSON()),
					},
					{ id: this.flowStore.flow.id },
				)
				.then((res) => {
					this.flowStore.flow.sharedFlows.link = new SharedFlow(res.data.link)
					this.personalLink = this.$mergeDomainNPath(
						this.runtimeConfig.public.shortenUrl,
						'cs/' + this.flowStore.flow.sharedFlows.link.slug,
					)
				})
				.finally(() => {
					this.personalLoading = false
				})
		},
		hideDropdown() {
			this.$refs.shareDropdown.hide()
		},
	},
}
</script>
