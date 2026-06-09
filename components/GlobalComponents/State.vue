<template>
	<div v-if="isLoading" class="h-full w-full">
		<slot name="loading">
			<div class="flex items-center justify-center h-full">
				<LoadingElement />
			</div>
		</slot>
	</div>
	<div v-else-if="isError" class="h-full w-full">
		<slot name="error">
			<div class="flex items-center justify-center h-full">
				<StateElement :title="errorTitle" :content="errorContent" :img-url="errorImgUrl">
					<template #icon v-if="$slots.errorIcon">
						<i class="fa fa-exclamation-triangle text-2xl" />
					</template>
					<template #title v-if="$slots.errorTitle">
						<slot name="errorTitle" />
					</template>
					<template #content v-if="$slots.errorContent">
						<slot name="errorContent" />
					</template>
					<template #img v-if="$slots.errorImg">
						<slot name="errorImg" />
					</template>
					<template #buttons v-if="$slots.errorButtons">
						<slot name="errorButtons" />
					</template>
				</StateElement>
			</div>
		</slot>
	</div>
	<div v-else-if="isEmpty" class="h-full w-full">
		<slot name="empty">
			<div class="flex items-center justify-center h-full w-full">
				<StateElement
					:title="emptyTitle"
					:content="emptyContent"
					:img-url="emptyImgUrl"
					:show-retry-button="showRetryButton"
					@retry="$emit('retry')"
				>
					<template #title v-if="$slots.emptyTitle">
						<slot name="emptyTitle" />
					</template>
					<template #content v-if="$slots.emptyContent">
						<slot name="emptyContent" />
					</template>
					<template #img v-if="$slots.emptyImg">
						<slot name="emptyImg" />
					</template>
					<template #icon v-if="$slots.emptyIcon">
						<slot name="emptyIcon" />
					</template>
					<template #buttons v-if="$slots.emptyButtons">
						<slot name="emptyButtons" />
					</template>
				</StateElement>
			</div>
		</slot>
	</div>
	<slot v-else />
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'

export default {
	components: { StateElement, LoadingElement },
	props: {
		isLoading: {
			type: Boolean,
			default: false,
		},
		isEmpty: {
			type: Boolean,
			default: false,
		},
		isError: {
			type: Boolean,
			default: false,
		},

		emptyTitle: {
			type: String,
		},
		emptyContent: {
			type: String,
		},
		emptyImgUrl: {
			type: String,
			default: '/images/empty.png',
		},
		showRetryButton: {
			type: Boolean,
			default: false,
		},

		errorTitle: {
			type: String,
		},
		errorContent: {
			type: String,
		},
		errorImgUrl: {
			type: String,
		},
	},
	emits: ['retry'],
}
</script>
<style scoped></style>
