<template>
	<State :is-loading="tagsLoading" :is-error="error">
		<div class="pb-2 border-b border-base-300">
			<div class="flex items-center justify-between mb-2">
				<h5 class="font-medium">{{ $t('components.chat.contactInfo.partials.tag.availableTagsTitle') }}</h5>
				<button @click="fetchAvailableTags(false)" class="btn btn-soft btn-info btn-xs">
					<i class="fa fa-rotate" />
				</button>
			</div>

			<TagBadgeList :tags="filteredAvailableTags" @toggleTag="addTag" />
			<!--			<div class="max-h-32 flex flex-wrap gap-2 overflow-y-auto">-->
			<!--				<div v-for="tag in filteredAvailableTags" :key="tag.id" class="cursor-pointer" @click="addTag(tag)">-->
			<!--					<div-->
			<!--						class="badge badge-sm"-->
			<!--						:style="{-->
			<!--							backgroundColor: tag.color + '20',-->
			<!--						}"-->
			<!--					>-->
			<!--						{{ tag.name }}-->
			<!--						<slot name="tagIcon" v-if="showTagIcon">-->
			<!--							<i class="fa fa-plus text-xs" />-->
			<!--						</slot>-->
			<!--					</div>-->
			<!--				</div>-->
			<!--			</div>-->
		</div>
		<Collapse
			ref="newTagCollapse"
			:show-arrow="true"
			@opened="$refs.tagCreator.$refs.newTagInput.focus()"
			:open="filteredAvailableTags.length === 0"
		>
			<template #title>
				<span>{{ $t('components.chat.contactInfo.partials.tag.createNewTagTitle') }}</span>
			</template>
			<TagCreator ref="tagCreator" :newTag="newTag" :chat-account-id="chatAccountId" @tagCreated="tagCreated" />
		</Collapse>
	</State>
	<!--	<div v-if="tagsLoading" class="flex items-center">-->
	<!--		<loading-element :is-loading="true" />-->
	<!--	</div>-->
	<!--	<div v-else-if="!tagsLoading && !error">-->
	<!--	</div>-->
	<!--	<div v-else class="text-center py-4">-->
	<!--		<state-->
	<!--			:title="$t('components.chat.contactInfo.tag.failedToFetchTitle')"-->
	<!--			show-retry-button-->
	<!--			@retry="fetchAvailableTags"-->
	<!--		/>-->
	<!--	</div>-->
</template>
<script>
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import State from '~/components/GlobalComponents/State.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import TagCreator from '~/components/Chat/ContactInfo/Partials/TagCreator.vue'
import { DEFAULT_TAG_COLOR } from '~/stores/chatAccountAttributes.ts'
import TagBadgeList from '~/components/Chat/ContactInfo/Partials/TagBadgeList.vue'

export default {
	components: { TagBadgeList, TagCreator, Collapse, State, LoadingElement },
	props: {
		chatAccountId: {
			type: [String, Number],
			required: true,
		},
		existingTags: {
			type: Array,
			default: () => [],
		},
		showTagIcon: {
			type: Boolean,
			default: true,
		},

		// dontFetch: {
		// 	type: Boolean,
		// 	default: false,
		// },
	},
	data() {
		return {
			newTag: {
				name: '',
				color: DEFAULT_TAG_COLOR,
			},
			// availableTags: [],
			tagsLoading: false,
			error: false,
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	computed: {
		filteredAvailableTags() {
			return (
				this.availableTags.filter((tag) => !this.existingTags.some((existingTag) => existingTag.name === tag.name)) ??
				[]
			)
		},
		chatAccount() {
			return this.chatAccountsStore.byId(this.chatAccountId)
		},
		availableTags() {
			return this.chatAccountAttributesStore.getTagsByChatAccountId(this.chatAccountId) ?? []
		},
	},
	watch: {
		filteredAvailableTags(newVal) {
			newVal.length === 0 && this.$refs.newTagCollapse?.showCollapse()
		},
	},
	mounted() {
		this.fetchAvailableTags()
	},
	emits: ['addTag', 'retry'],
	methods: {
		async fetchAvailableTags(useInflight = true) {
			this.tagsLoading = true
			this.error = false
			await this.chatAccountAttributesStore
				.fetchTags(this.chatAccountId, useInflight)
				.catch((err) => {
					this.error = true
				})
				.finally(() => {
					this.tagsLoading = false
				})
		},
		resetTagForm() {
			this.newTag = { name: '', color: DEFAULT_TAG_COLOR }
		},
		addTag(tag) {
			this.$emit('addTag', tag)
		},

		tagCreated(tag) {
			this.resetTagForm()
			this.$emit('addTag', tag.data)
		},
	},
}
</script>
