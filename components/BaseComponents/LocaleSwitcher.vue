<template>
	<NativeDropdown placement="top-end">
		<button class="gap-2" :class="btnClass">
			<NuxtImg
				:src="getFlag($i18n.locale)"
				:alt="'simpliers ' + $i18n.locale"
				class="w-4 h-4 rounded-full object-cover shadow"
				loading="lazy"
				format="webp"
			/>
			<span v-if="showActiveLocaleName" class="notranslate">{{ localeName }}</span>
			<i class="fa fa-chevron-down text-xs ml-1"></i>
		</button>
		<template #popper="{ shown, hide }">
			<ul
				tabindex="0"
				class="dropdown-content space-y-2 menu bg-base-100 rounded-lg border border-base-300 shadow pt-4 w-48 z-999"
			>
				<li v-for="locale in $i18n.locales.value" :key="locale.code" @click="hide">
					<localized-link
						v-if="switchLocalePath(locale.code)"
						:to="switchLocalePath(locale.code)"
						class="flex items-center gap-2 px-3 py-2 text-sm"
					>
						<nuxt-img
							:src="getFlag(locale.code)"
							:alt="'simpliers ' + locale.code"
							class="w-6 h-6 rounded-full object-cover"
							loading="lazy"
							format="webp"
						/>
						<span class="notranslate">{{ locale.name }}</span>
					</localized-link>
				</li>
			</ul>
		</template>
	</NativeDropdown>
</template>

<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import NativeDropdown from '~/components/GlobalComponents/NativeDropdown.vue'

export default {
	name: 'LocaleSwitcher',
	components: { NativeDropdown, CustomDropdown, LocalizedLink },
	props: {
		showActiveLocaleName: {
			type: Boolean,
			default: true,
		},
		btnClass: {
			type: String,
			default: 'btn rounded-lg',
		},
	},
	computed: {
		localeName() {
			return this.$i18n.locales.value.find((locale) => locale.code === this.$i18n.locale)?.name
		},
	},
	methods: {
		getFlag(locale) {
			const country = this.sessionStore.country
			if (country === 'BR' && locale === 'pt') return '/images/flags/br.svg'
			if (country === 'AR' && locale === 'es') return '/images/flags/ar.svg'
			if (country === 'CO' && locale === 'es') return '/images/flags/co.svg'
			if (country === 'CL' && locale === 'es') return '/images/flags/cl.svg'
			if (country === 'MX' && locale === 'es') return '/images/flags/mx.svg'
			if (country === 'GB' && locale === 'en') return '/images/flags/gb.svg'
			return `/images/flags/${locale}.svg`
		},
	},
	setup() {
		return {
			switchLocalePath: useSwitchLocalePath(),
			sessionStore: useSessionStore(),
		}
	},
}
</script>
