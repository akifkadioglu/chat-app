<template>
	<button
		:disabled="isLoading"
		class="btn"
		:class="{
			'btn-error btn-soft': hasError,
			'btn-primary btn-soft': !hasError,
		}"
		@click="$emit('save')"
	>
		<loading-element :is-loading="isLoading" size="15">
			<i v-if="hasError" class="fa fa-redo" />
			<i v-else class="fa fa-save" />
		</loading-element>
		<span v-if="hasError"> {{ reloadText || $t('components.accounts.settingsTab.saveButton.tryAgain') }}</span>
		<span v-else>{{ saveText || $t('components.accounts.settingsTab.saveButton.save') }}</span>
	</button>
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	props: {
		isLoading: {
			type: Boolean,
			default: false,
		},
		hasError: {
			type: Boolean,
			default: false,
		},
		saveText: {
			type: String,
		},
		reloadText: {
			type: String,
		},
	},
	components: { LoadingElement },
}
</script>

<style scoped></style>
