<template>
	<div class="min-h-32">
		<div class="flex justify-between items-center mb-3">
			<h4 class="text-xl">{{ $t('components.chat.contactInfo.contactTags.title') }}</h4>

			<!-- Tag Popover -->
			<CustomDropdown ref="tagPopover" placement="bottom-end">
				<button class="btn btn-ghost btn-xs">
					<i class="fa fa-plus"></i>
					{{ $t('components.chat.contactInfo.contactTags.addTagButton') }}
				</button>

				<template #popper>
					<div class="p-4 max-w-96">
						<Tag :chat-account-id="chatAccountId" :existing-tags="contactTags" @addTag="addTag" />
					</div>
				</template>
			</CustomDropdown>
		</div>
		<!-- Tags Display -->
		<div v-if="contactTags.length > 0" class="flex flex-wrap gap-2" v-auto-animate>
			<div
				v-for="tag in contactTags"
				:key="tag.id || tag.name"
				class="badge gap-2 h-max"
				:style="{
					backgroundColor: tag.color + '20',
				}"
			>
				{{ tag.name }}

				<button
					:disabled="removingTags.includes(tag.id)"
					@click="removeTag(tag.id)"
					class="btn btn-ghost btn-xs p-0 w-4 h-4"
				>
					<loading-element size="15" :is-loading="removingTags.includes(tag.id)">
						<i class="fa fa-times text-xs" />
					</loading-element>
				</button>
			</div>
		</div>
		<div v-else class="text-center py-4">
			<div class="text-base-content/40 text-sm">{{ $t('components.chat.contactInfo.contactTags.emptyState') }}</div>
		</div>
	</div>
</template>

<script>
import Popover from '~/components/GlobalComponents/Popover.vue'
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { useContactsStore } from '~/stores/contacts.js'
import { TagPivot } from '~/models/Contact/Tag.js'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'

export default {
	components: {
		CustomDropdown,
		LoadingElement,
		Tag,
		Popover,
	},
	props: {
		chatAccountId: {
			type: Number,
		},
		contactId: {
			type: Number,
		},
	},
	emits: ['update:tags'],
	setup() {
		return {
			contactsStore: useContactsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			removingTags: [],
		}
	},
	mounted() {
		this.chatAccountAttributesStore.fetchTags(this.chatAccountId)
	},
	computed: {
		contactTags() {
			const tags = this.chatAccountAttributesStore.getTagsByChatAccountId(this.chatAccountId)
			const tagPivots = this.contactsStore.getContactById(this.contactId)?.tagValues ?? []
			return tags.filter((tag) => tagPivots.some((pivot) => pivot.tagId === tag.id))
		},
	},
	methods: {
		async addTag(tag) {
			consoleLog('async addTag', tag)
			const newTagPivot = new TagPivot({
				tag_id: tag.id,
				contact_id: this.contactId,
			})
			await this.contactsStore.addTagRequest(this.contactId, newTagPivot, this.chatAccountId)
			this.$refs.tagPopover.hide()
		},

		async removeTag(tagId) {
			this.removingTags.push(tagId)

			await this.contactsStore
				.removeTagRequest(this.contactId, this.chatAccountId, tagId)
				.catch((err) => {
					consoleLog(err)
				})
				.finally(() => {
					this.removingTags = this.removingTags.filter((id) => id !== tagId)
				})
		},
	},
}
</script>
