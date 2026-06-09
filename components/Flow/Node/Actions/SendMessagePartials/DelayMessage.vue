<template>
	<div class="bg-base-300 rounded-xl p-6 text-center">
		<div class="flex items-center justify-center gap-2 mb-4">
			<i class="fa fa-clock text-2xl text-base-content/60"></i>
			<span class="text-sm font-medium text-base-content/80">{{ $t('components.flow.node.actions.sendMessagePartials.delayMessage.waiting') }}</span>
		</div>

		<NumberStepper
			v-model="content.delay.duration"
			:min="1"
			:max="60"
			size="sm"
			class="mx-auto"
		/>

		<div class="text-xs text-base-content/60 mt-3">
			{{ $t('components.flow.node.actions.sendMessagePartials.delayMessage.second', content.delay.duration, { count: content.delay.duration })
			}}
		</div>
	</div>
</template>

<script>
import NumberStepper from '~/components/GlobalComponents/NumberStepper.vue'

export default {
	components: {
		NumberStepper,
	},
	props: {
		content: {
			type: Object,
			required: true,
		},
	},
	data() {
		this.content.delay = this.content.delay ?? {
			duration: 3,
		}

		return {}
	},
}
</script>
