<template>
	<LocalizedLink
		class="menu-link"
		:class="responsiveClasses"
		:to="to"
		:name="name"
		:title="title"
		:external="external"
		:target="target"
	>
		<slot />
	</LocalizedLink>
</template>

<script>
import LocalizedLink from '@/components/GlobalComponents/LocalizedLink'

export default {
	components: {
		LocalizedLink,
	},
	props: {
		name: {
			type: String,
		},
		title: {
			type: String,
			default: '',
		},
		breakpoint: {
			type: String,
			default: 'md',
			validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(value),
		},
		to: {
			type: String,
		},
		external: {
			type: Boolean,
			default: false,
		},
		target: {
			type: String,
			default: '',
		},
	},
	computed: {
		responsiveClasses() {
			const map = {
				sm: 'sm:px-2 sm:py-2',
				md: 'md:px-2 md:py-2',
				lg: 'lg:px-2 lg:py-2',
				xl: 'xl:px-2 xl:py-2',
				'2xl': '2xl:px-2 2xl:py-2',
			}
			return map[this.breakpoint] || map.md
		},
	},
}
</script>
