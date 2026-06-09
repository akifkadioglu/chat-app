<template>
	<div class="space-y-4">
		<!-- Message Field Path - only show if showMessageFields prop is true -->
		<div v-if="showMessageFields">
			<label class="label label-text text-sm font-medium">{{
				$t('components.flow.node.actions.externalRequestPartials.requestResponse.messageFieldPath')
			}}</label>
			<input
				v-model="modelValue.messagePath"
				type="text"
				placeholder="data.message or response.content"
				class="input input-bordered input-sm w-full"
			/>
			<div class="text-xs text-base-content/60 mt-1">
				{{ $t('components.flow.node.actions.externalRequestPartials.requestResponse.messageFieldHint') }}
			</div>
		</div>

		<!-- Fallback Message - only show if showMessageFields prop is true -->
		<div v-if="showMessageFields">
			<label class="label label-text text-sm font-medium">{{
				$t('components.flow.node.actions.externalRequestPartials.requestResponse.fallbackMessage')
			}}</label>
			<textarea
				v-model="modelValue.fallbackMessage"
				:placeholder="$t('components.flow.node.actions.externalRequestPartials.requestResponse.fallbackPlaceholder')"
				class="textarea textarea-bordered w-full resize-none"
				rows="3"
			></textarea>
			<div class="text-xs text-base-content/60 mt-1">
				{{ $t('components.flow.node.actions.externalRequestPartials.requestResponse.fallbackHint') }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: Object,
			default() {
				return {
					messagePath: 'data.message',
					fallbackMessage: this.$t(
						'components.flow.node.actions.externalRequestPartials.requestResponse.fallbackPlaceholder',
					),
					// responseVariable: '',
					// extractPath: '',
				}
			},
		},
		showMessageFields: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['update:modelValue'],
}
</script>
