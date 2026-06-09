<template>
	<div>
		<div class="mb-10">
			<div class="font-medium text-2xl">{{ question }}</div>
			<p class="text-muted text-sm">{{ description }}</p>
		</div>
		<slot />
		<div class="mt-5">
			<button
				@click="$emit('continue')"
				:disabled="!canContinue || isLoading"
				class="btn btn-block btn-primary btn-lg btn-transition py-7 gap-2"
			>
				{{ $t('components.app.questionElement.continueButton') }}
				<LoadingElement :isLoading="isLoading" size="16">
					<i class="fa fa-chevron-right"></i>
				</LoadingElement>
			</button>
		</div>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		canContinue: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		question: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
	},
	emits: ['continue', 'back'],
}
</script>

<style scoped></style>
