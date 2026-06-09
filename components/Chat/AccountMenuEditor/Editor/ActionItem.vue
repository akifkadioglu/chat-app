<template>
	<div class="border border-base-200 rounded-lg p-3">
		<div class="flex items-start gap-4">
			<!-- Type Dropdown -->
			<CustomDropdown v-if="type === 'persistent_menu'" class="w-12" placement="bottom-start">
				<slot name="triggerButton">
					<button type="button" :disabled="isLoading" class="btn btn-sm">
						<i :class="cta.type === 'postback' ? 'fa fa-bolt text-primary' : 'fa fa-link text-accent'" />
						<i class="fa fa-chevron-down opacity-75" />
					</button>
				</slot>
				<template #popper="{ shown, hide }">
					<div class="w-max bg-base-100 shadow-xl">
						<ul class="menu bg-base-100 rounded-box z-1 p-2 shadow">
							<li>
								<a @click="selectType('postback')">
									<i class="fa fa-bolt text-primary" />
									{{ $t('components.chat.accountMenuEditor.actionItem.flow') }}
								</a>
							</li>
							<li>
								<a @click="selectType('web_url')"
									><i class="fa fa-link text-accent" />
									{{ $t('components.chat.accountMenuEditor.actionItem.webLink') }}
								</a>
							</li>
						</ul>
					</div>
				</template>
			</CustomDropdown>
			<!-- Persistent Menu -->
			<div v-if="type === 'persistent_menu'" class="space-y-2 w-full overflow-auto">
				<!-- Title -->
				<div class="flex flex-col">
					<label>
						<span class="text-xs opacity-75"> Action title </span>
						<Field
							rules="required|min:1|max:30"
							:name="baseName + '.title'"
							:disabled="isLoading"
							:key="baseName + '.title'"
							v-model="cta.title"
							:placeholder="$t('components.chat.accountMenuEditor.actionItem.actionTitle')"
							validate-on-input
							v-slot="{ field, errors }"
						>
							<input
								v-bind="field"
								class="input input-bordered input-sm w-full"
								:class="errors.length > 0 ? 'input-error' : ''"
							/>
						</Field>
					</label>

					<ErrorMessage :name="baseName + '.title'" v-slot="{ message }">
						<span v-if="message" class="text-error text-xs mt-1">
							{{ $t('components.chat.accountMenuEditor.actionItem.validation.titleRequired') }}
						</span>
					</ErrorMessage>
				</div>

				<!-- URL -->
				<div v-if="cta.type === 'web_url'" class="relative">
					<label>
						<!--						<span class="text-xs opacity-75"> Site url </span>-->
						<Field
							rules="required|url"
							:name="baseName + '.url'"
							:disabled="isLoading"
							:key="baseName + '.url'"
							v-model="cta.url"
							placeholder="https://example.com"
							validate-on-input
							v-slot="{ field, errors }"
						>
							<input
								v-bind="field"
								class="input input-bordered input-sm w-full"
								:class="errors.length > 0 ? 'input-error' : ''"
							/>
						</Field>
					</label>
					<button
						type="button"
						:disabled="isLoading"
						@click="pasteUrl2"
						class="absolute z-2 right-0 top-0 btn btn-xs btn-ghost m-1"
					>
						<i class="fa-regular fa-clipboard" />
					</button>
					<ErrorMessage :name="baseName + '.url'" v-slot="{ message }">
						<span v-if="message" class="text-error text-xs mt-1">
							{{ $t('components.chat.accountMenuEditor.actionItem.validation.urlRequired') }}
						</span>
					</ErrorMessage>
				</div>
				<!-- Postback -->
				<div v-if="cta.type === 'postback'" class="relative w-full">
					<CloseAction
						:action="cta.action"
						:showSummaryBelowActionName="false"
						@create:action="saveAction"
						@delete:action="deleteAction"
					>
						<template #triggerButton>
							<button ref="dropdownButton" :disabled="isLoading" class="btn btn-sm w-full justify-start" type="button">
								<i class="fa fa-cog mr-2" />
								{{ $t('components.chat.accountMenuEditor.actionItem.selectAction') }}
							</button>
						</template>
					</CloseAction>
					<small v-if="!cta.action && hasError" class="text-error">
						{{ $t('components.chat.accountMenuEditor.actionItem.noActionSelected') }}
					</small>

					<!--					<label class="w-full">-->
					<!--						<span class="text-xs opacity-75"> Payload </span>-->
					<!--						<Field-->
					<!--							validate-on-input-->
					<!--							:disabled="isLoading"-->
					<!--							v-model="cta.payload"-->
					<!--							:name="baseName + '.payload'"-->
					<!--							rules="required"-->
					<!--							:key="baseName + '.payload'"-->
					<!--							class="input input-bordered input-sm w-full"-->
					<!--							placeholder="action_name"-->
					<!--						/>-->
					<!--					</label>-->
					<ErrorMessage :name="baseName + '.payload'" v-slot="{ message }">
						<span v-if="message" class="text-error text-xs mt-1">
							{{ $t('components.chat.accountMenuEditor.actionItem.validation.fieldRequired') }}
						</span>
					</ErrorMessage>
				</div>
			</div>

			<!-- IceBreaker -->
			<div v-if="type === 'ice_breakers'" class="space-y-2 w-full">
				<!-- Question -->
				<div class="flex flex-col">
					<label>
						<!--						<span class="text-xs opacity-75"> Question </span>-->
						<Field
							rules="required|min:1|max:30"
							:name="baseName + '.question'"
							:disabled="isLoading"
							:key="baseName + '.question'"
							v-model="cta.question"
							:placeholder="$t('components.chat.accountMenuEditor.actionItem.question')"
							v-slot="{ field, errors }"
							validate-on-input
						>
							<input
								v-bind="field"
								class="input input-bordered input-sm w-full"
								:class="errors.length > 0 ? 'input-error' : ''"
							/>
						</Field>
					</label>

					<ErrorMessage :name="baseName + '.question'" v-slot="{ message }">
						<span v-if="message" class="text-error text-xs mt-1">
							{{ $t('components.chat.accountMenuEditor.actionItem.validation.questionRequired') }}
						</span>
					</ErrorMessage>
				</div>

				<!-- Payload -->
				<div class="relative w-full">
					<CloseAction
						show-remove-button
						:action="cta.action"
						:showSummaryBelowActionName="false"
						@create:action="saveAction"
						@delete:action="deleteAction"
					>
						<template #triggerButton>
							<button ref="dropdownButton" :disabled="isLoading" class="btn btn-sm w-full justify-start" type="button">
								<i class="fa fa-cog mr-2" />
								{{ $t('components.chat.accountMenuEditor.actionItem.selectAction') }}
							</button>
						</template>
					</CloseAction>
					<small v-if="!cta.action && hasError" class="text-error">
						{{ $t('components.chat.accountMenuEditor.actionItem.noActionSelected') }}
					</small>

					<!--					<label class="w-full">-->
					<!--						<span class="text-xs opacity-75"> Payload </span>-->
					<!--						<Field-->
					<!--							validate-on-input-->
					<!--							:disabled="isLoading"-->
					<!--							v-model="cta.payload"-->
					<!--							:name="baseName + '.payload'"-->
					<!--							rules="required"-->
					<!--							:key="baseName + '.payload'"-->
					<!--							class="input input-bordered input-sm w-full"-->
					<!--							placeholder="action_name"-->
					<!--						/>-->
					<!--					</label>-->
					<ErrorMessage :name="baseName + '.payload'" v-slot="{ message }">
						<span v-if="message" class="text-error text-xs mt-1">
							{{ $t('components.chat.accountMenuEditor.actionItem.validation.fieldRequired') }}
						</span>
					</ErrorMessage>
				</div>
			</div>

			<!-- Delete -->
			<button
				type="button"
				:disabled="isLoading || ctaLength === 1"
				@click="$emit('delete-action')"
				class="btn btn-sm btn-ghost"
			>
				<i class="fa fa-times" />
			</button>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import { ErrorMessage, Field } from 'vee-validate'
import SearchBox from '~/components/GlobalComponents/SearchBox.vue'
import CloseAction from '~/components/Flow/Node/CloseAction.vue'
import { v4 } from 'uuid'
import LanguageName from '~/components/GlobalComponents/LanguageName.vue'
import LanguageFlag from '~/components/GlobalComponents/LanguageFlag.vue'
import { CallToActionModel } from '~/models/messengerProfileMenu'
import { Clipboard } from '@capacitor/clipboard'
import { Flow as FlowModel } from '~/models/Flow/Flow.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default defineComponent({
	name: 'ActionItem',
	components: { CustomDropdown, LanguageFlag, LanguageName, CloseAction, SearchBox, ErrorMessage, Field },
	props: {
		baseName: { type: String, required: true },
		cta: { type: CallToActionModel, required: true },
		isLoading: { type: Boolean, default: false },
		ctaLength: { type: Number, required: true },
		type: { type: String, required: true },
		hasError: { type: Boolean, default: false },
		chatAccountId: { type: Number, required: true },
	},
	emits: ['update-cta', 'delete-action'],
	setup() {
		return {
			flowStore: useFlowStore(),
		}
	},
	mounted() {
		this.flowStore.flow = new FlowModel({})
		this.flowStore.flow.chatAccountId = this.chatAccountId
		console.log('this.flowStore.flow.chatAccountId', this.flowStore.flow.chatAccountId)
	},
	unmounted() {
		this.flowStore.flow = null
	},
	methods: {
		selectType(type) {
			consoleLog(type)
			this.cta.type = type
			console.log(this.cta)
		},
		async pasteUrl() {
			consoleLog('Pasting from clipboard...')
			try {
				const text = await navigator.clipboard.readText()
				this.$emit('update-cta', { ...this.cta, url: text })
			} catch (err) {
				console.log('Clipboard okuma hatası:', err)
			}
		},
		saveAction(newAction) {
			newAction.isSingle = true
			this.cta.action = newAction
			this.cta.payload = v4()
		},
		deleteAction() {
			this.cta.action = null
			this.cta.payload = ''
		},
		async pasteUrl2() {
			const { value } = await Clipboard.read()
			this.$emit('update-cta', { ...this.cta, url: value })
		},
	},
})
</script>
