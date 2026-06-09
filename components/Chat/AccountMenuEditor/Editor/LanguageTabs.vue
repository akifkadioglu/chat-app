<template>
	<div class="flex">
		<div role="tablist" class="flex tabs-lift overflow-x-scroll">
			<a
				v-for="menuItem in messengerProfileActions"
				:key="menuItem.locale"
				role="tab"
				@click="this.$emit('update:selectedLocale', menuItem.locale)"
				class="tab gap-1 !pt-2"
				:class="{ 'tab-active': selectedLocale === menuItem.locale }"
			>
				<span class="flex items-center gap-1 w-max" :class="{ 'text-error': errorLocales.includes(menuItem.locale) }">
					<LanguageFlag size="20" :code="menuItem.locale !== 'default' ? menuItem.locale : 'simpliers'" />
					<LanguageName :code="menuItem.locale !== 'default' ? menuItem.locale : 'simpliers'">
						<template v-if="menuItem.locale === 'default'" #langName>
							<span>{{ $t('components.chat.accountMenuEditor.languageTabs.default') }}</span>
						</template>
					</LanguageName>
					<i v-if="errorLocales.includes(menuItem.locale)" class="fa fa-exclamation-circle" />
				</span>
			</a>
		</div>
		<span class="grow border-[0.5px] border-t-0 h-px border-base-300 mt-10"></span>

		<CustomDropdown>
			<slot name="triggerButton">
				<button
					class="btn btn-sm btn-ghost my-1"
					:disabled="availableLanguages.length + 1 === messengerProfileActions.length"
				>
					<i class="fa fa-plus" />
				</button>
			</slot>
			<template #popper="{ shown, hide }">
				<div class="w-max bg-base-100 shadow-xl">
					<ul class="menu bg-base-100 p-2" @click="hide">
						<li
							v-for="lang in availableLanguages"
							:key="lang.code"
							class="w-max"
							:class="{
								'opacity-50 ': callToActionLocales.includes(lang.locale),
							}"
						>
							<a
								@click="addLocale(lang.locale)"
								:class="{ 'cursor-default ': callToActionLocales.includes(lang.locale) }"
							>
								<LanguageFlag size="20" :code="lang.code" />
								<LanguageName :code="lang.code" />
							</a>
						</li>
					</ul>
				</div>
			</template>
		</CustomDropdown>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default defineComponent({
	name: 'LanguageTabs',
	components: { CustomDropdown, LanguageName, LanguageFlag },
	props: {
		errorLocales: {
			type: Array,
		},
		messengerProfileActions: {
			type: Array,
			required: true,
		},
		selectedLocale: {
			type: String,
			required: true,
		},
		isError: {
			type: Boolean,
			default: false,
		},
		availableLanguages: {
			type: Array,
			required: true,
		},
	},
	emits: ['update:selectedLocale', 'add-locale'],
	data() {
		return {
			errors: [],
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	computed: {
		callToActionLocales() {
			return this.messengerProfileActions.map((menu) => menu.locale)
		},
	},
	methods: {
		addLocale(locale: string) {
			if (this.callToActionLocales.includes(locale)) return
			this.$emit('add-locale', locale)
		},
	},
})
</script>
