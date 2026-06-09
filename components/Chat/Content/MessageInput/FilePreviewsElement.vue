<template>
	<div class="flex items-center gap-2 p-1 bg-base-100 rounded" :class="{ 'opacity-60': file.uploading }">
		<div class="avatar">
			<div class="w-8 h-8 rounded flex items-center justify-center relative">
				<template v-if="file.preview">
					<img :src="file.preview" alt="Selected image" class="object-cover" />
				</template>
				<template v-else>
					<i :class="iconClass" />
				</template>
				<!-- Upload Loading -->
				<div v-if="file.uploading" class="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
					<span class="loading loading-spinner loading-xs text-white"></span>
				</div>
				<!-- Upload Error -->
				<div v-else-if="file.error" class="absolute -top-1 -right-1">
					<i class="fa fa-exclamation-circle text-error text-xs"></i>
				</div>
			</div>
		</div>
		<div class="flex-1 min-w-0">
			<div class="text-xs font-medium truncate">{{ file.file.name }}</div>
			<div class="text-xs text-base-content/70">
				<span>{{ formatFileSize(file.file.size) }}</span>
				<span v-if="file.uploading" class="ml-1">• Yükleniyor...</span>
				<span v-else-if="file.cloudUrl" class="ml-1 text-success">• Hazır</span>
				<span v-else-if="file.error" class="ml-1 text-error">• Hata: {{ file.error }}</span>
			</div>
		</div>
		<button @click="$emit('remove')" class="btn btn-ghost btn-xs btn-circle">
			<i class="fa fa-times" />
		</button>
	</div>
</template>
<script>
import { formatFileSize } from '~/helpers/fileUploadFunctions.js'

export default {
	props: {
		file: {
			type: Object,
			required: true,
		},
		iconClass: {
			type: String,
			default: 'fa fa-image',
		},
	},
	methods: {
		formatFileSize,
	},
}
</script>

<style scoped></style>
