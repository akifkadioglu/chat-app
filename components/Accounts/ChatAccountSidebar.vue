<template>
	<div class="w-full truncate">
		<div class="max-h-15 border-b border-subtle h-full">
			<div class="px-3 flex h-full items-center my-auto gap-4">
				<div class="relative">
					<ProfilePicture
						:src="activeChatAccount.postAccount.profilePicture"
						:ringColor="activeChatAccount?.ringColor"
						:alt="activeChatAccount.postAccount.username"
						ring="ring-2"
						size="40"
					/>
					<span
						class="social-frame absolute flex items-center justify-center -bottom-2 -right-2 size-6 rounded-full bg-base-100"
					>
						<i
							:class="`fa-${activeChatAccount.postAccount.social.name} text-${activeChatAccount.postAccount.social.name}`"
							class="fa-brands text-xl"
						/>
					</span>
				</div>

				<div class="w-full">
					<div class="flex items-center gap-1 w-full">
						<div class="text-sm truncate w-full">
							{{ activeChatAccount.postAccount.name }}
						</div>
					</div>
					<p class="text-xs text-base-content/70 font-username">
						@{{ activeChatAccount.postAccount.username }}
						<IsVerifiedImg v-if="activeChatAccount.postAccount.isVerified" />
					</p>
					<p class="text-xs text-base-content/50">
						{{
							$t('components.accounts.chatAccountSidebar.followersText', {
								followersCount: activeChatAccount.postAccount.followersCountString,
							})
						}}
					</p>
				</div>
			</div>
		</div>
		<ul class="w-full [&_i]:mr-1 py-5 nav">
			<li class="nav-item truncate" :class="{ active: activeTab === undefined }">
				<localized-link name="account" class="flex items-center truncate">
					<i :class="TABS.overview.iconClass" />
					<span>
						{{ $t('components.accounts.chatAccountSidebar.tabs.overview') }}
					</span>
				</localized-link>
			</li>

			<li class="nav-item" :class="{ active: activeTab === TABS.settings.key }">
				<localized-link name="account-tab" :params="{ tab: TABS.settings.key }">
					<i :class="TABS.settings.iconClass" />
					<span>
						{{ $t('components.accounts.chatAccountSidebar.tabs.settings') }}
					</span>
				</localized-link>
			</li>
			<li class="nav-item" :class="{ active: activeTab === TABS.attributes.key }">
				<localized-link name="account-tab" :params="{ tab: TABS.attributes.key }">
					<i :class="TABS.attributes.iconClass" />
					<span>
						{{ $t('components.accounts.chatAccountSidebar.tabs.attributes') }}
					</span>
				</localized-link>
			</li>
			<li class="nav-item" :class="{ active: activeTab === TABS.billing.key }">
				<localized-link name="account-tab" :params="{ tab: TABS.billing.key }">
					<i :class="TABS.billing.iconClass" />
					<span>
						{{ $t('components.accounts.chatAccountSidebar.tabs.billing') }}
					</span>
				</localized-link>
			</li>
			<li class="nav-item" :class="{ active: activeTab === TABS.activities.key }">
				<localized-link name="account-tab" :params="{ tab: TABS.activities.key }">
					<i :class="TABS.activities.iconClass" />
					<span>
						{{ $t('components.accounts.chatAccountSidebar.tabs.activities') }}
					</span>
				</localized-link>
			</li>
			<!--			<li class="nav-item" :class="{ active: activeTab === TABS.messengerProfiles.key }">-->
			<!--				<localized-link name="account-tab" :params="{ tab: TABS.messengerProfiles.key }">-->
			<!--					<i :class="TABS.messengerProfiles.iconClass" />-->
			<!--					<span>-->
			<!--						{{ TABS.messengerProfiles.name }}-->
			<!--					</span>-->
			<!--				</localized-link>-->
			<!--			</li>-->
		</ul>
	</div>
</template>
<script>
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'
import { TABS } from '~/models/ChatAccount'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'

export default {
	components: { ProfilePicture, LocalizedLink, IsVerifiedImg },
	props: {
		activeChatAccount: {
			type: Object,
			default: null,
		},
	},
	computed: {
		activeTab() {
			return this.$route.params.tab
		},
	},
	data() {
		return {
			TABS,
		}
	},
}
</script>

<style scoped></style>
