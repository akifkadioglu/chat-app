<template>
	<div class="w-full">
		<span class="flex flex-1 items-center gap-2 whitespace-nowrap">
			<i v-if="keyName === 'addTag'" class="fa fa-user-tag" />
			<i v-else-if="keyName === 'removeTag'" class="fa fa-tag" />
			<i v-else-if="keyName === 'delay'" class="fa fa-clock" />
			<i v-else-if="keyName === 'externalRequest'" class="fa fa-code" />
			<i v-else-if="keyName === 'sendMessage'" class="fa fa-envelope" />
			<i v-else-if="keyName === 'dataCollection'" class="fa fa-clipboard-list" />
			<i v-else-if="keyName === 'triggerFlow'" class="fa fa-paper-plane" />
			<i v-else-if="keyName === 'setContactField'" class="fa fa-pen" />
			<i v-else-if="keyName === 'randomizer'" class="fa fa-random" />
			<i v-else-if="keyName === 'sendPrivateReply'" class="fa fa-reply" />
			<i v-else-if="keyName === 'replyComment'" class="fa fa-comment" />
			<i v-else-if="keyName === 'hideComment'" class="fa fa-eye-slash" />
			<i v-else-if="keyName === 'pauseFlows'" class="fa fa-pause" />
			<i v-else-if="keyName === 'signature'" class="fa fa-signature" />
			<i v-else-if="keyName === 'condition'" class="fa fa-balance-scale" />
			<i v-else class="fa fa-question" />
			<span :class="titleClass" v-if="$te('components.flow.addNodePartials.addActionRenderer.' + keyName + '.title')">
				<i18n-t :keypath="'components.flow.addNodePartials.addActionRenderer.' + keyName + '.title'">
					<template #chat>
						<ChatLogo />
					</template>
				</i18n-t>
			</span>
			<span v-else :class="titleClass">
				{{ $t('components.flow.addNodePartials.addActionRenderer.unknownAction') }}
			</span>

			<ProBadge v-if="showProBadge" />
		</span>

		<span v-if="!hideDescription" class="text-base-content text-xs break-words opacity-70">
			<span v-if="$te('components.flow.addNodePartials.addActionRenderer.' + keyName + '.description')">
				{{ $t('components.flow.addNodePartials.addActionRenderer.' + keyName + '.description') }}
			</span>
			<span v-else>
				{{ $t('components.flow.addNodePartials.addActionRenderer.unknownAction') }}
			</span>
		</span>
	</div>
</template>
<script>
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import ChatLogo from '~/components/GlobalComponents/Brands/ChatLogo.vue'

export default {
	components: { ChatLogo, ProBadge },
	props: {
		keyName: {
			type: String,
			required: true,
		},
		showProBadge: {
			type: Boolean,
			default: false,
		},
		hideDescription: {
			type: Boolean,
			default: false,
		},
		titleClass: {
			type: String,
		},
	},
	computed: {
		iconClass() {
			if (this.keyName === 'addTag') return 'fa fa-user-tag'
			if (this.keyName === 'removeTag') return 'fa fa-tag'
			if (this.keyName === 'delay') return 'fa fa-clock'
			if (this.keyName === 'externalRequest') return 'fa fa-code'
			if (this.keyName === 'sendMessage') return 'fa fa-envelope'
			if (this.keyName === 'dataCollection') return 'fa fa-clipboard-list'
			if (this.keyName === 'triggerFlow') return 'fa fa-paper-plane'
			if (this.keyName === 'setContactField') return 'fa fa-pen'
			if (this.keyName === 'randomizer') return 'fa fa-random'
			if (this.keyName === 'sendPrivateReply') return 'fa fa-reply'
			if (this.keyName === 'replyComment') return 'fa fa-comment'
			if (this.keyName === 'hideComment') return 'fa fa-eye-slash'
			if (this.keyName === 'pauseFlows') return 'fa fa-pause'
			if (this.keyName === 'signature') return 'fa fa-signature'
			return 'fa fa-question'
		},
	},
}
</script>
