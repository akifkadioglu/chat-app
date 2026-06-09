<template>
	<CustomDropdown class="w-min" :class="dropdownClass">
		<button type="button" class="btn btn-xs btn-info btn-soft shadow-lg">
			<i class="fa fa-language fa-lg" />
			<i class="fa fa-chevron-down fa-xs" />
		</button>
		<template #popper="{ hide }">
			<ul class="menu">
				<li v-for="lang in locales" :key="lang.locale">
					<a :class="{ 'bg-base-200': modelValue === lang.locale }" @click="select(lang.locale, hide)">
						{{ lang.name }}
					</a>
				</li>
			</ul>
		</template>
	</CustomDropdown>
</template>

<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import { customizeLocale } from '~/helpers/availableLanguages.js'

export default {
	name: 'SignatureLanguagePicker',
	components: { CustomDropdown },
	props: {
		modelValue: {
			type: String,
			default: null,
		},
		dropdownClass: {
			type: String,
			default: '',
		},
	},
	emits: ['update:modelValue'],
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	data() {
		return {
			locales: customizeLocale(this.sessionStore.data.country),
		}
	},
	methods: {
		select(locale, hide) {
			this.$emit('update:modelValue', locale)
			hide()
		},
	},
}
</script>
