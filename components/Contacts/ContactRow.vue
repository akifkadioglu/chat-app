<template>
	<tr :key="contact.id" @click="$emit('selectContactId', contact.id)">
		<td class="w-10">
			<input
				type="checkbox"
				class="checkbox checkbox-sm cursor-pointer"
				:checked="isSelected"
				@click.stop="$emit('toggleSelect', contact.id)"
			/>
		</td>
		<td class="border-account" :class="borderAccount">
			<div class="flex items-center space-x-3">
				<ProfilePicture
					size="32"
					class="ring-1 rounded-full"
					:class="ringColor"
					:src="contact.platformAccountsInstagram?.profileImageUrl"
				/>
				<span class="text-sm truncate" v-tooltip="contact.firstName">{{ contact.firstName }}</span>
			</div>
		</td>
		<td>
			<div class="flex">
				<span class="text-sm truncate" v-tooltip="contact.lastName">{{ contact.lastName }}</span>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.USERNAME.key]">
			<div class="text-sm opacity-50 flex items-center space-x-1">
				<i :class="`fa-brands fa-${contact.platformAccountsInstagram?.name}`"></i>
				<span class="truncate" v-tooltip="contact.platformAccountsInstagram?.username">
					{{ contact.platformAccountsInstagram?.username }}
				</span>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.EMAIL.key]">
			<div class="flex">
				<a
					v-tooltip="contact.email"
					v-if="contact.email"
					:href="`mailto:${contact.email}`"
					class="link hover:text-simpliers text-sm underline truncate"
					>{{ contact.email }}</a
				>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.NOTES.key]" class="text-sm">
			<div class="flex">
				<span v-tooltip="contact.notes" class="truncate">{{ contact.notes }}</span>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.ADDRESS.key]" class="text-sm">
			<div class="flex">
				<span v-tooltip="contact.address" class="truncate">{{ contact.address }}</span>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.PHONE.key]" class="text-sm">
			<div class="flex">
				<span v-tooltip="contact.phone" class="truncate">{{ contact.phone }}</span>
			</div>
		</td>
		<td v-if="visibleColumns[DEFAULT_COLUMNS.TIMEZONE.key]" class="text-sm">
			<div class="flex">
				<span v-tooltip="contact.timezone" class="truncate">{{ contact.timezone }}</span>
			</div>
		</td>
		<template v-for="customField in filteredCustomFields" :key="customField.key">
			<td v-if="visibleColumns[`custom.${customField.key}`]">
				<div class="flex">
					<span
						v-tooltip="contact.customFieldsValues?.find((field) => field.customFieldId === customField.id)?.value"
						class="truncate"
					>
						{{ contact.customFieldsValues?.find((field) => field.customFieldId === customField.id)?.value }}
					</span>
				</div>
			</td>
		</template>
		<td>
			<label
				for="contact-info"
				@click="$emit('selectContactId', contact.id)"
				class="btn btn-xs btn-ghost btn-transition"
			>
				<i class="fa fa-edit text-xs" />
			</label>

			<!--			<div class="flex flex-wrap gap-1 items-center">-->
			<!--				<div v-for="tag in contact.tags.slice(0, 2)" :key="tag.uuid" class="badge badge-outline">{{ tag.name }}</div>-->
			<!--				<vDropdown>-->
			<!--					<slot name="triggerButton">-->
			<!--						<button class="btn btn-ghost btn-transition">-->
			<!--							<i class="fa fa-edit" />-->
			<!--						</button>-->
			<!--					</slot>-->
			<!--					<template #popper="{ shown }">-->
			<!--						<div class="w-96 p-5 space-y-5 border-account rounded" :class="borderAccount">-->
			<!--							<div>{{ contact.name }}'in sahip olduğu tagler</div>-->
			<!--							<div class="space-x-1 space-y-1" v-auto-animate>-->
			<!--								<button-->
			<!--									v-for="tag in contact.tags"-->
			<!--									:key="tag.uuid"-->
			<!--									class="btn rounded-full h-8 cursor-pointer"-->
			<!--									:class="`bg-tag-${tag.color}-light`"-->
			<!--									@click="removeTag(tag)"-->
			<!--									:disabled="removingTags.includes(tag.id)"-->
			<!--								>-->
			<!--									{{ tag.name }}-->
			<!--									<loading-element size="15" v-if="removingTags.includes(tag.id)" />-->
			<!--									<i v-else class="fa fa-times-circle text-xs" />-->
			<!--								</button>-->
			<!--							</div>-->
			<!--							<div class="divider" />-->
			<!--							<Tag :chat-account-id="contact.chatAccountId" :existing-tags="contact.tags" @add-tag="addTag" />-->
			<!--						</div>-->
			<!--					</template>-->
			<!--				</vDropdown>-->
			<!--			</div>-->
		</td>
	</tr>
</template>
<script>
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import { borderAccountColors, ringColors } from '~/types/colors.js'
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import { DEFAULT_COLUMNS } from '~/models/Contact/Contact.ts'

export default {
	components: { LoadingElement, Tag, ProfilePicture },
	props: {
		contact: {
			type: Object,
		},
		filteredCustomFields: {
			type: Array,
			default: () => [],
		},
		visibleColumns: {
			type: Object,
			default: () => ({}),
		},
		editMode: {
			type: Boolean,
			default: false,
		},
		isSelected: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['selectContactId', 'toggleSelect'],
	setup(props, { emit }) {
		return {
			contactsStore: useContactsStore(),
		}
	},
	data() {
		return {
			DEFAULT_COLUMNS,
			removingTags: [],
		}
	},
	computed: {
		ringColor() {
			const colorIndex = this.contact.chatAccountId % ringColors.length
			return ringColors[colorIndex]
		},
		borderAccount() {
			const colorIndex = this.contact.chatAccountId % borderAccountColors.length
			return borderAccountColors[colorIndex]
		},
	},
}
</script>

<style scoped>
td {
	max-width: 10rem;
}
</style>
