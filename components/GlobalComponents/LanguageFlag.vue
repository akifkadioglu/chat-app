<template>
	<nuxt-img
		:src="getFlag()"
		:alt="code"
		:style="{ width: size + 'px', height: size + 'px' }"
		class="inline-block align-middle rounded-full object-cover"
		loading="lazy"
		format="svg"
	/>
</template>
<script>
export default {
	name: 'LanguageFlag',
	props: {
		code: {
			type: String,
			default() {
				return 'simpliers'
			},
		},
		size: {
			type: String,
			default() {
				return '20'
			},
		},
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			country: this.sessionStore.country,
		}
	},
	methods: {
		getFlag() {
			if (this.code === 'simpliers') {
				return '/images/icon.png'
			}
			const locale = this.code.split('_')[0]
			if (this.country === 'BR' && locale === 'pt') return '/images/flags/br.svg'
			if (this.country === 'AR' && locale === 'es') return '/images/flags/ar.svg'
			if (this.country === 'CO' && locale === 'es') return '/images/flags/co.svg'
			if (this.country === 'CL' && locale === 'es') return '/images/flags/cl.svg'
			if (this.country === 'MX' && locale === 'es') return '/images/flags/mx.svg'
			if (this.country === 'GB' && locale === 'en') return '/images/flags/gb.svg'
			return `/images/flags/${locale || 'en'}.svg`
		},
	},
}
</script>
<style scoped></style>
