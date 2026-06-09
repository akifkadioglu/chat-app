<template>
	<div v-bind="containerProps" class="relative overflow-auto">
		<div v-bind="wrapperProps" class="w-full">
			<slot :list="list" />
			<slot name="pagination" />
		</div>
	</div>
</template>

<script>
import { useVirtualList } from '@vueuse/core'
import { ref, watch, toRef } from 'vue'

export default {
	props: {
		list: Array,
		itemHeight: {
			type: Number,
			default: 48.5,
		},
		overscan: {
			type: Number,
			default: 20,
		},
	},
	setup(props, { expose }) {
		const getContentContainer = inject('getContentContainer')
		const reactiveList = toRef(props, 'list')

		const { list, containerProps, wrapperProps } = useVirtualList(reactiveList, {
			itemHeight: props.itemHeight,
			overscan: props.overscan,
		})

		watch(
			() => props.list,
			() => {
				containerProps.ref?.scrollTo?.(0, 0)
			},
		)
		expose({
			async scrollToTop() {
				//TODO :: scroll işe yaramıyor
				setTimeout(() => {
					const el = getContentContainer?.()
					if (el) {
						el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
					}
				}, 250)
			},
		})

		return { list, containerProps, wrapperProps }
	},
}
</script>
