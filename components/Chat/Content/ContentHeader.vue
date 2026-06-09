<template>
	<div class="flex w-full items-center h-15 overflow-hidden gap-3">
		<AccountProfile
			class="text-base sm:text-lg text-base-content min-w-0 flex-1 overflow-hidden"
			:profilePicture="contact?.platformAccountsInstagram?.profileImageUrl"
			:name="contact?.platformAccountsInstagram?.name || contact?.platformAccountsInstagram?.username || null"
			:username="contact?.platformAccountsInstagram?.username"
			:is-loading="isLoading"
			is-clickable
		/>

		<div class="shrink-0 ml-auto" v-if="conversation?.id">
			<div v-if="targetLanguage" class="flex flex-col items-end">
				<label class="label-text text-xs">
					<i class="sm:hidden fa fa-language mr-1" />
					<span class="hidden sm:inline mr-1">{{ $t('components.chat.content.contentHeader.showTranslations') }}</span>
					<input
						:checked="showTranslatedMessages"
						@change="$emit('update:showTranslatedMessages', $event.target.checked)"
						type="checkbox"
						class="checkbox checkbox-sm rounded-none"
					/>
				</label>
				<div class="text-sm" @click="showTranslationSettingsModal">
					<small>
						<span class="hidden sm:inline">
							{{ $t('components.chat.content.contentHeader.willBeTranslatingTo') }}
						</span>
						<u class="cursor-pointer font-extrabold">
							<LanguageName :code="targetLanguage" />
						</u>
						<LanguageFlag size="12" :code="targetLanguage" />
					</small>
				</div>
			</div>
			<span v-else>
				<button class="text-sm" @click="showTranslationSettingsModal">
					<span class="text-nowrap">
						<i class="fa fa-language mr-2 text-primary sm:hidden" />
						<span class="hidden sm:inline">
							{{ $t('components.chat.content.contentHeader.activateAutoTranslate') }}
							<span v-tooltip="$t('components.chat.content.contentHeader.autoTranslateTooltip')">
								<i class="fa fa-info-circle text-primary ms-1" />
							</span>
						</span>
					</span>
				</button>
			</span>
		</div>
	</div>
	<LanguageModal
		v-if="conversation?.id"
		ref="languageModal"
		:settings="conversation.chatAccount.settings"
		:chatAccountId="conversation.chatAccount.id"
		@showTranslatedMessages="$emit('update:showTranslatedMessages', $event)"
	/>
</template>
<script>
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LanguageModal from '~/components/Chat/Content/LanguageModal.vue'
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'
import { Contact } from '~/models/Contact/Contact.js'
import { Conversation } from '~/models/Conversation/Conversation.ts'
import featureList from '~/types/featureList.ts'

export default {
	props: {
		contact: {
			type: Contact,
			default: null,
		},
		showTranslatedMessages: {},
		targetLanguage: {},
		isLoading: {},
		conversation: {
			type: Conversation,
		},
	},
	emits: ['update:showTranslatedMessages'],
	components: { AccountProfile, LanguageModal, LanguageName, LanguageFlag },
	methods: {
		showTranslationSettingsModal() {
			consoleLog('showTranslationSettingsModal called', this.conversation.chatAccount.subscribed)
			if (!this.conversation.chatAccount.subscribed) {
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.conversation.chatAccount,
					feature: featureList.autoTranslate,
				})
				return
			}
			this.$refs.languageModal.showModal()
		},
	},
}
</script>
