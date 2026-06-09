<template>
	<div class="text-center px-4 space-y-2">
		<div class="flex justify-center mb-4">
			<img v-img-error v-if="imgUrl && !$slots.img" :src="imgUrl" alt="" class="w-36 opacity-10" />
			<slot name="img" />
			<div class="flex items-center justify-center">
				<slot name="icon" />
			</div>
		</div>
		<slot name="title">
			<div class="whitespace-normal break-words">
				<span class="text-lg">{{ title }}</span>
			</div>
		</slot>
		<div class="whitespace-normal break-words">
			<slot name="content">
				<span class="text-start text-muted text-sm">
					<span>{{ content }}</span>
				</span>
			</slot>
		</div>
		<slot name="buttons">
			<button v-if="showRetryButton" class="btn btn-info btn-soft btn-transition" @click.prevent="$emit('retry')">
				{{ $t('components.globalComponents.state.tryAgain') }}
			</button>
		</slot>
	</div>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		imgUrl: {
			type: String,
		},
		showRetryButton: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: '',
		},
		content: {
			type: String,
			default: '',
		},
	},
	emits: ['retry'],
}
</script>
