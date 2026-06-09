<template>
	<div class="space-y-4">
		<!-- Add New Action Button -->
		<CustomDropdown v-if="type === 'persistent_menu'" placement="top-start" class="inline-block">
			<slot name="triggerButton">
				<button type="button" :disabled="isLoading || isAddActionDisabled" class="btn btn-sm">
					{{ $t('components.chat.accountMenuEditor.actionButtons.newButton') }} <i class="fa fa-plus" />
				</button>
			</slot>
			<template #popper="{ shown, hide }">
				<div class="w-max bg-base-100 shadow-xl">
					<ul class="menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow" @click="hide">
						<li>
							<a :class="{ 'pointer-events-none opacity-50': isAddActionDisabled }" @click="addNewButton('postback')">
								<i class="fa fa-bolt text-primary" />
								{{ $t('components.chat.accountMenuEditor.actionButtons.action') }}
							</a>
						</li>
						<li>
							<a :class="{ 'pointer-events-none opacity-50': isAddActionDisabled }" @click="addNewButton('web_url')">
								<i class="fa fa-link text-accent" />
								{{ $t('components.chat.accountMenuEditor.actionButtons.webLink') }}
							</a>
						</li>
					</ul>
				</div>
			</template>
		</CustomDropdown>

		<div v-if="type === 'ice_breakers'">
			<button
				type="button"
				@click="addNewButton('ice_breakers')"
				:disabled="isLoading || isAddActionDisabled"
				tabindex="0"
				class="btn btn-sm"
			>
				{{ $t('components.chat.accountMenuEditor.actionButtons.newQuestion') }} <i class="fa fa-plus" />
			</button>
		</div>

		<!-- Select default -->
		<CustomDropdown class="w-fit">
			<slot name="triggerButton">
				<i18n-t keypath="components.chat.accountMenuEditor.actionButtons.defaultLanguage" tag="span" class="text-sm">
					<template #language>
						<u class="cursor-pointer"><LanguageName :code="defaultLocale" /></u>
						<LanguageFlag :code="defaultLocale" />
					</template>
				</i18n-t>
			</slot>
			<template #popper="{ shown, hide }">
				<div class="w-max bg-base-100 shadow-xl">
					<ul class="menu bg-base-100 p-2">
						<li v-for="lang in ctasLocales" :key="lang.code" class="w-max">
							<a
								@click="selectDefaultLocale(lang, hide)"
								:class="{
									'opacity-50': defaultLocale === lang,
								}"
							>
								<LanguageFlag size="20" :code="lang" />
								<LanguageName :code="lang" />
							</a>
						</li>
					</ul>
				</div>
			</template>
		</CustomDropdown>

		<!-- Save and Delete Language Buttons -->
		<div class="flex gap-2">
			<button type="submit" :disabled="isLoading" class="flex items-center gap-2 btn btn-primary flex-1">
				<loading-element :is-loading="isLoading">
					<i class="fa fa-check" />
				</loading-element>
				<span>{{ $t('components.chat.accountMenuEditor.actionButtons.save') }}</span>
			</button>
			<button
				:disabled="isLoading || ctasLocales.length === 1"
				@click="$emit('remove-locale', selectedLocale)"
				class="btn btn-soft btn-error"
				type="button"
			>
				<i class="fa fa-trash" />
			</button>
		</div>
	</div>
</template>

<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
export default {
	components: { CustomDropdown, LanguageFlag, LanguageName, LoadingElement },
	props: {
		type: {
			type: String,
			required: true,
		},
		isAddActionDisabled: {
			type: Boolean,
			default: false,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
		selectedLocale: {
			type: String,
			required: true,
		},
		ctasLocales: {
			type: Array,
			required: true,
		},
		defaultLocale: {
			type: String,
			required: true,
		},
	},
	methods: {
		addNewButton(type) {
			this.$emit('add-new-button', type)
			this.$nextTick(() => {
				if (this.$refs.dropdownMenu) {
					this.$refs.dropdownMenu.blur()
				}
			})
		},
		selectDefaultLocale(lang, hideDropdownFunc) {
			this.$emit('selectDefaultLocale', lang)
			hideDropdownFunc()
		},
	},
	emits: ['add-new-button', 'save-actions', 'remove-locale', 'selectDefaultLocale'],
}
</script>
