<template>
	<!-- File Button -->
	<div>
		<input
			:disabled="disabled"
			ref="fileInput"
			type="file"
			accept=".pdf"
			multiple
			@change="handleFileSelect"
			class="hidden"
		/>
		<button
			@click.stop="$refs.fileInput.click()"
			class="btn btn-ghost"
			:class="{ 'btn-primary': selectedFiles.length > 0 }"
			:disabled="disabled || isProcessing"
		>
			<LoadingElement :isLoading="isProcessing">
				<i class="fa fa-file-pdf" />
			</LoadingElement>
		</button>
	</div>
</template>

<script>
import { processFile } from '~/helpers/fileUploadFunctions.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	name: 'FileUpload',
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
			selectedFiles: [],
			isProcessing: false,
		}
	},
	watch: {
		selectedFiles: {
			deep: true,
			handler(newValue) {
				this.$emit('update:modelValue', newValue)
			},
		},
		modelValue: {
			deep: true,
			handler(newValue) {
				if (JSON.stringify(newValue) !== JSON.stringify(this.selectedFiles)) {
					this.selectedFiles = newValue
				}
			},
		},
	},
	methods: {
		async handleFileSelect(event) {
			const files = Array.from(event.target.files)
			this.isProcessing = true
			for (const file of files) {
				const fileData = await processFile(file, this.$requestAdapter)
				if (fileData) {
					this.selectedFiles.push(fileData)
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
