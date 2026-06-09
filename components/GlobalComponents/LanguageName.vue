<template>
	<span>
		<slot name="langName" />
		<span v-if="!$slots.langName">
			<span>{{ name }}</span>
		</span>
	</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { availableLanguages } from '~/helpers/availableLanguages'

export default defineComponent({
	name: 'LanguageName',
	props: {
		code: {
			default() {
				return 'en'
			},
		},
	},
	computed: {
		name() {
			const isoCode = this.code.split('_')[0]
			const lang = availableLanguages.find((lang) => lang.code.startsWith(isoCode))?.name
			return lang || this.code
		},
	},
})
</script>

<style scoped></style>
