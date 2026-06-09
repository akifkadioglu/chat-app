<template>
	<div
		class="cursor-pointer flex gap-1 items-center"
		:class="{ 'inline-flex': inline }"
		@click.prevent="copyToClipBoard"
	>
		<slot :copied="copied" />
		<LoadingElement :isLoading="isLoading" :size="loadingSize">
			<transition name="flipx" enter-active-class="animate__animated animate__flipInX" mode="out-in">
				<span v-if="copied" key="copied">
					<slot name="copied" :copied="copied">
						<i class="fa fa-check fa-sm" />
					</slot>
				</span>
				<span v-else key="click">
					<slot name="icon" :copied="copied">
						<i class="fa fa-copy fa-sm" />
					</slot>
				</span>
			</transition>
		</LoadingElement>
		<slot name="trailing" :copied="copied" />
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement },
	props: {
		copyText: {
			type: String,
			required: true,
		},
		inline: {
			type: Boolean,
			default: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		loadingSize: {
			type: Number,
			default: 16,
		},
	},
	data() {
		return {
			copied: false,
		}
	},
	methods: {
		copyToClipBoard() {
			this.copied = true
			this.$emit('copied', this.copyText)
			navigator.clipboard?.writeText(this.copyText)
			setTimeout(() => {
				this.copied = false
			}, 1000)
		},
	},
}
</script>

<style scoped></style>
