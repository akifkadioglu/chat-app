<template>
	<div class="relative">
		<div
			v-bind="$attrs"
			class="embla relative"
			:class="{
				'pb-13': arrowPlacement === arrowPlacementType.Bottom,
			}"
			ref="viewport"
			@mouseenter="stopAutoplay"
			@mouseleave="startAutoplay"
		>
			<div class="embla__container user-select-none select-none">
				<slot />
			</div>
		</div>
		<!-- TODO :: bu div embla'nın üzerinde olunca autoplay çalışmıyor nedenini anlamadım ama üzerine gideceğim -->
		<div
			v-if="showArrows"
			class="absolute w-full"
			:class="{
				'top-1/2 -mt-5': arrowPlacement === arrowPlacementType.Center,
				'bottom-0': arrowPlacement === arrowPlacementType.Bottom,
			}"
		>
			<div
				class="relative flex items-center gap-2"
				:class="{
					'justify-between': arrowPlacement === 'center',
				}"
			>
				<slot name="removeButton">
					<button
						@click="scrollTo(this.current - 1)"
						:disabled="!options.loop && this.current === 0"
						class="btn bg-base-100 btn-circle"
					>
						<i class="fa fa-chevron-left" />
					</button>
				</slot>
				<slot name="addButton">
					<button @click="scrollTo(this.current + 1)" class="btn bg-base-100 btn-circle">
						<i class="fa fa-chevron-right" />
					</button>
				</slot>
				<slot name="buttonsNearArrows" />
				<div v-if="showDots" class="flex justify-center ml-auto">
					<button @click="scrollTo(elementIndex - 1)" v-for="elementIndex in length">
						<i
							class="fa fa-circle text-xs"
							:class="{
								'text-primary': elementIndex - 1 === current,
								'text-base-200': elementIndex - 1 !== current,
							}"
						/>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import EmblaCarousel from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'

const arrowPlacementType = {
	Center: 'center',
	Bottom: 'bottom',
}
export default {
	props: {
		showArrows: {
			type: Boolean,
			default: false,
		},
		showDots: {
			type: Boolean,
			default: false,
		},
		arrowPlacement: {
			type: String,
			validator: (value) => [arrowPlacementType.Bottom, arrowPlacementType.Center].includes(value),
			default: arrowPlacementType.Center,
		},
		options: {
			type: Object,
			default: () => ({
				loop: true,
				autoplay: false,
				autoplayDelay: 4000,
				align: 'start',
			}),
		},
		// dışarıdan v-model:current
		current: {
			type: Number,
			default: 0,
		},
		length: {
			type: Number,
			default: 0,
		},
	},
	emits: ['update:current'],
	data() {
		return {
			arrowPlacementType,
			embla: null,
			autoplayPlugin: null,
			internalCurrent: this.current,
		}
	},
	watch: {
		current(val) {
			if (this.embla && val !== this.embla.selectedScrollSnap()) {
				this.embla.scrollTo(val)
			}
		},
	},
	methods: {
		initEmbla() {
			const plugins = []
			if (this.options.autoplay) {
				this.autoplayPlugin = Autoplay({
					delay: this.options.autoplayDelay,
					stopOnInteraction: true,
					stopOnMouseEnter: true,
				})
				plugins.push(this.autoplayPlugin)
			}

			this.embla = EmblaCarousel(this.$refs.viewport, this.options, plugins)

			this.embla.on('select', () => {
				const index = this.embla.selectedScrollSnap()
				this.internalCurrent = index
				this.$emit('update:current', index)
			})
			this.embla.scrollTo(this.internalCurrent)
		},

		startAutoplay() {
			this.autoplayPlugin?.play()
		},
		stopAutoplay() {
			this.autoplayPlugin?.stop()
		},

		scrollTo(index) {
			if (!this.embla) return

			const loopEnabled = this.options.loop
			const lastIndex = this.embla.scrollSnapList().length - 1
			let targetIndex = index

			if (!loopEnabled) {
				targetIndex = Math.max(0, Math.min(index, lastIndex))
			}

			if (loopEnabled && index < 0) {
				targetIndex = lastIndex
			}

			if (loopEnabled && index > lastIndex) {
				targetIndex = 0
			}

			this.embla.scrollTo(targetIndex)
			this.internalCurrent = targetIndex
			this.$emit('update:current', targetIndex)
		},
	},
	mounted() {
		this.$nextTick(() => {
			this.initEmbla()
		})
	},
	beforeUnmount() {
		this.embla?.destroy()
	},
}
</script>

<style scoped>
.embla {
	overflow: hidden;
}

.embla__container {
	display: flex;
}
.embla__container > * {
	flex: 0 0 100%;
}
</style>
