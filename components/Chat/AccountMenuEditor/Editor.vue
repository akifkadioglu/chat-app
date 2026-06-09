<template>
	<div class="w-full">
		<slot name="header" />
		<LanguageTabs
			:error-locales="errorLocales"
			:is-error="Object.keys($refs.formCtx?.errors ?? {}).length > 0"
			:messenger-profile-actions="menu[this.type]"
			:selected-locale="selectedLocale"
			@update:selected-locale="handleLocaleChange"
			@add-locale="addLocale"
			:available-languages="availableLanguages"
		/>
		<div class="p-6 border border-t-0 border-base-200 flex flex-col min-h-102">
			<Form
				@submit="saveCallToActions"
				ref="formCtx"
				class="space-y-4 flex flex-col flex-1"
				:key="`form-${selectedLocale}-${menu.platform}`"
			>
				<ActionItem
					:type="type"
					v-for="(cta, index) in ctas"
					:key="`${type}-${selectedLocale}-${index}`"
					:cta="cta"
					:cta-length="ctas.length"
					:base-name="`${this.type}[${menuByType.findIndex((menu) => menu.locale === selectedLocale)}].call_to_actions[${index}]`"
					@delete-action="deleteAction(index)"
					@update-cta="updateCta(index, $event)"
					:has-error="errorLocales.includes(selectedLocale)"
					:chat-account-id="chatAccountId"
				/>
				<ActionButtons
					class="mt-auto"
					:type="type"
					:is-add-action-disabled="isAddActionDisabled"
					:is-loading="isLoading"
					:selected-locale="selectedLocale"
					@add-new-button="addNewButton"
					@remove-locale="askRemoveLocale"
					@select-default-locale="handleDefaultLocaleChange"
					:ctas-locales="ctasLocales"
					:default-locale="defaultLocale"
				/>
			</Form>
		</div>
	</div>
</template>

<script>
import LanguageTabs from '~/components/Chat/AccountMenuEditor/Editor/LanguageTabs.vue'
import ActionItem from '~/components/Chat/AccountMenuEditor/Editor/ActionItem.vue'
import ActionButtons from '~/components/Chat/AccountMenuEditor/Editor/ActionButtons.vue'
import { Form } from 'vee-validate'
import Modal from '~/components/GlobalComponents/Modal.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { customizeLocale } from '~/helpers/availableLanguages'
import debounce from 'lodash/debounce'
import {
	MessengerProfileMenuModel,
	CallToActionModel,
	getMaxCallToActionsLength,
	MenuTypes,
} from '~/models/messengerProfileMenu.js'

export default {
	name: 'Editor',
	components: {
		LoadingElement,
		Modal,
		Form,
		LanguageTabs,
		ActionItem,
		ActionButtons,
	},
	props: {
		chatAccountId: {
			type: Number,
			required: true,
		},
		type: {
			type: String,
			default: MenuTypes.PERSISTENT_MENU,
			validator: (value) => [MenuTypes.PERSISTENT_MENU, MenuTypes.ICE_BREAKERS].includes(value),
			required: true,
		},
		menu: {
			type: MessengerProfileMenuModel,
			required: true,
		},
		defaultLocale: {
			type: String,
			required: true,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		const country = this.sessionStore.country
		return {
			availableLanguages: customizeLocale(country),
			selectedLocale: '',
			errorLocales: [],
			lastCtaLength: 0,
		}
	},
	setup() {
		return {
			sessionStore: useSessionStore(),
		}
	},
	computed: {
		maxCtaLength() {
			return getMaxCallToActionsLength(this.type)
		},
		currentMenuLocale() {
			if (!this.selectedLocale) {
				this.handleLocaleChange(this.defaultLocale)
			}
			return this.menu.getMenuByType(this.type).find((menu) => menu.locale === this.selectedLocale)
		},
		ctas() {
			return this.currentMenuLocale?.call_to_actions || []
		},
		ctasLocales() {
			return this.menu.getMenuByType(this.type).map((menu) => menu.locale)
		},
		isAddActionDisabled() {
			return this.ctas.length >= this.maxCtaLength
		},
		menuByType: {
			get() {
				return this.menu.getMenuByType(this.type)
			},
			set(value) {
				this.menu.setMenuByType(this.type, value)
			},
		},
	},
	watch: {
		ctas: {
			handler(newVal, oldVal) {
				this.lastCtaLength = newVal?.length
				this.$emit('update:callToActions', newVal)
			},
			deep: true,
		},
		defaultLocale() {
			if (!this.selectedLocale) {
				this.handleLocaleChange(this.menuByType[0]?.locale)
			}
		},
	},
	methods: {
		askRemoveLocale() {
			this.$swal
				.fire({
					title: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.title'),
					text: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.text'),
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: this.$t('components.chat.accountMenuEditor.editor.confirmDialog.confirmButtonText'),
				})
				.then((result) => {
					if (result.isConfirmed) {
						this.removeLocale()
					}
				})
		},
		removeLocale() {
			this.removeLocaleFromErrors(this.selectedLocale)

			const newMenu = this.menuByType.filter((menu) => menu.locale !== this.selectedLocale)

			this.menuByType = newMenu
			const newLocale = newMenu[0].locale
			if (this.defaultLocale === this.selectedLocale) {
				this.handleDefaultLocaleChange(newLocale)
			}
			this.selectedLocale = newLocale
			this.$emit('locale-removed', {
				menu: this.menu,
				defaultLocale: this.selectedLocale,
			})
		},
		addNewButton(actionType) {
			if (this.isAddActionDisabled) return
			if (!this.currentMenuLocale) return

			let newCta
			if (actionType === 'ice_breakers') {
				newCta = CallToActionModel.createIceBreaker()
			}
			if (actionType === 'postback') {
				newCta = CallToActionModel.createPostback()
			}
			if (actionType === 'web_url') {
				newCta = CallToActionModel.createWebUrl()
			}

			this.currentMenuLocale.addCallToAction(newCta.toJSON())
		},
		async deleteAction(index) {
			if (!this.currentMenuLocale) return
			this.currentMenuLocale.removeCallToAction(index)
		},
		updateCta(index, updatedCta) {
			if (!this.currentMenuLocale) return
			this.currentMenuLocale.updateCallToAction(index, updatedCta)
		},
		async saveCallToActions() {
			await this.validateAllLocales()
			if (this.errorLocales.length > 0) {
				return
			}

			this.$emit('save', {
				menu: this.menu,
				defaultLocale: this.defaultLocale,
			})
		},
		validateForm: debounce(async function () {
			if (!this.$refs.formCtx) return false
			const formResult = await this.$refs.formCtx.validate()
			let currentLocale = this.selectedLocale
			if (!currentLocale) {
				currentLocale = this.defaultLocale
			}
			if (formResult.valid) {
				this.removeLocaleFromErrors(currentLocale)
				return true
			}
			this.addLocaleToErrors(currentLocale)
			return false
		}, 500),
		// Tüm dilleri validate et
		async validateAllLocales() {
			const currentLocale = this.selectedLocale
			this.errorLocales = []

			for (const menu of this.menuByType) {
				this.selectedLocale = menu.locale
				await this.$nextTick()

				if (!this.$refs.formCtx) continue
				const formResult = await this.$refs.formCtx.validate()
				if (!formResult.valid) {
					this.addLocaleToErrors(menu.locale)
					consoleLog(this.errorLocales)
				}
				this.currentMenuLocale.call_to_actions.forEach((cta) => {
					if (cta.type === 'postback' || this.type === MenuTypes.ICE_BREAKERS) {
						if (!cta.action) {
							this.addLocaleToErrors(menu.locale)
						}
					}
				})
			}

			// Orijinal dile geri dön
			this.selectedLocale = currentLocale
			await this.$nextTick()
		},
		removeLocaleFromErrors(locale) {
			this.errorLocales = this.errorLocales.filter((item) => item !== locale)
		},
		addLocaleToErrors(locale) {
			if (!this.errorLocales.includes(locale) && locale.length !== 0) {
				this.errorLocales.push(locale)
			}
		},
		async handleLocaleChange(locale) {
			this.selectedLocale = locale
			this.$emit('update:selectedLocale', locale)
		},
		async addLocale(locale) {
			if (this.ctasLocales.includes(locale)) return

			if (this.type === MenuTypes.PERSISTENT_MENU) {
				this.menu.addPersistentMenuLocale(locale, this.defaultLocale)
			}

			if (this.type === MenuTypes.ICE_BREAKERS) {
				this.menu.addIceBreakerLocale(locale, this.defaultLocale)
			}

			// await this.validateForm()
			await this.handleLocaleChange(locale)
		},
		handleDefaultLocaleChange(newDefaultLocale) {
			this.$emit('update:defaultLocale', newDefaultLocale)
		},
	},
}
</script>
