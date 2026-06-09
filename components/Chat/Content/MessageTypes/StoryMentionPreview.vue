<template>
	<div class="bg-base-100 rounded-lg shadow-sm border border-base-300 max-w-xs overflow-hidden min-w-60">
		<!-- Story Preview -->
		<div class="relative aspect-[9/16] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
			<ImageVideoPreview
				v-if="attachment.url"
				:src="attachment.url"
				alt=""
				video-class="w-full h-full object-cover"
				image-class="w-full h-full object-cover"
			/>

			<!-- Instagram Story Badge -->
			<div class="absolute top-2 left-2">
				<div class="bg-black bg-opacity-50 rounded-full px-2 py-1 flex items-center gap-1">
					<i class="fab fa-instagram text-white text-xs"></i>
					<span class="text-white text-xs font-medium">Story</span>
				</div>
			</div>

			<!-- Mention indicator -->
			<div class="absolute bottom-2 right-2">
				<div class="bg-purple-500 rounded-full p-1.5">
					<i class="fa fa-at text-white text-xs" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import ImageVideoPreview from './ImageVideoPreview.vue'

export default {
	name: 'StoryMentionPreview',
	components: {
		ImageVideoPreview,
	},
	props: {
		attachment: {
			type: Object,
			required: true,
		},
	},
}
</script>
