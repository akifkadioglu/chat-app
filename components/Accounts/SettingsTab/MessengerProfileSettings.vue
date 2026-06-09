<template>
	<SettingSection :title="$t('components.accounts.settingsTab.messengerProfileSettings.title')">
		<div class="space-y-5">
			<PersistentMenuCard :chat-account="activeChatAccount" />

			<IceBreakerMenuCard :chat-account="activeChatAccount" />
		</div>
	</SettingSection>
</template>

<script>
import MessengerProfileTab from '~/components/Accounts/MessengerProfilesTab.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import SettingSection from '~/components/Accounts/SettingsTab/SettingSection.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import SettingsRow from '~/components/Accounts/SettingsTab/SettingsRow.vue'
import PersistentMenuCard from '~/components/Accounts/SettingsTab/MessengerProfiles/PersistentMenuCard.vue'
import IceBreakerMenuCard from '~/components/Accounts/SettingsTab/MessengerProfiles/IceBreakerMenuCard.vue'
import PauseFlowsDropdown from '~/components/Chat/ContactInfo/PauseFlowsDropdown.vue'
import { useChatAccountsStore } from '~/stores/chatAccounts.ts'

export default {
	components: {
		PauseFlowsDropdown,
		IceBreakerMenuCard,
		PersistentMenuCard,
		LanguageFlag,
		SettingSection,
		SettingsRow,
		CustomDropdown,
		MessengerProfileTab,
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
	},
}
</script>
