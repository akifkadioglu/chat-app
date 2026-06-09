<template>
	<div @click="focusFlowElement">
		<div
			class="bg-subtle rounded-lg border transition-colors overflow-hidden"
			v-bind:class="$attrs.class"
			v-auto-animate
			:class="{
				'border-base-200': !isSelected,
				'border-secondary': isSelected,
			}"
		>
			<label
				:class="{
					'cursor-default': !pointerEnabled,
				}"
				class="w-full flex items-center gap-3 p-3 group"
			>
				<slot name="leading" />
				<span class="flex-1">
					<slot name="icon" />
					<slot>
						<span :class="titleClass" class="text-sm font-medium">
							<slot name="title">
								{{ title }}
							</slot>
						</span>
					</slot>
				</span>
				<slot name="trailing" />
			</label>
			<div v-if="isSelected || showContent" :class="{ 'p-2': $slots.content }">
				<slot name="content" />
			</div>
		</div>
		<slot name="helper">
			<small class="text-xs text-muted block leading-4 py-2" v-if="showHelperText">
				<i class="fa fa-info-circle text-info" />
				{{ helperText }}
			</small>
		</slot>
	</div>
</template>
<script>
export default {
	props: {
		nodeUuid: {
			type: String,
		},
		triggerUuid: {
			type: String,
		},
		isInputLeft: {
			type: Boolean,
			default: false,
		},
		showContent: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
		},
		titleClass: {
			type: String,
		},
		isSelected: {
			type: Boolean,
			default: false,
		},
		helperText: {
			type: String,
		},
		showHelperText: {
			type: Boolean,
			default: false,
		},
		pointerEnabled: {
			type: Boolean,
			default: true,
		},
	},
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	methods: {
		focusFlowElement() {
			if (this.nodeUuid) {
				this.flowStore.focusNode(this.nodeUuid)
			}
			if (this.triggerUuid) {
				this.flowStore.focusTrigger(this.triggerUuid)
			}
		},
	},
}
</script>

<style scoped></style>
