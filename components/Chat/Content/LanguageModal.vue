<template>
	<Modal
		ref="modal"
		:closeable="selectedLanguage === currentSelectedLanguage"
		@closed="selectedLanguage = currentSelectedLanguage"
	>
		<div class="space-y-6">
			<!-- Header Section -->
			<div>
				<h3 class="text-xl">{{ $t('components.accounts.languageModal.title') }}</h3>
				<p class="text-sm text-base-content/70 mt-2">
					{{ $t('components.accounts.languageModal.description') }}
				</p>
			</div>

			<!-- Language Selection Section -->
			<div class="bg-base-200/50 rounded-lg">
				<div class="text-center">
					<div class="bg-primary/10 p-3 rounded-full inline-block">
						<i class="fas fa-language text-primary text-xl"></i>
					</div>
				</div>

				<div class="flex items-center justify-center w-full flex-1">
					<!-- Gelen Mesaj Balonu -->
					<div class="chat chat-start">
						<div class="chat-bubble bg-base-300 text-base-content border border-base-300 text-sm pl-3">
							<span class="text-nowrap pr-3">こんにちは</span>
						</div>
					</div>

					<!-- Çeviri İkonu -->
					<div class="flex flex-col items-center">
						<i class="fas fa-arrow-right text-base-content/50 text-lg"></i>
					</div>

					<!-- Ok -->

					<!-- Çevrilmiş Mesaj Balonu -->
					<div class="chat chat-start">
						<div class="chat-bubble bg-base-300 text-base-content border border-base-300 text-sm">
							<div style="position: relative">
								<span class="text-nowrap pr-3">こんにちは</span>
								<div v-if="selectedLanguage" class="divider my-0"></div>
								<span v-if="selectedLanguage" class="text-xs opacity-50">{{
									getTranslatedHello(selectedLanguage)
								}}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Dil Seçimi -->
				<div class="mt-6 flex flex-col gap-2">
					<div class="text-center">
						<span class="font-medium text-base-content/80">
							{{ $t('components.accounts.languageModal.targetLanguageLabel') }}:
						</span>
					</div>

					<div class="flex items-center justify-center gap-3">
						<CustomDropdown ref="languageDropdown" container="#appPage" placement="bottom" trigger="click">
							<button id="targetLanguage" class="btn btn-info btn-transition min-w-48">
								<span v-if="selectedLanguage" class="flex items-center gap-2">
									<LanguageFlag :code="selectedLanguage" />
									<LanguageName :code="selectedLanguage" />
								</span>
								<span v-else>{{ $t('components.accounts.languageModal.selectLanguage') }}</span>
								<i class="fas fa-chevron-down ml-auto"></i>
							</button>

							<template #popper>
								<ul class="menu bg-base-100 shadow-lg p-2 w-max" @click="$refs.languageDropdown?.hide()">
									<li v-for="language in availableLanguages()" :key="language.code">
										<a href="javascript:" @click="selectLanguage(language.code.split('_')[0])" class="p-2">
											<LanguageFlag :code="language.code" />
											<LanguageName :code="language.code">
												{{ language.name }}
											</LanguageName>
										</a>
									</li>
								</ul>
							</template>
						</CustomDropdown>
					</div>
					<div class="text-center text-xs text-muted">
						<a href="javascript:" class="underline" @click="selectedLanguage = null">
							{{ $t('components.accounts.languageModal.cancelTranslation') }}
						</a>
					</div>
				</div>
			</div>
		</div>
		<template #buttonNearClose>
			<button
				@click="saveLanguage"
				class="btn btn-primary"
				:disabled="isLoading || selectedLanguage === currentSelectedLanguage"
			>
				<loading-element :is-loading="isLoading" size="16">
					<i class="fa fa-save" />
				</loading-element>
				{{ $t('components.accounts.languageModal.saveButton') }}
			</button>
		</template>
	</Modal>
</template>
<script>
import { defineComponent } from 'vue'
import { Dropdown } from 'floating-vue'
import Modal from '~/components/GlobalComponents/Modal.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import apiList from '~/apis/ApiList.js'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import { availableLanguages } from '~/helpers/availableLanguages.js'
import { ChatAccountSettingKeys } from '~/models/ChatAccountSetting.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default defineComponent({
	components: {
		CustomDropdown,
		LanguageName,
		LoadingElement,
		LanguageFlag,
		Modal,
	},
	props: {
		settings: {},
		chatAccountId: {},
	},
	emits: ['showTranslatedMessages'],
	// setup() {
	// 	return {
	// 		availableLanguages: useAvailableLanguages(),
	// 	}
	// },
	data() {
		return {
			selectedLanguage:
				this.settings?.find((setting) => setting.key === ChatAccountSettingKeys.TARGET_LANGUAGE)?.value ?? '',
			currentSelectedLanguage: '',
			isLoading: false,
		}
	},
	watch: {
		chatAccountId() {
			this.selectedLanguage =
				this.settings?.find((setting) => setting.key === ChatAccountSettingKeys.TARGET_LANGUAGE)?.value ?? ''
			this.currentSelectedLanguage = this.selectedLanguage
		},
	},
	mounted() {
		this.currentSelectedLanguage = this.selectedLanguage
	},
	methods: {
		availableLanguages() {
			return availableLanguages
		},
		showModal() {
			this.$refs.modal.showModal()
		},
		hideModal() {
			this.$refs.modal.hideModal()
		},
		selectLanguage(languageCode) {
			this.selectedLanguage = languageCode
		},
		updateLanguage() {},
		getTranslatedHello(languageCode) {
			const language = availableLanguages.find((lang) => lang.code === languageCode)
			return language?.hello || 'Hello'
		},
		saveLanguage() {
			this.isLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.settings.upsert,
					{
						settings: [
							{
								key: ChatAccountSettingKeys.TARGET_LANGUAGE,
								value: this.selectedLanguage,
							},
						],
					},
					{
						chatAccountId: this.chatAccountId,
					},
				)
				.then((response) => {
					response.data.map((element) => {
						const setting = this.settings.find((setting) => setting.key === element.key)
						if (!setting) {
							this.settings.push(element)
							return
						}
						setting.value = element.value
					})
					this.hideModal()
				})
				.catch((err) => {})
				.finally(() => {
					this.isLoading = false
				})
		},
	},
})
</script>
<style scoped></style>
