<template>
	<div>
		<SettingSection :isLoading="isTeamLoading" :title="$t('components.accounts.settingsTab.teamSettings.title')">
			<div class="space-y-5" v-auto-animate>
				<SettingsRow
					:title="$t('components.accounts.settingsTab.regionalSettings.timezone.title')"
					:description="$t('components.accounts.settingsTab.regionalSettings.timezone.description')"
				>
					<template #action="{ id }">
						<TimezoneDropdown
							:id="id"
							:selectedTimezone="teamSettings[TeamSettingKeys.TIMEZONE_OFFSET]"
							@update:selectedTimezone="teamSettings[TeamSettingKeys.TIMEZONE_OFFSET] = $event"
						/>
					</template>
				</SettingsRow>
			</div>
			<div class="text-end mt-4">
				<SaveButton :is-loading="isTeamLoading" :has-error="teamSettingsHasError" @save="saveTeamSettings" />
			</div>
		</SettingSection>

		<SettingSection :isLoading="isChatLoading" :title="$t('components.accounts.settingsTab.chatSettings.title')">
			<div class="space-y-5" v-auto-animate>
				<SettingsRow
					:title="$t('components.accounts.settingsTab.teamSettings.autoAssignment.title')"
					:description="$t('components.accounts.settingsTab.teamSettings.autoAssignment.description')"
				>
					<template #action="{ id }">
						<input
							:id="id"
							type="checkbox"
							class="toggle toggle-primary"
							v-model="chatSettings[TeamSettingKeys.AUTO_ASSIGNMENT]"
						/>
					</template>
				</SettingsRow>

				<div v-if="chatSettings[TeamSettingKeys.AUTO_ASSIGNMENT]" class="space-y-5">
					<SettingsRow
						:title="$t('components.accounts.settingsTab.teamSettings.assignmentMode.title')"
						:description="$t('components.accounts.settingsTab.teamSettings.assignmentMode.description')"
					>
						<template #action="{ id }">
							<CustomDropdown placement="bottom-end">
								<button :id="id" class="btn btn-outline w-full justify-between">
									<span v-if="selectedAssignmentModeLabel">
										{{
											$t(
												'components.accounts.settingsTab.teamSettings.assignmentMode.options.' +
													selectedAssignmentModeLabel,
											)
										}}
									</span>
									<span v-else>
										{{ $t('components.accounts.settingsTab.teamSettings.assignmentMode.selectMode') }}
									</span>
									<i class="fa fa-chevron-down"></i>
								</button>

								<template #popper="{ hide }">
									<ul class="menu">
										<li v-for="option in assignmentModeOptions" :key="option">
											<a @click="selectAssignmentMode(option, hide)">
												{{ $t('components.accounts.settingsTab.teamSettings.assignmentMode.options.' + option) }}
											</a>
										</li>
									</ul>
								</template>
							</CustomDropdown>
						</template>
					</SettingsRow>
					<WeightedAssignment
						v-if="ASSIGNMENT_MODES.WEIGHTED === chatSettings[TeamSettingKeys.ASSIGNMENT_MODE]"
						:teamUsers="teamUsers || []"
						:weighted="chatSettings[TeamSettingKeys.WEIGHTED]"
					/>

					<ScheduledAssignment
						v-if="ASSIGNMENT_MODES.SCHEDULED === chatSettings[TeamSettingKeys.ASSIGNMENT_MODE]"
						:teamUsers="teamUsers || []"
						:scheduled="chatSettings[TeamSettingKeys.SCHEDULED]"
					/>
				</div>
			</div>
			<div class="text-end mt-4">
				<SaveButton :is-loading="isChatLoading" :has-error="chatSettingsHasError" @save="saveChatSettings" />
			</div>
		</SettingSection>
	</div>
</template>
<script>
import PauseFlowsDropdown from '~/components/Chat/ContactInfo/PauseFlowsDropdown.vue'
import SettingsRow from '~/components/Accounts/SettingsTab/SettingsRow.vue'
import SettingSection from '~/components/Accounts/SettingsTab/SettingSection.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import apiList from '~/apis/ApiList.js'
import { TeamSettingKeys } from '~/models/TeamSetting.ts'
import SaveButton from '~/components/Accounts/SettingsTab/SaveButton.vue'
import WeightedAssignment from '~/components/App/TeamSettingsTab/WeightedAssignment.vue'
import ScheduledAssignment from '~/components/App/TeamSettingsTab/ScheduledAssignment.vue'
import TimezoneDropdown from '~/components/Accounts/SettingsTab/TimezoneDropdown.vue'
import { getTimezoneByIdentifier } from '~/helpers/timezones.js'
import { DEFAULT_SCHEDULE } from '~/models/Team/TeamAssignmentSetting'

const ASSIGNMENT_MODES = {
	RANDOM: 'random',
	SEQUENTIAL: 'sequential',
	WEIGHTED: 'weighted',
	SCHEDULED: 'scheduled',
}
export default {
	components: {
		TimezoneDropdown,
		SaveButton,
		SettingSection,
		SettingsRow,
		PauseFlowsDropdown,
		CustomDropdown,
		WeightedAssignment,
		ScheduledAssignment,
	},

	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			teamStore: useTeamStore(),
		}
	},

	computed: {
		team() {
			return this.teamStore.team
		},
		selectedAssignmentModeLabel() {
			return this.assignmentModeOptions?.find((opt) => opt === this.chatSettings[TeamSettingKeys.ASSIGNMENT_MODE])
		},
		teamUsers() {
			return this.team?.teamUsers.filter((tu) => tu.userId).filter(Boolean) || []
		},
	},

	data() {
		return {
			TeamSettingKeys,
			ASSIGNMENT_MODES,

			teamSettings: {
				[TeamSettingKeys.TIMEZONE_OFFSET]: getTimezoneByIdentifier('Europe/Istanbul'),
			},
			chatSettings: {
				[TeamSettingKeys.AUTO_ASSIGNMENT]: false,
				[TeamSettingKeys.ASSIGNMENT_MODE]: ASSIGNMENT_MODES.SEQUENTIAL,
				[TeamSettingKeys.WEIGHTED]: {},
				[TeamSettingKeys.SCHEDULED]: {},
			},
			assignmentModeOptions: [
				ASSIGNMENT_MODES.SEQUENTIAL,
				ASSIGNMENT_MODES.RANDOM,
				ASSIGNMENT_MODES.WEIGHTED,
				ASSIGNMENT_MODES.SCHEDULED,
			],
			isTeamLoading: false,
			isChatLoading: false,
			chatSettingsHasError: false,
			teamSettingsHasError: false,
		}
	},

	mounted() {
		this.loadSettings()
	},

	methods: {
		loadSettings() {
			this.teamUsers.forEach((teamUser) => {
				const assignmentSetting = this.team.assignmentSettings.find((setting) => setting.userId === teamUser.userId)

				this.chatSettings[TeamSettingKeys.WEIGHTED][teamUser.userId] = assignmentSetting?.weight ?? 0
				this.chatSettings[TeamSettingKeys.SCHEDULED][teamUser.userId] = assignmentSetting?.schedule ?? DEFAULT_SCHEDULE
			})

			this.chatSettings[TeamSettingKeys.AUTO_ASSIGNMENT] = this.team?.getSettingValue(TeamSettingKeys.AUTO_ASSIGNMENT)
			this.chatSettings[TeamSettingKeys.ASSIGNMENT_MODE] = this.team?.getSettingValue(TeamSettingKeys.ASSIGNMENT_MODE)
			this.teamSettings[TeamSettingKeys.TIMEZONE_OFFSET] = this.team?.getSettingValue(TeamSettingKeys.TIMEZONE_OFFSET)
		},
		selectAssignmentMode(value, hide) {
			this.chatSettings[TeamSettingKeys.ASSIGNMENT_MODE] = value
			hide()
		},
		saveTeamSettings() {
			this.isTeamLoading = true
			this.teamSettingsHasError = false

			const settingsArray = Object.entries(this.teamSettings).map(([key, value]) => ({
				key,
				value: value,
			}))

			this.$requestAdapter
				.post(apiList.account.team.settings.upsert, { settings: settingsArray })
				.then((response) => {
					this.$toast.success(this.$t('components.accounts.settingsTab.teamSettings.saveSuccess'))
				})
				.catch((err) => {
					consoleLog(err)
					this.teamSettingsHasError = true
				})
				.finally(() => {
					this.isTeamLoading = false
				})
		},
		saveChatSettings() {
			this.isChatLoading = true
			this.chatSettingsHasError = false

			const settingsArray = Object.entries(this.chatSettings).map(([key, value]) => ({
				key,
				value: value,
			}))

			this.$requestAdapter
				.post(apiList.account.team.settings.upsert, { settings: settingsArray })
				.then((response) => {
					this.$toast.success(this.$t('components.accounts.settingsTab.teamSettings.saveSuccess'))
				})
				.catch((err) => {
					consoleLog(err)
					this.chatSettingsHasError = true
				})
				.finally(() => {
					this.isChatLoading = false
				})
		},
	},
}
</script>

<style scoped></style>
