<template>
	<div v-if="hasFiles" class="bg-subtle rounded-lg rounded-b-none p-2 space-y-2 max-h-32 overflow-y-auto">
		<!-- Images Section -->
		<div v-if="images.length > 0">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">{{ images.length }} resim seçildi</span>
				<button @click="removeAllImages" class="btn btn-ghost btn-xs">
					<i class="fa fa-trash" />
					Tümünü Sil
				</button>
			</div>
			<div class="space-y-1">
				<FilePreviewsElement
					iconClass="fa fa-image"
					v-for="(image, index) in images"
					:file="image"
					@remove="removeImage(index)"
				/>
			</div>
		</div>

		<!-- Audio Section -->
		<div v-if="hasAudio">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Ses dosyası seçildi</span>
			</div>
			<FilePreviewsElement :file="audio" @remove="removeAudio" iconClass="fa fa-music" />
		</div>

		<!-- Files Section -->
		<div v-if="files.length > 0">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">{{ files.length }} dosya seçildi</span>
				<button @click="removeAllFiles" class="btn btn-ghost btn-xs">
					<i class="fa fa-trash" />
					Tümünü Sil
				</button>
			</div>
			<div class="space-y-1">
				<FilePreviewsElement
					:iconClass="getFileIcon(file.fileType)"
					v-for="(file, index) in files"
					:key="index"
					:file="file"
					@remove="removeFile(index)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import FilePreviewsElement from '~/components/Chat/Content/MessageInput/FilePreviewsElement.vue'
import { formatFileSize, getFileIcon } from '~/helpers/fileUploadFunctions.js'

export default {
	name: 'FilePreviews',
	components: { FilePreviewsElement },
	props: {
		images: {
			type: Array,
			default: () => [],
		},
		audio: {
			type: Object,
			default: () => ({}),
		},
		files: {
			type: Array,
			default: () => [],
		},
	},
	emits: ['update:images', 'update:audio', 'update:files'],
	computed: {
		hasFiles() {
			return this.images.length > 0 || this.hasAudio || this.files.length > 0
		},
		hasAudio() {
			return this.audio && Object.keys(this.audio).length > 0
		},
	},
	methods: {
		formatFileSize,
		removeImage(index) {
			this.$emit(
				'update:images',
				this.images.filter((_, i) => i !== index),
			)
		},
		removeAllImages() {
			this.$emit('update:images', [])
		},
		removeAudio() {
			this.$emit('update:audio', {})
		},
		removeFile(index) {
			this.$emit(
				'update:files',
				this.files.filter((_, i) => i !== index),
			)
		},
		removeAllFiles() {
			this.$emit('update:files', [])
		},
		getFileIcon,
	},
}
</script>

<style scoped></style>
