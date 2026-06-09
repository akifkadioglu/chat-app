<template>
	<div class="mb-4">
		<TagSetter :newTag="newTag" @createTag="createTag" :isLoading="isLoading" />
	</div>
</template>
<script>
import TagCreatorColorPicker from '~/components/Chat/ContactInfo/Partials/TagCreatorColorPicker.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import TagSetter from '~/components/Chat/ContactInfo/Partials/TagSetter.vue'

export default {
	components: { TagSetter, LoadingElement, TagCreatorColorPicker },
	props: {
		newTag: {
			type: Object,
			required: true,
		},
		chatAccountId: {
			type: Number,
			required: true,
		},
	},
	setup() {
		return {
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			isLoading: false,
		}
	},
	methods: {
		async createTag() {
			if (this.newTag.name && this.newTag.color) {
				this.isLoading = true
				await this.chatAccountAttributesStore
					.createTagRequest(this.chatAccountId, {
						name: this.newTag.name,
						color: this.newTag.color,
					})
					.then((tag) => {
						this.$emit('tagCreated', tag)
					})
					.catch((err) => {
						consoleLog('Create tag error:', err)
					})
					.finally(() => {
						this.isLoading = false
					})
			}
		},
	},
}
</script>

<style scoped></style>
