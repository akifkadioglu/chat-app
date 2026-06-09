<template>
	<div class="space-y-20 max-w-3xl mx-auto px-5">
		<!-- Messenger Profile -->
		<MessengerProfileSettings />

		<!-- Chat Settings -->
		<ChatSettings />

		<!-- Team Settings -->
		<!--		<TeamSettings />-->

		<!-- Regional Settings -->
		<RegionalSettings />

		<!-- Notification Settings -->
		<NotificationSettings />

		<!-- Danger Zone -->
		<DangerZone />
	</div>
</template>

<script>
import RegionalSettings from '~/components/Accounts/SettingsTab/RegionalSettings.vue'
import DangerZone from '~/components/Accounts/SettingsTab/DangerZone.vue'
import NotificationSettings from '~/components/Accounts/SettingsTab/NotificationSettings.vue'
import MessengerProfileSettings from '~/components/Accounts/SettingsTab/MessengerProfileSettings.vue'
import ChatSettings from '~/components/Accounts/SettingsTab/ChatSettings.vue'

export default {
	components: {
		ChatSettings,
		MessengerProfileSettings,
		NotificationSettings,
		DangerZone,
		RegionalSettings,
	},
}
</script>
