<template>
	<div class="border border-subtle rounded-lg p-3 hover:border-base-content/20 transition-colors py-5">
		<div class="flex flex-col gap-3">
			<div @click="showUpgradeModal">
				<label class="block mb-2 text-sm text-secondary">
					<i class="fa fa-comment text-primary"></i>
					{{ $t('components.flow.node.triggers.receivedDM.aiFilters.ifMessageAbout') }}
				</label>

				<input
					v-model="options.intention"
					type="text"
					class="input input-bordered w-full"
					:readonly="!hasSubscription"
					@click="showUpgradeModal"
					:placeholder="$t('components.flow.node.triggers.receivedDM.aiFilters.placeholder')"
				/>

				<p class="text-xs text-muted mt-2">
					<i class="fa fa-info-circle text-info mr-1"></i>
					{{ $t('components.flow.node.triggers.receivedDM.aiFilters.inputDescription') }}
				</p>
			</div>

			<div>
				<div
					class="mt-4 p-2 bg-subtle rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:bg-base-200 transition-colors"
					@click="applyExample"
				>
					<div class="flex items-center gap-2 min-w-0 text-xs">
						<i class="fa fa-lightbulb text-warning"></i>
						<a href="javascript:" class="text-sm truncate link link-primary"
							><u>{{ currentExample }}</u></a
						>
					</div>
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-square"
						@click.stop="shuffleExample"
						:title="$t('components.flow.node.triggers.receivedDM.aiFilters.shuffleExample')"
					>
						<i class="fa fa-shuffle"></i>
					</button>
				</div>
				<p class="text-xs text-muted mt-1">
					{{ $t('components.flow.node.triggers.receivedDM.aiFilters.clickToApply') }}
				</p>
			</div>
		</div>
	</div>
</template>

<script>
import { errorsList } from '~/models/Flow/utils/defaultConfigs.ts'

export default {
	name: 'AiRuleBuilder',
	props: {
		options: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			currentExampleIndex: 0,
		}
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	watch: {
		'options.intention'(newVal) {
			if (newVal && !this.hasSubscription) {
				this.options.intention = null
				this.showUpgradeModal()
			}
		},
	},
	computed: {
		examples() {
			return [
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.lookingForCoupon'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.wantsCatalog'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksBusinessHours'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksDiscount'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksPrices'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksProducts'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.wantsSupport'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksShipping'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.wantsRefund'),
				this.$t('components.flow.node.triggers.receivedDM.aiFilters.examples.asksAvailability'),
			]
		},
		hasSubscription() {
			return this.flowStore.flow.chatAccount?.subscribed ?? false
		},
		currentExample() {
			return this.examples[this.currentExampleIndex]
		},
	},
	methods: {
		shuffleExample() {
			let newIndex
			do {
				newIndex = Math.floor(Math.random() * this.examples.length)
			} while (newIndex === this.currentExampleIndex && this.examples.length > 1)
			this.currentExampleIndex = newIndex
		},
		applyExample() {
			if (!this.hasSubscription) {
				this.showUpgradeModal()
				return
			}
			this.options.intention = this.currentExample
		},
		showUpgradeModal() {
			if (!this.hasSubscription) {
				this.$emitter.emit('showUpgradeModal', {
					feature: 'aiFilters',
					chatAccount: this.flowStore.flow.chatAccount,
				})
			}
		},
	},
}
</script>
