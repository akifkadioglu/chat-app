<template>
	<div>
		<!-- Distribution Warning -->
		<div
			:class="{
				'alert-warning': totalPercentage !== 100,
				'alert-info': totalPercentage === 100,
			}"
			class="alert alert-soft text-sm mb-4"
		>
			<i v-if="totalPercentage !== 100" class="fa fa-exclamation-triangle" />
			<i v-else class="fa fa-check-circle" />
			<span>{{ $t('components.flow.node.actions.randomizer.distributionMessage', { current: totalPercentage }) }}</span>
		</div>

		<!-- Random Path Every Time -->
		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-3">
				<input v-model="randomPathEveryTime" class="checkbox checkbox-sm" type="checkbox" />
				<small class="label-text">{{ $t('components.flow.node.actions.randomizer.randomPathEveryTime') }}</small>

				<i
					v-tooltip="$t('components.flow.node.actions.randomizer.randomPathEveryTimeTooltip')"
					class="fa fa-question-circle text-base-content/60 text-xs"
				/>
			</label>
		</div>

		<!-- Variations -->
		<div class="space-y-4">
			<div v-for="(variation, index) in node.config.variations" class="flex mb-3 items-center">
				<Variation
					:key="variation.uuid"
					:action="node.guardNode(variation.uuid)"
					:index="index"
					:variation="variation"
					@create:action="addGuardNode($event, variation.uuid)"
					@add:edge="addGuardEdge($event, variation.uuid)"
				/>

				<!-- Delete Variation Button -->
				<button
					v-if="node.config.variations.length > 1"
					class="btn btn-ghost btn-xs text-error hover:bg-error/10"
					@click="removeVariation(variation.uuid)"
				>
					<i class="fa fa-times"></i>
				</button>
			</div>
		</div>

		<!-- Add New Variation -->
		<div class="mt-4">
			<button
				:disabled="node.config?.variations?.length >= totalVariationsLimit"
				class="btn btn-outline btn-sm w-full"
				@click="addNewVariation"
			>
				<i class="fa fa-plus"></i>
				{{ $t('components.flow.node.actions.randomizer.newVariation') }}
			</button>
		</div>
	</div>
</template>

<script>
import { Node } from '~/models/Flow/Node.js'
import Variation from './Randomizer/Variation.vue'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import { v4 } from 'uuid'
import { Trigger } from '~/models/Flow/Trigger.ts'
import { triggerTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: {
		CloseAction,
		Variation,
	},
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
	computed: {
		totalPercentage() {
			if (!this.node.config.variations) return 0
			return this.node.config.variations.reduce((sum, variation) => sum + (variation.percentage || 0), 0)
		},
		randomPathEveryTime: {
			get() {
				return this.node.config.randomPathEveryTime
			},
			set(value) {
				this.node.config.randomPathEveryTime = value
			},
		},
	},
	data() {
		return {
			totalVariationsLimit: 5,
		}
	},
	mounted() {
		// this.initializeConfig()
	},
	methods: {
		// initializeConfig() {
		// 	if (!this.node.config.variations) {
		// 		this.node.config.variations = [
		// 			{ uuid: v4(), percentage: 50 },
		// 			{ uuid: v4(), percentage: 50 },
		// 		]
		// 	}
		// 	if (this.node.config.randomPathEveryTime === undefined) {
		// 		this.node.config.randomPathEveryTime = false
		// 	}
		// },
		addNewVariation() {
			if (this.node.config.variations.length >= this.totalVariationsLimit) return
			const variationUuid = v4()
			this.node.config.variations.push({
				uuid: variationUuid,
				percentage: 0,
			})
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: variationUuid,
					},
				}),
			)
		},
		removeVariation(uuid) {
			if (this.node.config.variations.length > 1) {
				this.node.removeTriggerByPostback(uuid)
				this.node.config.variations = this.node.config.variations.filter((v) => v.uuid !== uuid)
			}
		},
		addGuardNode(newNode, guard) {
			this.flowStore.flow.addNode(newNode, this.node, guard)
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
		addGuardEdge(toNodeUuid, guard) {
			this.flowStore.flow.addEdge(this.node, this.flowStore.flow.getNodeByUuid(toNodeUuid), guard)
			this.node.addTrigger(
				new Trigger({
					type: triggerTypes.postback,
					config: {
						postback: guard,
					},
				}),
			)
		},
	},
}
</script>

<style scoped></style>
