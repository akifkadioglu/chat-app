<template>
	<div
		class="flex items-center gap-3 bg-base-200 rounded-lg p-3 max-w-xs hover:bg-base-300 transition-colors cursor-pointer"
		@click="downloadFile"
	>
		<!-- File Icon -->
		<div class="flex-shrink-0">
			<div class="w-10 h-10 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center">
				<i :class="getFileIcon()" class="text-lg" />
			</div>
		</div>

		<!-- File Info -->
		<div class="flex-1 min-w-0">
			<div class="text-sm font-medium text-base-content truncate">
				{{ attachment.fileName || $t('components.chat.content.messageTypes.filePreview.defaultFilename') }}
			</div>
			<div class="text-xs text-base-content opacity-60 flex items-center gap-2">
				<span v-if="attachment.fileSize">
					{{ formatFileSize(attachment.fileSize) }}
				</span>
				<span v-if="getFileExtension()" class="uppercase">
					{{ getFileExtension() }}
				</span>
			</div>
		</div>

		<!-- Download Icon -->
		<div class="flex-shrink-0 text-base-content opacity-50 hover:opacity-100 transition-opacity">
			<i class="fa fa-download"></i>
		</div>
	</div>
</template>

<script lang="ts">
import { formatFileSize } from '~/helpers/fileUploadFunctions'

export default {
	name: 'FilePreview',
	props: {
		attachment: {
			type: Object,
			required: true,
		},
	},
	methods: {
		formatFileSize,
		getFileExtension(): string {
			if (!this.attachment.fileName) return ''
			const parts = this.attachment.fileName.split('.')
			return parts.length > 1 ? parts[parts.length - 1] : ''
		},
		getFileIcon(): string {
			const extension = this.getFileExtension().toLowerCase()

			// Document types
			if (['pdf'].includes(extension)) return 'fa fa-file-pdf'
			if (['doc', 'docx'].includes(extension)) return 'fa fa-file-word'
			if (['xls', 'xlsx'].includes(extension)) return 'fa fa-file-excel'
			if (['ppt', 'pptx'].includes(extension)) return 'fa fa-file-powerpoint'
			if (['txt'].includes(extension)) return 'fa fa-file-text'

			// Archive types
			if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'fa fa-file-archive'

			// Code types
			if (['js', 'ts', 'html', 'css', 'json', 'xml', 'php', 'py', 'java', 'cpp', 'c'].includes(extension))
				return 'fa fa-file-code'

			// Default
			return 'fa fa-file'
		},
		downloadFile() {
			if (this.attachment.url) {
				const link = document.createElement('a')
				link.href = this.attachment.url
				link.download = this.attachment.fileName || 'download'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			}
		},
	},
}
</script>
