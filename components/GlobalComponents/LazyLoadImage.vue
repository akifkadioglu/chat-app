<template>
	<LazyHydrationWrapper when-visible>
		<img ref="imageWrapper" :class="className" :src="src" alt="" loading="lazy" v-bind="$attrs" v-img-error />
	</LazyHydrationWrapper>
</template>

<script>
import { LazyHydrationWrapper } from 'vue3-lazy-hydration'

export default {
	components: {
		LazyHydrationWrapper,
	},
	props: {
		src: {
			type: String,
			required: true,
		},
		defaultSrc: {
			type: String,
			default: '/lazy-preloader.png',
		},
		className: {
			type: String,
			default: '',
		},
		defaultClassName: {
			type: String,
			default: 'w-3rem',
		},
	},
	data() {
		return {
			usingSrc: this.defaultSrc,
			usingClassName: this.defaultClassName,
		}
	},
	// watch: {
	//   src (val) {
	//     this.usingSrc = val ?? this.defaultSrc
	//   }
	// },
	// mounted () {
	//   const el = this.$refs.imageWrapper
	//   if (!el) {
	//     return
	//   }
	//
	//   const observer = new IntersectionObserver((entries) => {
	//     entries.forEach((entry) => {
	//       // consoleLog(entry)
	//       if (entry.isIntersecting) {
	//         this.usingSrc = ''
	//         this.$nextTick(() => {
	//           this.usingSrc = this.src ?? this.defaultSrc
	//           this.usingClassName = this.className ?? this.defaultClassName
	//         })
	//         observer.disconnect()
	//       }
	//     })
	//   })
	//   observer.observe(el)
	// }
}
</script>
