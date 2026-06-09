<template>
	<div class="flex">
		<CustomDropdown
			ref="addTriggerDropdown"
			:popperTriggers="[]"
			container="#appPage"
			placement="bottom-start"
			@show="onDropdownShow"
			@hide="onDropdownHide"
		>
			<button
				ref="addTriggerButton"
				class="btn btn-primary btn-transition"
				type="button"
				:disabled="!triggerTypes.length"
				@click.stop
			>
				<i class="fa fa-plus" />
				{{ $t('components.flow.addNodePartials.addTrigger.buttonText') }}
			</button>

			<template #popper="{ shown }">
				<div class="menu bg-base-100 rounded-lg shadow-lg mt-1" :inert="!shown">
					<ul class="w-auto min-w-max">
						<li
							v-for="triggerType in triggerTypes"
							class="menu-item my-2 block"
							@click="addTrigger(triggerType)"
							:key="triggerType.key"
						>
							<a class="flex items-start gap-3">
								<i class="fa text-sm mt-1" :class="icons[triggerType.key]" />
								<div class="flex flex-col flex-1">
									<div class="flex">
										<span class="font-medium text-sm">
											{{ $t('components.flow.node.triggers.' + triggerType.key + '.title') }}
										</span>
										<span v-if="triggerType.needsPro" class="ml-5">
											<ProBadge />
										</span>
									</div>
									<div class="text-xs text-base-content/60 mt-1">
										{{ $t('components.flow.node.triggers.' + triggerType.key + '.description') }}
									</div>
								</div>
							</a>
						</li>
					</ul>
				</div>
			</template>
		</CustomDropdown>
	</div>
</template>
<script>
import { nodeTypes, triggerTypes } from '~/models/Flow/utils/utils.js'
import { Trigger } from '~/models/Flow/Trigger.js'
import { Node } from '~/models/Flow/Node.js'
import { availableTriggerTypeKeys } from '~/models/Flow/TriggerType.js'
import ProBadge from '~/components/Flow/AddNodePartials/ProBadge.vue'
import { defaultTriggerConfigs } from '~/models/Flow/utils/defaultConfigs.ts'
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
// import { v4 } from 'uuid'

export default {
	name: 'AddTrigger',
	components: { CustomDropdown, ProBadge },
	props: {
		node: {
			type: Node,
			required: true,
		},
	},
	setup() {
		return {
			chatAccountsStore: useChatAccountsStore(),
		}
	},
	computed: {
		triggerTypes() {
			return Object.values(triggerTypes).filter(
				(t) => !this.node.triggers.find((nt) => nt.type.key === t.key) && availableTriggerTypeKeys.includes(t.key),
			)
		},
		selectedChatAccount() {
			return this.chatAccountsStore.active
		},
	},
	emits: ['triggerAdded'],
	data() {
		const icons = {
			[triggerTypes.storyMention.key]: 'fa fa-at',
			[triggerTypes.commentOnPost.key]: 'fa fa-comment',
			[triggerTypes.replyToStory.key]: 'fa fa-reply',
			[triggerTypes.receivedDM.key]: 'fa fa-envelope',
			[triggerTypes.commentOnLive.key]: 'fa fa-video',
		}
		return {
			icons,
			allTriggerTypes: triggerTypes,
		}
	},
	methods: {
		addTrigger(triggerType) {
			if (triggerType.needsPro && !this.selectedChatAccount.subscribed) {
				this.$refs.addTriggerDropdown.hide()
				this.$emitter.emit('showUpgradeModal', {
					chatAccount: this.selectedChatAccount,
					feature: 'addTrigger',
				})
				return
			}

			const defaultConfig = defaultTriggerConfigs(this.$t)[triggerType.key]
			const trigger = new Trigger({ type: triggerType, config: defaultConfig || {} })
			this.node.addTrigger(trigger)
			this.$refs.addTriggerDropdown.hide()

			this.$nextTick(() => {
				this.$emit('triggerAdded', trigger)
			})
		},
		onDropdownShow() {},
		onDropdownHide() {},
	},
}
</script>
