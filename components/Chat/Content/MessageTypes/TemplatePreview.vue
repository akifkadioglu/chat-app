<template>
	<div>
		<!-- generic template -->
		<div class="overflow-x-auto" v-if="elements && elements.length > 0">
			<div class="flex gap-2">
				<div v-for="element in elements" class="snap-start flex-shrink-0 w-44">
					<NuxtImg
						v-if="element.image_url"
						custom
						:src="element.image_url"
						:alt="element.title"
						class="object-cover w-full aspect-square"
						v-slot="{ imgAttrs, isLoaded }"
					>
						<div
							class="relative w-full aspect-square flex items-center justify-center bg-base-200 rounded-lg overflow-hidden"
						>
							<i v-if="!isLoaded" class="fa fa-image text-gray-400 text-lg absolute" />
							<img
								@error="(e) => (e.target.style.display = 'none')"
								v-bind="imgAttrs"
								class="object-cover w-full h-full"
							/>
						</div>
					</NuxtImg>
					<div class="mt-2">
						{{ element.title }}
					</div>
					<div class="text-xs opacity-70">
						{{ element.subtitle }}
					</div>
					<div class="space-y-1 mt-2">
						<button
							v-for="button in element.buttons"
							class="w-full text-center bg-base-100/20 p-1.5 rounded-lg opacity-70 text-xs truncate"
						>
							{{ button.title }}
						</button>
					</div>
				</div>
			</div>
		</div>
		<div v-else>
			<!-- button template -->
			{{ attachment.text }}
			<div class="space-y-1 py-1">
				<button
					v-for="button in attachment.buttons"
					class="w-full text-center bg-base-100/20 p-2 rounded-lg opacity-50"
				>
					{{ button.title }}
				</button>
			</div>
		</div>
	</div>
</template>
<script>
import ImagePreview from '~/components/Chat/Content/MessageTypes/ImagePreview.vue'

export default {
	name: 'TemplatePreview',
	components: { ImagePreview },
	props: {
		attachment: {
			type: Object,
		},
	},
	computed: {
		elements() {
			return this.attachment?.generic?.elements ?? this.attachment?.elements ?? []
		},
	},
}
</script>
<style scoped></style>
