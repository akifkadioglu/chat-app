<template>
	<div class="space-y-2" v-for="(content, index) in config?.contents" :key="content.id">
		<MessageBubble
			v-if="content.type === 'text'"
			type="text"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<span class="whitespace-pre-wrap">
				{{ content.text?.trim() || $t('components.flow.messageContentList.writeMessage') }}
			</span>
			<div class="mt-2 space-y-2 w-full" v-for="button in content.buttons" :key="button.id">
				<button class="bg-base-100/20 px-5 py-3 min-w-40 w-full rounded-lg text-center">
					{{ button.text?.trim().length > 0 ? button.text : $t('components.flow.messageContentList.buttonText') }}
				</button>
			</div>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'image'"
			type="image"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<nuxt-img v-if="content.image?.url" :src="content.image?.url" class="rounded-xl max-w-75 max-h-50" />
			<div v-else class="bg-zinc-800 p-2 w-full h-50 rounded-lg flex items-center justify-center">
				{{ $t('components.flow.messageContentList.imageArea') }}
			</div>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'audio'"
			type="audio"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<div class="flex items-center gap-1">
				<i class="fa fa-play pe-3" />
				<div
					v-for="i in 10"
					:key="i"
					:style="{ height: `${Math.floor(Math.random() * 24) + 8}px` }"
					class="w-1 bg-white rounded"
				/>
			</div>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'video'"
			type="video"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<video
				v-if="content.video?.url"
				:src="content.video?.url"
				class="w-full rounded-lg object-cover"
				preload="metadata"
				muted
				playsinline
			/>
			<div v-else class="bg-zinc-800 p-2 w-full h-50 rounded-lg flex items-center justify-center">
				{{ $t('components.flow.messageContentList.videoArea') }}
			</div>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'file'"
			type="file"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<div v-if="content.file?.url" class="flex items-center gap-2 py-1">
				<i class="fa fa-file-pdf text-lg" />
				<span class="truncate max-w-40">{{ content.file?.name }}</span>
			</div>
			<div v-else class="flex items-center gap-2 py-1 opacity-50">
				<i class="fa fa-file-pdf text-lg" />
				<span>PDF</span>
			</div>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'dynamic'"
			type="dynamic"
			:compact-message-for-same-direction="isCompactMessage(index)"
		>
			<span class="opacity-50"> {{ $t('components.flow.messageContentList.dynamicContent') }} </span>
		</MessageBubble>

		<MessageBubble
			v-else-if="content.type === 'generic'"
			type="generic"
			:compact-message-for-same-direction="isCompactMessage(index)"
			customBubbleClasses="max-w-full"
		>
			<div class="overflow-x-auto">
				<div class="flex gap-2">
					<div class="shrink-0 w-44" v-for="element in content.elements">
						<div class="aspect-square rounded-lg rounded-b-none overflow-hidden bg-base-200">
							<img v-img-error :src="element.image.url" :alt="element.image.name" class="w-full h-full object-cover" />
						</div>
						<div class="bg-base-200 text-base-content p-2 rounded-b-lg">
							<div>
								{{ element.title?.trim() || $t('components.flow.messageContentList.genericTitle') }}
							</div>
							<div class="text-xs text-base-content opacity-70">
								{{ element.subtitle?.trim() || $t('components.flow.messageContentList.genericSubtitle') }}
							</div>
							<div class="mt-2 space-y-1" v-for="button in element.buttons" :key="button.id">
								<button class="bg-base-100/20 p-1.5 w-full rounded-lg text-center text-xs">
									{{
										button.text?.trim().length > 0 ? button.text : $t('components.flow.messageContentList.buttonText')
									}}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MessageBubble>
	</div>
</template>
<script>
import MessageBubble from '~/components/Flow/MessageBubble.vue'

export default {
	components: { MessageBubble },
	props: {
		config: {
			type: Object,
			default: () => ({}),
		},
	},
	methods: {
		isCompactMessage(index) {
			// İlk mesaj asla compact değil
			if (index === 0) return false

			// Önceki mesaj var mı kontrol et
			const previousContent = this.config?.contents?.[index - 1]
			const currentContent = this.config?.contents?.[index]

			if (!previousContent || !currentContent) return false

			// Flow'da tüm mesajlar aynı yönde (outbound) olduğu için
			// ardışık mesajları compact gösterebiliriz
			return true
		},
	},
}
</script>
<style scoped></style>
