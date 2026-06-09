<template>
	<SettingSection :isLoading="isLoading" :title="$t('components.accounts.settingsTab.notificationSettings.title')">
		<!--		<template #titleTrailing>-->
		<!--			<button class="btn btn-warning btn-sm" @click="pauseAllNotifications" v-if="!allNotificationsPaused">-->
		<!--				<span class="mr-2">-->
		<!--					<i class="fa fa-pause" />-->
		<!--				</span>-->
		<!--				{{ $t('components.accounts.settingsTab.notificationSettings.pauseAll') }}-->
		<!--			</button>-->
		<!--		</template>-->
		<div class="divide-y divide-base-200 space-y-5" v-auto-animate>
			<div
				v-if="isNotificationSupported && notificationStatus === 'default'"
				class="alert alert-info alert-soft flex items-center gap-3"
			>
				<i class="fa fa-bell text-lg" />
				<div class="flex-1">
					<h3 class="font-medium">
						{{ $t('components.accounts.settingsTab.notificationSettings.browserNotifications.title') }}
					</h3>
					<p class="text-sm text-muted">
						{{ $t('components.accounts.settingsTab.notificationSettings.browserNotifications.description') }}
					</p>
				</div>
				<button @click="requestBrowserNotifications" class="btn btn-sm btn-primary whitespace-nowrap btn-transition">
					{{ $t('components.accounts.settingsTab.notificationSettings.browserNotifications.allowButton') }}
				</button>
			</div>
			<NotificationsSection :title="$t('components.accounts.settingsTab.notificationSettings.reports.title')">
				<template #icon>
					<i class="fa fa-chart-line" />
				</template>
				<SettingsRow
					v-model="settings[ChatAccountSettingKeys.NOTIFICATIONS_DAILY]"
					:title="$t('components.accounts.settingsTab.notificationSettings.reports.daily.title')"
					:description="$t('components.accounts.settingsTab.notificationSettings.reports.daily.description')"
				/>
				<SettingsRow
					v-model="settings[ChatAccountSettingKeys.NOTIFICATIONS_WEEKLY]"
					:title="$t('components.accounts.settingsTab.notificationSettings.reports.weekly.title')"
					:description="$t('components.accounts.settingsTab.notificationSettings.reports.weekly.description')"
				/>
				<SettingsRow
					v-model="settings[ChatAccountSettingKeys.NOTIFICATIONS_MONTHLY]"
					:title="$t('components.accounts.settingsTab.notificationSettings.reports.monthly.title')"
					:description="$t('components.accounts.settingsTab.notificationSettings.reports.monthly.description')"
				/>
			</NotificationsSection>

			<NotificationsSection :title="$t('components.accounts.settingsTab.notificationSettings.flows.title')">
				<template #icon>
					<i class="fa fa-paper-plane" />
				</template>
				<SettingsRow
					v-model="settings[ChatAccountSettingKeys.NOTIFICATIONS_FLOW_ACHIEVEMENT]"
					:title="$t('components.accounts.settingsTab.notificationSettings.flows.milestone.title')"
					:description="$t('components.accounts.settingsTab.notificationSettings.flows.milestone.description')"
				/>
			</NotificationsSection>
		</div>
		<div class="text-end">
			<SaveButton :is-loading="isLoading" :has-error="hasError" @save="saveNotifications" />
		</div>
	</SettingSection>
</template>
<script>
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import SettingsRow from '~/components/Accounts/SettingsTab/SettingsRow.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import SaveButton from '~/components/Accounts/SettingsTab/SaveButton.vue'
import SettingSection from '~/components/Accounts/SettingsTab/SettingSection.vue'
import NotificationsSection from '~/components/Accounts/SettingsTab/NotificationsSection.vue'
import { ChatAccountSettingKeys } from '~/models/ChatAccountSetting.ts'
import apiList from '~/apis/ApiList.js'

export default {
	name: 'NotificationSettings',
	components: {
		NotificationsSection,
		SettingSection,
		SaveButton,
		LoadingElement,
		LanguageFlag,
		LanguageName,
		SettingsRow,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	data() {
		return {
			isLoading: false,
			hasError: false,
			notificationStatus: null,
			isNotificationSupported: null,
			ChatAccountSettingKeys,
			settings: {
				[ChatAccountSettingKeys.NOTIFICATIONS_DAILY]: true,
				[ChatAccountSettingKeys.NOTIFICATIONS_WEEKLY]: true,
				[ChatAccountSettingKeys.NOTIFICATIONS_MONTHLY]: true,
				[ChatAccountSettingKeys.NOTIFICATIONS_NEW_FEATURES]: true,
				[ChatAccountSettingKeys.NOTIFICATIONS_FLOW_ACHIEVEMENT]: true,
			},
		}
	},
	computed: {
		allNotificationsPaused() {
			let hasTrue = false
			Object.values(this.settings).forEach((notification) => {
				consoleLog('consoleLog(notification', notification)
				if (notification === true || notification == 1) {
					hasTrue = true
				}
			})
			return !hasTrue
		},
		activeChatAccount() {
			return this.chatAccountsStore.active
		},
	},
	mounted() {
		this.isNotificationSupported = 'Notification' in window
		this.notificationStatus = Notification.permission
		this.setSettings()
	},
	methods: {
		setSettings() {
			this.activeChatAccount.settings.forEach((setting) => {
				if (setting.key in this.settings) {
					this.settings[setting.key] = !!parseInt(setting.value)
				}
			})
			// Object.keys(this.settings).map((key) => {
			// 	this.settings[key] = this.activeChatAccount.settings.find((setting) => setting.key === key)?.value
			// })
		},
		saveNotifications() {
			this.isLoading = true
			this.hasError = false
			const keyVal = Object.entries(this.settings)
				.map(([key, value]) => {
					if (value === undefined || value === null) return
					return {
						key,
						value: value,
					}
				})
				.filter(Boolean)
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.settings.upsert,
					{ settings: keyVal },
					{ chatAccountId: this.activeChatAccount.id },
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
				})
				.catch((err) => {
					consoleLog(err)
					this.hasError = true
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		pauseAllNotifications() {
			Object.keys(this.settings).forEach((key) => {
				this.settings[key] = false
			})
		},
		async requestBrowserNotifications() {
			Notification.requestPermission().then((permission) => {
				this.notificationStatus = permission
			})
		},
	},
}
</script>
