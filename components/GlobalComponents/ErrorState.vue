<template>
	<div class="flex items-center justify-center h-full">
		<StateElement :title="computedTitle" :content="content" img-url="/images/ui/error-icon.png">
			<template #content>
				<div class="space-y-2 text-start">
					<span class="text-sm">
						<slot name="content">
							{{ content }}
						</slot>
					</span>
					<p class="text-muted text-sm">
						<i18n-t keypath="components.globalComponents.errorState.supportText">
							<template #here>
								<button class="link link-primary underline!" @click="$emitter.emit('openSupportLauncher')">
									{{ $t('components.globalComponents.errorState.here') }}
								</button>
							</template>
						</i18n-t>
					</p>
				</div>
			</template>
			<template #buttons>
				<div class="flex items-center justify-center gap-2 pt-2">
					<button v-if="showRetryButton" class="btn btn-error" @click="$emit('retry')">
						{{ $t('components.globalComponents.errorState.retryButton') }}
					</button>
					<slot name="buttons" />
				</div>
			</template>
		</StateElement>
	</div>
</template>
<script>
import StateElement from '~/components/GlobalComponents/StateElement.vue'

export default {
	components: { StateElement },
	props: {
		title: {
			type: String,
			default: '',
		},
		content: {
			type: String,
			default: '',
		},
		showRetryButton: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['retry'],
	computed: {
		computedTitle() {
			return this.title || this.$t('components.globalComponents.errorState.title')
		},
	},
}
</script>
