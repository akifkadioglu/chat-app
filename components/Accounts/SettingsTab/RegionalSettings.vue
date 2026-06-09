<template>
	<SettingSection :title="$t('components.accounts.settingsTab.regionalSettings.title')" :isLoading="isLoading">
		<SettingsRow
			:title="$t('components.accounts.settingsTab.regionalSettings.timezone.title')"
			:description="$t('components.accounts.settingsTab.regionalSettings.timezone.description')"
		>
			<template #action="{ id }">
				<TimezoneDropdown
					:id="id"
					:selectedTimezone="selectedTimezone"
					@update:selectedTimezone="selectedTimezone = $event"
				/>
			</template>
		</SettingsRow>

		<SettingsRow
			:title="$t('components.accounts.settingsTab.regionalSettings.language.title')"
			:description="$t('components.accounts.settingsTab.regionalSettings.language.description')"
		>
			<template #action="{ id }">
				<CustomDropdown placement="bottom-end">
					<button :id="id" class="btn btn-outline w-full justify-between">
						<span class="space-x-3">
							<LanguageFlag :code="selectedRegionalLanguage" />
							<LanguageName :code="selectedRegionalLanguage" />
						</span>
						<i class="fa fa-chevron-down"></i>
					</button>

					<template #popper="{ hide }">
						<ul class="menu">
							<li v-for="lang in languages" :key="lang.code">
								<a @click="selectRegionalLanguage(lang, hide)">
									<LanguageFlag :code="lang.code" />
									<LanguageName :code="lang.code" />
								</a>
							</li>
						</ul>
					</template>
				</CustomDropdown>
			</template>
		</SettingsRow>

		<!--		<SettingsRow title="Tarih Formatı">-->
		<!--			<template #default="{ id }">-->
		<!--				<CustomDropdown placement="bottom-start">-->
		<!--					<button :id="id" class="btn btn-outline w-full justify-between">-->
		<!--						<span>-->
		<!--							<span>{{ selectedDateFormat }} </span>-->
		<!--						</span>-->
		<!--						<i class="fa fa-chevron-down" />-->
		<!--					</button>-->

		<!--					<template #popper="{ hide }">-->
		<!--						<ul class="menu min-w-64">-->
		<!--							<li v-for="format in dateFormats" :key="format.value">-->
		<!--								<a-->
		<!--									@click="-->
		<!--										() => {-->
		<!--											selectedDateFormat = format.value-->
		<!--											hide()-->
		<!--										}-->
		<!--									"-->
		<!--									class="w-full flex justify-between"-->
		<!--								>-->
		<!--									<span-->
		<!--										:class="{-->
		<!--											'font-bold': selectedDateFormat === format.value,-->
		<!--											'font-medium': selectedDateFormat !== format.value,-->
		<!--										}"-->
		<!--									>-->
		<!--										{{ format.label }}-->
		<!--									</span>-->
		<!--									<span class="text-subtle">{{ format.example }}</span>-->
		<!--								</a>-->
		<!--							</li>-->
		<!--						</ul>-->
		<!--					</template>-->
		<!--				</CustomDropdown>-->
		<!--			</template>-->
		<!--		</SettingsRow>-->

		<!--		<SettingsRow title="Saat Formatı" :isCursorPointer="false">-->
		<!--			<div class="flex flex-wrap gap-4 col-span-9">-->
		<!--				<label class="label cursor-pointer">-->
		<!--					<input-->
		<!--						type="radio"-->
		<!--						name="timeFormat"-->
		<!--						value="12"-->
		<!--						v-model="selectedTimeFormat"-->
		<!--						class="radio radio-primary radio-xs"-->
		<!--					/>-->
		<!--					<span class="label-text ml-2">12 Saat (2:30 PM)</span>-->
		<!--				</label>-->
		<!--				<label class="label cursor-pointer">-->
		<!--					<input-->
		<!--						type="radio"-->
		<!--						name="timeFormat"-->
		<!--						value="24"-->
		<!--						v-model="selectedTimeFormat"-->
		<!--						class="radio radio-primary radio-xs"-->
		<!--					/>-->
		<!--					<span class="label-text ml-2">24 Saat (14:30)</span>-->
		<!--				</label>-->
		<!--			</div>-->
		<!--		</SettingsRow>-->

		<div class="text-end mt-4">
			<SaveButton :is-loading="isLoading" :has-error="hasError" @save="saveSettings" />
		</div>
	</SettingSection>
</template>
<script>
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import { ChatAccountSettingKeys } from '~/models/ChatAccountSetting.ts'
import { getTimezoneByIdentifier } from '~/helpers/timezones.js'
import TimezoneDropdown from '~/components/Accounts/SettingsTab/TimezoneDropdown.vue'
import SettingsRow from '~/components/Accounts/SettingsTab/SettingsRow.vue'
import apiList from '~/apis/ApiList.js'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import SaveButton from '~/components/Accounts/SettingsTab/SaveButton.vue'
import SettingSection from '~/components/Accounts/SettingsTab/SettingSection.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		TimezoneDropdown,
		CustomDropdown,
		SettingSection,
		SaveButton,
		LoadingElement,
		SettingsRow,
		LanguageFlag,
		LanguageName,
	},
	setup() {
		const sessionStore = useSessionStore()
		return {
			country: sessionStore.data.country,
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		activeChatAccount() {
			return this.chatAccountsStore.active
		},

		selectedTimezone: {
			get() {
				return this.settings[ChatAccountSettingKeys.TIMEZONE_OFFSET]
			},
			set(value) {
				this.settings[ChatAccountSettingKeys.TIMEZONE_OFFSET] = value
			},
		},
		selectedRegionalLanguage: {
			get() {
				return this.settings[ChatAccountSettingKeys.REGIONAL_LANGUAGE]
			},
			set(value) {
				this.settings[ChatAccountSettingKeys.REGIONAL_LANGUAGE] = value
			},
		},
		// selectedTimeFormat: {
		// 	get() {
		// 		return this.settings[ChatAccountSettingKeys.TIME_FORMAT]
		// 	},
		// 	set(value) {
		// 		this.settings[ChatAccountSettingKeys.TIME_FORMAT] = value
		// 	},
		// },
		// selectedDateFormat: {
		// 	get() {
		// 		return this.settings[ChatAccountSettingKeys.DATE_FORMAT]
		// 	},
		// 	set(value) {
		// 		this.settings[ChatAccountSettingKeys.DATE_FORMAT] = value
		// 	},
		// },
	},
	data() {
		return {
			ChatAccountSettingKeys,
			languages: [],
			settings: {
				[ChatAccountSettingKeys.TIMEZONE_OFFSET]: getTimezoneByIdentifier('Europe/Istanbul'),
				[ChatAccountSettingKeys.REGIONAL_LANGUAGE]: this.$i18n.locale,
			},
			hasError: false,
			isLoading: false,
		}
	},
	mounted() {
		this.languages = [
			{ code: 'en', locale: 'en_US' },
			{ code: 'tr', locale: 'tr_TR' },
		]
		this.setSettings()
	},
	methods: {
		selectRegionalLanguage(lang, hideDropdownFunc) {
			this.selectedRegionalLanguage = lang.locale
			hideDropdownFunc()
		},
		setSettings() {
			this.activeChatAccount.settings.forEach((setting) => {
				if (!Object.keys(this.settings).includes(setting.key)) {
					return
				}

				if (setting.key === ChatAccountSettingKeys.TIMEZONE_OFFSET) {
					this.settings[setting.key] = JSON.parse(setting.value ?? '{}')
					return
				}

				this.settings[setting.key] = setting.value
			})
		},
		saveSettings() {
			this.isLoading = true
			this.hasError = false
			const keyVal = Object.entries(this.settings)
				.map(([key, value]) => {
					if (!value) return
					let val = value
					if (typeof value === 'object') {
						val = JSON.stringify(value)
					}
					return {
						key,
						value: val,
					}
				})
				.filter(Boolean)

			// keyVal.forEach((element) => {
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.settings.upsert,
					{ settings: keyVal },
					{
						chatAccountId: this.activeChatAccount.id,
					},
				)
				.then((response) => {
					response.data.map((element) => {
						const setting = this.activeChatAccount.settings.find((setting) => setting.key === element.key)
						if (!setting) {
							this.activeChatAccount.settings.push(element)
							return
						}
						setting.value = element.value
					})
					// const setting = this.activeChatAccount.settings.find((setting) => setting.key === element.key)
					// if (!setting) {
					// 	this.activeChatAccount.settings.push(element)
					// 	return
					// }
					// setting.value = element.value
				})
				.catch((err) => {
					consoleLog(err)
					this.hasError = true
				})
				.finally(() => {
					this.isLoading = false
				})
			// })
		},
	},
}
</script>

<style scoped></style>
