<template>
	<div>
		<State
			:is-empty="!contact"
			:empty-title="$t('components.chat.contactInfo.contactInfoContent.emptyState.title')"
			:empty-content="$t('components.chat.contactInfo.contactInfoContent.emptyState.content')"
		>
			<div>
				<div class="min-w-0 py-2 px-4 border-b border-base-300 h-15 flex items-center justify-between">
					<div>
						<h3 class="text-lg line-clamp-1">
							{{ contact?.name || $t('components.chat.contactInfo.contactInfoContent.defaultContactName') }}
						</h3>
						<p class="text-sm text-base-content/70 font-username line-clamp-1">
							{{ contact?.platformAccountsInstagram?.username }}
						</p>
					</div>

					<div>
						<button @click="fetchContact" :disabled="isLoading" class="btn btn-xs btn-soft btn-info">
							<loading-element size="14" :is-loading="isLoading">
								<i class="fa fa-rotate" />
							</loading-element>
						</button>
					</div>
				</div>
				<div class="flex-1 p-4 space-y-4">
					<div :key="contact?.id">
						<!-- Profile Section -->
						<div class="flex flex-col items-center">
							<ProfilePicture
								:size="75"
								:src="contact.platformAccountsInstagram?.profileImageUrl"
								:alt="contact.name"
							/>

							<div class="flex items-center gap-2 mt-2">
								<h4 class="card-title font-username">{{ contact.platformAccountsInstagram?.username }}</h4>
								<i
									v-if="contact.platformAccountsInstagram?.isVerified"
									class="fa fa-check-circle text-blue-500"
									title="Verified Account"
								/>
							</div>

							<div v-if="contact.platformAccountsInstagram?.followersCount" class="text-sm text-muted mt-1">
								{{
									$t('components.chat.contactInfo.contactInfoContent.followersText', {
										followersCount: $formatSocialCount(contact.platformAccountsInstagram?.followersCount),
									})
								}}
							</div>

							<a
								:href="contact.platformAccountsInstagram?.profileUrl"
								target="_blank"
								class="btn btn-outline btn-sm gap-2 border-base-300"
							>
								<i class="fa-brands fa-instagram text-pink-500" />
								{{ $t('components.chat.contactInfo.contactInfoContent.seeOnInstagramButton') }}
							</a>
						</div>
						<div class="mt-3 text-center" v-if="showGoToConversationLink">
							<localized-link
								class="link text-xs"
								:class="{ 'opacity-50 cursor-default': $route.query.c == contact.id }"
								name="chat"
								:query="{
									c: contact.id,
								}"
							>
								{{ $t('components.chat.contactInfo.contactInfoContent.goToConversation') }}
								<i class="fa fa-chevron-right link-icon" />
							</localized-link>
						</div>

						<!-- Flows Pause Section -->
						<div class="mt-4" v-auto-animate>
							<div v-if="isFlowsPaused" class="alert alert-warning alert-soft">
								<div class="flex flex-col gap-2 w-full col-span-12">
									<div class="flex items-center gap-2">
										<i class="fa fa-pause-circle"></i>
										<span class="font-medium">
											{{ $t('components.chat.contactInfo.contactInfoContent.flowsPaused.title') }}
										</span>
									</div>
									<p class="text-sm">
										{{
											$t('components.chat.contactInfo.contactInfoContent.flowsPaused.until', {
												date: formattedPauseUntil,
											})
										}}
									</p>
									<button @click="resumeFlows" :disabled="isPauseLoading" class="btn btn-sm btn-warning">
										<loading-element size="14" :is-loading="isPauseLoading">
											<i class="fa fa-play" />
										</loading-element>
										{{ $t('components.chat.contactInfo.contactInfoContent.flowsPaused.resumeButton') }}
									</button>
								</div>
							</div>
							<div v-else class="flex justify-center">
								<PauseFlowsDropdown @pauseFlows="pauseFlows" placement="bottom" />
							</div>
						</div>

						<div class="divider mt-0"></div>
						<!-- Contact Details -->
						<ContactFields :contact-id="contact?.id" :chatAccountId="chatAccountId" />
						<div class="divider"></div>
						<ContactCustomFields :contactId="contact?.id" :chatAccountId="chatAccountId" />
						<div class="divider"></div>
						<ContactTags :chatAccountId="chatAccountId" :contactId="contact?.id" />
						<div class="text-center py-3">
							<span class="text-lg font-mono text-base-content/40">#{{ contact.id }}</span>
						</div>
					</div>
				</div>
			</div>
		</State>
	</div>
</template>

<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import ContactTags from '~/components/Chat/ContactInfo/ContactTags.vue'
import ContactFields from '~/components/Chat/ContactInfo/ContactFields.vue'
import ContactCustomFields from '~/components/Chat/ContactInfo/ContactCustomFields.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import StateElement from '~/components/GlobalComponents/StateElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import apiList from '~/apis/ApiList.js'
import dayjs from 'dayjs'
import PauseFlowsDropdown from '~/components/Chat/ContactInfo/PauseFlowsDropdown.vue'

export default {
	components: {
		PauseFlowsDropdown,
		LocalizedLink,
		State,
		StateElement,
		LoadingElement,
		ProfilePicture,
		ContactTags,
		ContactFields,
		ContactCustomFields,
		CustomDropdown,
	},
	props: {
		contactId: {
			type: [String, Number],
			default: null,
		},
		chatAccountId: {
			type: [String, Number],
			default: null,
		},
		showGoToConversationLink: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['selectContactId'],
	setup() {
		return {
			contactsStore: useContactsStore(),
		}
	},
	computed: {
		contact() {
			return this.contactsStore.getContactById(this.contactId)
		},
		isFlowsPaused() {
			if (!this.contact?.flowsPauseUntil) return false
			return new Date(this.contact.flowsPauseUntil) > new Date()
		},
		formattedPauseUntil() {
			if (!this.contact?.flowsPauseUntil) return ''
			return dayjs(this.contact.flowsPauseUntil).format('DD MMM YYYY HH:mm')
		},
	},
	data() {
		return {
			isLoading: false,
			isPauseLoading: false,
		}
	},
	mounted() {
		document.addEventListener('keydown', this.handleKeydown)
		this.fetchContact()
	},
	beforeUnmount() {
		document.removeEventListener('keydown', this.handleKeydown)
	},
	methods: {
		dayjs,
		handleKeydown(event) {
			if (event.key === 'Escape') {
				this.$emit('selectContactId', null)
			}
		},
		async fetchContact() {
			this.isLoading = true
			await this.contactsStore.fetchContact(this.chatAccountId, this.contactId).finally(() => {
				this.isLoading = false
			})
		},
		pauseFlows(durationMinutes) {
			this.isPauseLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.pauseFlows,
					{ durationMinutes },
					{ chatAccountId: this.chatAccountId, slug: this.contactId },
				)
				.then((response) => {
					this.contactsStore.upsert(response.data.contact)
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.isPauseLoading = false
				})
		},
		resumeFlows() {
			this.isPauseLoading = true
			this.$requestAdapter
				.post(
					apiList.chat.instagram.chatAccountId.contacts.contactId.resumeFlows,
					{},
					{ chatAccountId: this.chatAccountId, slug: this.contactId },
				)
				.then((response) => {
					this.contactsStore.upsert(response.data.contact)
				})
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.isPauseLoading = false
				})
		},
	},
}
</script>
