<template>
	<!--			ref="leftPanel"-->
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-10" v-auto-animate>
				<CommentOnPostTrigger :flow="flowStore.flow" v-if="0 <= step" />
				<FirstDMActionPanel
					:showAskFollowBeforeLinkTrailing="false"
					:showPrivateReplyMessageTrailing="false"
					:flow="flowStore.flow"
					v-if="1 <= step"
				/>
				<FollowUpMessage :flow="flowStore.flow" v-if="2 <= step" />
				<QuickSignature :flow="flowStore.flow" v-if="2 <= step" />
				<PublishElementGroup v-if="2 <= step" />
			</div>
		</div>
		<button v-if="step < 2" class="btn btn-soft btn-primary m-5" @click="nextStep">
			{{ $t('components.flow.quick.common.nextStep') }}
			<i class="fa fa-chevron-down ml-1" />
		</button>
	</div>
</template>

<script>
import FirstDMActionPanel from '~/components/Flow/Quick/Components/FirstDMActionPanel.vue'
import FollowUpMessage from '~/components/Flow/Quick/Components/FollowUpMessage.vue'
import CommentOnPostTrigger from '~/components/Flow/Quick/Components/CommentOnPostTrigger.vue'
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'

export default {
	components: {
		PublishElementGroup,
		QuickSignature,
		CommentOnPostTrigger,
		FollowUpMessage,
		FirstDMActionPanel,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	inject: ['getContentContainer'],

	data() {
		return {
			step: 0,
		}
	},
	mounted() {
		if (this.flowStore.flow.id) {
			this.step = 2
		}
	},
	methods: {
		async nextStep() {
			this.step++
			await this.$delay(250)
			const el = this.getContentContainer?.()
			if (el) {
				el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
			}
		},
	},
}
</script>
