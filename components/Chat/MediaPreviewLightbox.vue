<template>
	<ClientOnly>
		<vue-easy-lightbox :visible="visible" :imgs="[mediaUrl]" @hide="visible = false" />
	</ClientOnly>
</template>

<script>
import SimpliersLogo from '~/components/GlobalComponents/Brands/SimpliersLogo.vue'
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
	components: {
		VueEasyLightbox,
		SimpliersLogo,
	},
	data() {
		return {
			mediaUrl: '',
			visible: false,
		}
	},
	mounted() {
		this.$emitter.on('showMediaPreviewLightbox', (attrs) => {
			this.mediaUrl = attrs?.url || attrs?.mediaUrl || ''
			this.mediaType = attrs?.type || attrs?.mediaType || ''
			this.visible = true
		})

		this.$emitter.on('hideMediaPreviewLightbox', () => {
			this.visible = false
		})
	},
}
</script>
