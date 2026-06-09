<template>
	<div>
		<div v-if="loading && activities.length === 0" class="flex justify-center py-10">
			<LoadingElement />
		</div>
		<div v-else-if="activities.length" class="overflow-x-auto">
			<table class="table table-sm table-zebra w-full">
				<thead class="sticky top-0 bg-base-100 z-1">
					<tr>
						<th class="w-1 whitespace-nowrap" />
						<th>{{ $t('components.accounts.activitiesTab.table.contact') }}</th>
						<th>{{ $t('components.accounts.activitiesTab.table.event') }}</th>
						<th class="text-center">{{ $t('components.accounts.activitiesTab.table.origin') }}</th>
						<th>{{ $t('components.accounts.activitiesTab.table.date') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="activity in activities" :key="activity.id">
						<td class="text-subtle truncate max-w-24" v-tooltip="`#${activity.id}`">#{{ activity.id }}</td>
						<td class="flex items-center gap-2">
							<ProfilePicture
								size="32"
								class="ring-1 rounded-full ring-base-300"
								:src="activity.contact?.platformAccountsInstagram?.profileImageUrl"
								:name="activity.contact?.name"
							/>
							<div class="min-w-0">
								<div class="font-medium text-sm truncate">{{ activity.contact?.name }}</div>
								<div v-if="activity.contact?.platformAccountsInstagram?.username" class="text-xs text-muted truncate">
									@{{ activity.contact.platformAccountsInstagram.username }}
								</div>
							</div>
						</td>
						<td>
							<span
								class="badge badge-soft badge-sm gap-1 whitespace-nowrap"
								:class="{
									'border border-primary/30 badge-primary': activity.typeKey === ACTIVITY_TYPE_KEYS.MESSAGE_SENT,
									'border border-info/30 badge-info': activity.typeKey === ACTIVITY_TYPE_KEYS.MESSAGE_RECEIVED,
									'border border-success/30 badge-success': activity.typeKey === ACTIVITY_TYPE_KEYS.COMMENT_RECEIVED,
									'border border-secondary/30 badge-secondary': activity.typeKey === ACTIVITY_TYPE_KEYS.REPLY_COMMENT,
									'border border-warning/30 badge-warning': activity.typeKey === ACTIVITY_TYPE_KEYS.HIDE_COMMENT,
									'border border-accent/30 badge-accent': activity.typeKey === ACTIVITY_TYPE_KEYS.UNHIDE_COMMENT,
									'border border-base-300/30 badge-ghost': !isRecognizedType(activity.typeKey),
								}"
							>
								<i
									class="text-xs"
									:class="{
										'fa-solid fa-paper-plane': activity.typeKey === ACTIVITY_TYPE_KEYS.MESSAGE_SENT,
										'fa-solid fa-envelope': activity.typeKey === ACTIVITY_TYPE_KEYS.MESSAGE_RECEIVED,
										'fa-solid fa-comment': activity.typeKey === ACTIVITY_TYPE_KEYS.COMMENT_RECEIVED,
										'fa-solid fa-reply': activity.typeKey === ACTIVITY_TYPE_KEYS.REPLY_COMMENT,
										'fa-solid fa-eye-slash': activity.typeKey === ACTIVITY_TYPE_KEYS.HIDE_COMMENT,
										'fa-solid fa-eye': activity.typeKey === ACTIVITY_TYPE_KEYS.UNHIDE_COMMENT,
										'fa-solid fa-bolt': !isRecognizedType(activity.typeKey),
									}"
								/>
								{{ $t(`components.accounts.activitiesTab.typeKeys.${activity.typeKey}`) }}
							</span>
						</td>
						<td>
							<div
								v-tooltip="getOriginTooltip(activity)"
								class="w-6 h-6 rounded-full flex items-center justify-center mx-auto"
								:class="{
									'bg-primary/20 text-primary': activity.originKey === ORIGIN.FLOW,
									'bg-secondary/20 text-secondary': activity.originKey === ORIGIN.AGENT,
									'bg-instagram/20 text-instagram': activity.originKey === ORIGIN.SYSTEM,
								}"
							>
								<i
									class="fa-xs"
									:class="{
										'fa fa-paper-plane': activity.originKey === ORIGIN.FLOW,
										'fa fa-user': activity.originKey === ORIGIN.AGENT,
										'fa fa-mobile-alt': activity.originKey === ORIGIN.SYSTEM,
									}"
								/>
							</div>
						</td>
						<td>
							<span class="text-xs text-muted whitespace-nowrap">{{ getFormattedDate(activity) }}</span>
						</td>
					</tr>
				</tbody>
			</table>
			<div class="text-center py-4">
				<Pagination
					:current-page="currentPage"
					:has-more="hasMore"
					:infinite-scroll="true"
					:loading="loading"
					@page-change="$emit('loadMore', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import Pagination from '~/components/GlobalComponents/Pagination.vue'
import { ORIGIN } from '~/models/Conversation/Message'
import { ACTIVITY_TYPE_KEYS } from '~/models/Activity.ts'

dayjs.extend(relativeTime)
export default {
	components: { LoadingElement, ProfilePicture, Pagination },
	data() {
		return {
			ACTIVITY_TYPE_KEYS,
			ORIGIN,
		}
	},
	props: {
		activities: {
			type: Array,
			default: () => [],
		},
		loading: {
			type: Boolean,
			default: false,
		},
		currentPage: {
			type: Number,
			default: 1,
		},
		hasMore: {
			type: Boolean,
			default: true,
		},
	},
	emits: ['loadMore'],
	computed: {},
	methods: {
		isRecognizedType(typeKey) {
			return [
				ACTIVITY_TYPE_KEYS.MESSAGE_SENT,
				ACTIVITY_TYPE_KEYS.MESSAGE_RECEIVED,
				ACTIVITY_TYPE_KEYS.COMMENT_RECEIVED,
				ACTIVITY_TYPE_KEYS.REPLY_COMMENT,
				ACTIVITY_TYPE_KEYS.HIDE_COMMENT,
				ACTIVITY_TYPE_KEYS.UNHIDE_COMMENT,
			].includes(typeKey)
		},
		getOriginTooltip(activity) {
			//TODO :: Flow'un ismini ekle
			if (activity.originKey === ORIGIN.FLOW) return this.$t('components.accounts.activitiesTab.originTooltips.flow')
			if (activity.originKey === ORIGIN.AGENT) return this.$t('components.accounts.activitiesTab.originTooltips.agent')
			return this.$t('components.accounts.activitiesTab.originTooltips.system')
		},
		getFormattedDate(activity) {
			const date = dayjs(activity.createdAt)
			if (!date.isValid()) return '-'

			const locale = this.$i18n?.locale || 'en'
			return date.locale(locale).format('DD MMMM YYYY HH:mm [GMT]Z')
		},
	},
}
</script>
