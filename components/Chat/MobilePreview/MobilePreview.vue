<!-- IPHONE 15 -->
<template>
	<div
		:style="{
			maxHeight: 851 * scaleValue + 'px',
			maxWidth: 393 * scaleValue + 'px',
			transform: `scale(${scaleValue})`,
			transformOrigin: 'top left',
		}"
	>
		<div
			class="mockup-phone font-instagram mx-auto border-zinc-700"
			:style="{
				width: '393px',
				height: '851px',
				borderRadius: '60px',
			}"
		>
			<div class="mockup-phone-camera"></div>
			<div class="mockup-phone-display w-full relative" style="border-radius: 60px">
				<div :class="[screenBgColorClass, { 'opacity-40': lowOpacity }]" class="absolute inset-0 z-0">
					<div class="h-full flex flex-col">
						<div class="flex items-center justify-between p-3 border-secondary z-1" :class="statusBarClass">
							<span class="px-5">
								<Time />
							</span>
							<span class="flex gap-2 px-2">
								<CecularConection />
								<Wifi />
								<Battery />
							</span>
						</div>
						<!--						<div class="h-full z-1">-->
						<slot name="screen" />
						<!--						</div>-->
					</div>
				</div>

				<div class="absolute z-1 bottom-0 max-h-150 w-full overflow-y-auto overflow-x-hidden" v-auto-animate>
					<slot name="options" />
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import CecularConection from '~/components/MobilePreviewComponents/CecularConection.vue'
import Wifi from '~/components/MobilePreviewComponents/Wifi.vue'
import Battery from '~/components/MobilePreviewComponents/Battery.vue'
import Time from '~/components/MobilePreviewComponents/Time.vue'

export default defineComponent({
	components: { Time, Battery, Wifi, CecularConection, IsVerifiedImg },
	props: {
		lowOpacity: {
			type: Boolean,
		},
		scale: {
			type: Number,
			default: null,
		},
		width: {
			type: Number,
			default: null,
		},
		screenBgColorClass: {
			type: String,
			default: 'dark:bg-black bg-white',
		},
		statusBarClass: {
			type: String,
			default: '',
		},
	},
	computed: {
		scaleValue(): number {
			if (this.scale !== null) {
				return this.scale
			}
			if (this.width !== null) {
				return this.width / 393
			}
			return 0.6
		},
	},
})
</script>

<style scoped>
button {
	cursor: default;
}

.font-instagram {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.font-instagram *:not([class*='fa']):not(i[class*='fa']) {
	font-family: inherit;
}
</style>
