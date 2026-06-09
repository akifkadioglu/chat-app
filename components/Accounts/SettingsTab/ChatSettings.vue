<template>
	<SettingSection :isLoading="isLoading" :title="$t('components.accounts.settingsTab.messengerProfileSettings.title')">
		<div class="space-y-5" v-auto-animate>
			<SettingsRow
				:title="$t('components.accounts.settingsTab.messengerProfileSettings.agentMessagePauseDuration.title')"
				:description="
					$t('components.accounts.settingsTab.messengerProfileSettings.agentMessagePauseDuration.description')
				"
			>
				<template #action="{ id }">
					<PauseFlowsDropdown ref="pauseFlowsDropdown" placement="bottom-end" @pauseFlows="selectPauseDuration">
						<template #trigger>
							<button :id="id" class="btn btn-outline w-full justify-between">
								<span>{{ selectedPauseDurationLabel }}</span>
								<i class="fa fa-chevron-down"></i>
							</button>
						</template>
					</PauseFlowsDropdown>
					<!--					<CustomDropdown placement="bottom-end">-->
					<!--						<button :id="id" class="btn btn-outline w-full justify-between">-->
					<!--							<span>{{ selectedPauseDurationLabel }}</span>-->
					<!--							<i class="fa fa-chevron-down"></i>-->
					<!--						</button>-->

					<!--						<template #popper="{ hide }">-->
					<!--							<ul class="menu">-->
					<!--								<li v-for="option in pauseDurationOptions" :key="option.value">-->
					<!--									<a @click="selectPauseDuration(option.value, hide)">-->
					<!--										{{ option.label }}-->
					<!--									</a>-->
					<!--								</li>-->
					<!--							</ul>-->
					<!--						</template>-->
					<!--					</CustomDropdown>-->
				</template>
			</SettingsRow>
		</div>
		<div class="text-end mt-4">
			<SaveButton :is-loading="isLoading" :has-error="hasError" @save="saveSettings" />
		</div>
	</SettingSection>
</template>
<script>
import PauseFlowsDropdown from '~/components/Chat/ContactInfo/PauseFlowsDropdown.vue'
import SettingsRow from '~/components/Accounts/SettingsTab/SettingsRow.vue'
import SettingSection from '~/components/Accounts/SettingsTab/SettingSection.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import apiList from '~/apis/ApiList.js'
import { ChatAccountSettingKeys } from '~/models/ChatAccountSetting.ts'
import SaveButton from '~/components/Accounts/SettingsTab/SaveButton.vue'

export default {
	components: {
		SaveButton,
		SettingSection,
		SettingsRow,
		PauseFlowsDropdown,
		CustomDropdown,
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		activeChatAccount() {
			return this.chatAccountsStore?.active
		},
		selectedPauseDurationLabel() {
			const option = this.$refs.pauseFlowsDropdown?.pauseDurationOptions?.find(
				(opt) => opt.value === this.settings[ChatAccountSettingKeys.AGENT_MESSAGE_PAUSE_DURATION],
			)
			return option?.label || ''
		},
	},

	data() {
		return {
			ChatAccountSettingKeys,
			settings: {
				[ChatAccountSettingKeys.AGENT_MESSAGE_PAUSE_DURATION]: 10,
			},
			isLoading: false,
			hasError: false,
		}
	},

	mounted() {
		this.loadSettings()
	},

	methods: {
		loadSettings() {
			this.activeChatAccount?.settings?.forEach((setting) => {
				if (!(setting.key in this.settings)) {
					return
				}
				if (setting.key === ChatAccountSettingKeys.AGENT_MESSAGE_PAUSE_DURATION) {
					this.settings[setting.key] = parseInt(setting.value)
					return
				}
				if (setting.key === ChatAccountSettingKeys.AUTO_ASSIGNMENT) {
					this.settings[setting.key] = !!parseInt(setting.value)
					return
				}
				this.settings[setting.key] = setting.value
			})
		},
		selectPauseDuration(value) {
			this.settings[ChatAccountSettingKeys.AGENT_MESSAGE_PAUSE_DURATION] = value
		},
		saveSettings() {
			this.isLoading = true
			this.hasError = false

			const settingsArray = Object.entries(this.settings).map(([key, value]) => ({
				key,
				value: value,
			}))

			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.settings.upsert,
					{ settings: settingsArray },
					{ chatAccountId: this.activeChatAccount.id },
				)
				.then((response) => {
					response.data.forEach((element) => {
						const setting = this.activeChatAccount.settings.find((s) => s.key === element.key)
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
	},
}
</script>

<style scoped></style>
