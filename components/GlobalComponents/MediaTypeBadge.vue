<template>
	<div class="flex items-center gap-1">
		<span
			v-if="isAd"
			class="bg-white text-black font-semibold px-1.5 py-0.5 rounded text-[10px] leading-none shadow"
		>AD</span>
		<div class="bg-black/60 text-white px-1 py-0.5 rounded text-xs">
			<i v-if="mediaType === 'VIDEO'" class="fa fa-play" />
			<i v-else-if="mediaType === 'CAROUSEL_ALBUM'" class="fa fa-images" />
			<i v-else class="fa fa-image" />
		</div>
	</div>
</template>
<script>
export default {
	name: 'MediaTypeBadge',
	props: {
		mediaType: {
			type: String,
			default: 'IMAGE',
		},
		mediaProductType: {
			type: String,
			default: '',
		},
	},
	computed: {
		isAd() {
			return this.mediaProductType === 'AD'
		},
	},
}
</script>
