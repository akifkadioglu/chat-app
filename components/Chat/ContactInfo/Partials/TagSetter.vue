<template>
	<div class="space-y-2">
		<!-- Tag Name Input -->
		<input
			v-model="newTag.name"
			type="text"
			:placeholder="$t('components.chat.contactInfo.partials.tagSetter.tagNamePlaceholder')"
			class="input input-bordered w-full border-l-5"
			:style="{ borderLeftColor: newTag.color }"
			@keyup.enter="createTag()"
			ref="newTagInput"
		/>

		<!-- Color Picker -->
		<TagCreatorColorPicker :newTag="newTag" />
		<button
			@click="createTag()"
			:disabled="!newTag.name || !newTag.color || isLoading"
			class="btn btn-primary btn-sm w-full"
		>
			<LoadingElement :isLoading="isLoading" size="15">
				<i class="fa fa-plus" />
			</LoadingElement>
			{{ $t('components.chat.contactInfo.partials.tagSetter.createTagButton') }}
		</button>
	</div>
</template>
<script>
import TagCreatorColorPicker from '~/components/Chat/ContactInfo/Partials/TagCreatorColorPicker.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement, TagCreatorColorPicker },
	props: {
		newTag: {
			type: Object,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	mounted() {
		setTimeout(() => {
			if (this.$refs.newTagInput) {
				this.$refs.newTagInput.focus()
			}
		}, 150)
	},
	methods: {
		createTag() {
			this.$emit('createTag')
		},
	},
}
</script>

<style scoped></style>
