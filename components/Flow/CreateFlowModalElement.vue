<template>
	<div
		class="min-h-48 relative flex flex-col h-full rounded-xl border card-transition pt-8 pb-4 px-4 group"
		:class="[
			showPro || community ? 'border-primary' : 'border-muted',
			disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
		]"
	>
		<span v-if="community" class="badge badge-primary badge-soft mb-2 badge-xs">
			{{ $t('components.flow.createFlowModalElement.communityLabel') }}
		</span>
		<span class="absolute top-2 right-2">
			<slot name="icon">
				<div v-if="community" class="relative">
					<ProfilePicture
						:src="postAccount?.profile_picture || postAccount?.profilePicture"
						:alt="postAccount?.username"
						:size="40"
						class="opacity-25"
					/>
				</div>
				<i
					v-else
					class="text-3xl opacity-20 group-hover:text-4xl transition-all duration-300 delay-50"
					:class="iconClass"
				/>
			</slot>
		</span>
		<div class="flex-1 flex flex-col h-full space-y-2">
			<slot>
				<div class="font-medium wrap-break-word" :class="{ 'text-primary': showPro }">
					<template v-if="community">{{ flowName || $t('components.flow.communityTemplatesList.untitled') }}</template>
					<template v-else>{{ title }}</template>
				</div>
			</slot>
			<slot name="description">
				<div
					v-if="community"
					class="text-sm wrap-break-word text-muted flex items-center gap-3 rounded-lg bg-primary/10 p-2"
				>
					<ProfilePicture
						:src="postAccount?.profile_picture || postAccount?.profilePicture"
						:alt="postAccount?.username"
						:size="36"
						class="shrink-0"
					/>
					<div class="min-w-0 flex-1 flex flex-col gap-0.5">
						<div class="flex items-center gap-1 min-w-0">
							<span class="truncate font-semibold text-base-content">{{ postAccount?.username }}</span>
							<IsVerifiedImg v-if="postAccount?.is_verified" class="shrink-0" />
						</div>
						<div class="text-xs">
							<span class="font-semibold text-base-content">
								{{ postAccount?.followers_count_string || postAccount?.followersCountString || '0' }}
							</span>
							{{ $t('components.flow.communityTemplatesList.followers') }}
						</div>
					</div>
				</div>
				<div v-if="community" class="text-xs text-muted mb-4">
					<i18n-t keypath="components.flow.communityTemplatesList.usageCount" tag="span">
						<template #count>
							<b class="font-semibold text-base-content">{{ usageCount }}</b>
						</template>
					</i18n-t>
				</div>
				<div
					v-else
					class="text-sm mb-3 wrap-break-word text-muted"
					:class="{ 'text-primary/50!': showPro && !selectedChatAccount?.subscribed }"
				>
					{{ description }}
				</div>
			</slot>
			<div class="text-end mt-auto">
				<ProBadge v-if="!community && showPro && !selectedChatAccount?.subscribed" />
				<button v-else class="btn btn-sm btn-primary btn-soft">
					{{
						community
							? $t('components.flow.communityTemplatesList.useTemplate')
							: $t('components.flow.createFlowModalElement.getStartedButton')
					}}
					<i class="fa fa-chevron-right link-icon" />
				</button>
			</div>
		</div>
	</div>
</template>
<script>
import LocalizedLink from '~/components/GlobalComponents/LocalizedLink.vue'
import { QUICK_TYPE, QUICK_TYPES } from '~/models/Flow/utils/quick.ts'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import ProfilePicture from '~/components/GlobalComponents/ProfilePicture.vue'
import IsVerifiedImg from '~/components/GlobalComponents/isVerifiedImg.vue'

export default {
	name: 'CreateFlowModalElement',
	components: { ProBadge, LocalizedLink, ProfilePicture, IsVerifiedImg },
	props: {
		title: {
			type: String,
		},
		showPro: {
			type: Boolean,
			default: false,
		},
		description: {
			type: String,
		},
		icon: {
			type: String,
		},
		type: {
			type: QUICK_TYPE,
		},
		iconClass: {
			type: String,
			default: 'fa fa-info-circle',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		community: {
			type: Boolean,
			default: false,
		},
		postAccount: {
			type: Object,
			default: null,
		},
		flowName: {
			type: String,
			default: '',
		},
		usageCount: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			QUICK_TYPES,
		}
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		selectedChatAccount() {
			return this.chatAccountsStore.active
		},
	},
}
</script>
