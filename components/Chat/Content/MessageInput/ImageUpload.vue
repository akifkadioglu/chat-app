<template>
	<!-- Image Button -->
	<div>
		<input
			:disabled="disabled"
			ref="imageInput"
			type="file"
			accept="image/*"
			multiple
			@change="handleImageSelect"
			class="hidden"
		/>
		<button
			@click.stop="$refs.imageInput.click()"
			class="btn btn-ghost"
			:class="{ 'btn-primary': selectedImages.length > 0 }"
			:disabled="disabled || isProcessing"
		>
			<LoadingElement :isLoading="isProcessing">
				<i class="fa fa-image" />
			</LoadingElement>
		</button>
	</div>
</template>

<script>
import { processImageFile } from '~/helpers/fileUploadFunctions.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		modelValue: {
			type: Array,
			default: () => [],
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			selectedImages: [],
			isProcessing: false,
		}
	},
	watch: {
		selectedImages: {
			deep: true,
			handler(newValue) {
				this.$emit('update:modelValue', newValue)
			},
		},
		modelValue: {
			deep: true,
			handler(newValue) {
				if (JSON.stringify(newValue) !== JSON.stringify(this.selectedImages)) {
					this.selectedImages = newValue
				}
			},
		},
	},
	methods: {
		async handleImageSelect(event) {
			const files = Array.from(event.target.files)
			this.isProcessing = true
			for (const file of files) {
				const imageData = await processImageFile(file, this.$requestAdapter)
				if (imageData) {
					this.selectedImages.push(imageData)
				}
			}
			this.isProcessing = false

			// Reset input
			event.target.value = ''
		},
	},
}
</script>

<style scoped></style>
