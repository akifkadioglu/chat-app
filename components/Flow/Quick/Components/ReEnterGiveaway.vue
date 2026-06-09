<template>
	<!-- Already Entered Message -->
	<QuickFlowElement
		:node-uuid="alreadyEnteredNode?.uuid"
		:title="$t('components.flow.quick.runGiveaway.alreadyEnteredTitle')"
		show-content
	>
		<template #leading>
			<LoadingElement :isLoading="!flow.id && isFlowSavingAtFirst" />
		</template>
		<template #trailing>
			<input
				class="toggle"
				type="checkbox"
				@change="toggleAlreadyEntered($event.target.checked)"
				:checked="comparisonNode?.uuid"
			/>
		</template>
		<template #content v-if="comparisonNode?.uuid && alreadyEnteredNode?.uuid">
			<div class="space-y-4">
				<TextMessage
					:content="alreadyEnteredNode.config"
					:node="alreadyEnteredNode"
					:placeholder="$t('components.flow.quick.runGiveaway.alreadyEnteredPlaceholder')"
				/>
			</div>
		</template>
	</QuickFlowElement>
</template>
<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import Tag from '~/components/Chat/ContactInfo/Partials/Tag.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import { Flow } from '~/models/Flow/Flow.ts'
import { Node } from '~/models/Flow/Node.ts'
import { DEFAULT_TAG_COLOR } from '~/stores/chatAccountAttributes.ts'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement, QuickFlowElement, Tag, TextMessage },
	props: {
		flow: {
			type: Flow,
		},
	},
	computed: {
		alreadyEnteredNode() {
			return this.flow?.nodes?.find(
				(n) => n.type.key === nodeTypes.commentActions.sendPrivateReply.key && n.config?.alreadyEntered === true,
			)
		},
		comparisonNode() {
			return this.flow?.nodes?.find((n) => n.type.key === nodeTypes.conditions.comparison.key)
		},
		triggerNode() {
			return this.flow?.nodes?.find((n) => n.type.key === nodeTypes.trigger.key)
		},
		addTagNode() {
			return this.flow?.nodes?.find((n) => n.type.key === nodeTypes.actions.addTag.key)
		},
	},
	setup() {
		return {
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	data() {
		return {
			isFlowSavingAtFirst: false,
		}
	},
	watch: {
		'flow.id': {
			async handler(newVal) {
				if (newVal) {
					const tagName = this.getTagName()
					if (this.comparisonNode?.config && !this.comparisonNode.config.value) {
						this.comparisonNode.config.value = tagName
					}

					if (!this.findTag()) {
						await this.addTag(tagName)
					}

					if (this.addTagNode?.config && !this.addTagNode.config.tags) {
						this.addTagNode.config.tags = [this.findTag()]
					}
				}
			},
			immediate: true,
		},
	},
	methods: {
		// Flow save işlemini bekleyen helper method
		waitForFlowSave() {
			return new Promise((resolve) => {
				// Eğer zaten flowStore.flow.id var ise direkt resolve et
				if (this.flow.id) {
					resolve()
					return
				}

				// flowStore.flow.id değişimini dinle
				const unwatch = this.$watch('flow.id', (newValue) => {
					if (newValue) {
						unwatch() // watcher'ı temizle
						resolve()
					}
				})
			})
		},

		async toggleAlreadyEntered(should) {
			if (should && !this.comparisonNode?.uuid) {
				if (!this.flow.id) {
					this.$emitter.emit('saveFlow')
					this.isFlowSavingAtFirst = true
					await this.waitForFlowSave()
				}

				const tagName = this.getTagName()

				const sendPrivateReplyNode = new Node({
					type: nodeTypes.commentActions.sendPrivateReply,
					config: {
						alreadyEntered: true,
						type: 'text',
						text: this.$t('models.flow.utils.quick.runGiveaway.alreadyEnteredMessage'),
						buttons: [
							{
								text: this.$t('models.flow.utils.quick.runGiveaway.visitButton'),
								action: {},
								url: 'simpliers.com',
								websiteLink: true,
							},
						],
					},
				})
				const comparisonNode = new Node({
					type: nodeTypes.conditions.comparison,
					config: {
						field: {
							key: 'tag',
							name: this.$t('models.flow.utils.quick.runGiveaway.comparisonField.name'),
							description: this.$t('models.flow.utils.quick.runGiveaway.comparisonField.description'),
							icon: 'fa fa-tag',
							type: 'tag',
							comparisonType: 'tag',
							categories: ['recommended'],
						},
						operator: 'not_has',
						value: tagName,
					},
				})

				const addTagNode = new Node({
					type: nodeTypes.actions.addTag,
					config: {
						tags: [this.findTag()],
					},
				})
				this.flow.addNode(comparisonNode, this.triggerNode)
				this.flow.addNode(sendPrivateReplyNode, comparisonNode, 'else')
				this.flow.addNode(addTagNode, comparisonNode)
				return
			}
			this.flow.removeNode(this.alreadyEnteredNode)
			this.flow.removeNode(this.comparisonNode)
			this.flow.removeNode(this.addTagNode)
		},
		async addTag(name) {
			await this.chatAccountAttributesStore.createTagRequest(this.flow.chatAccountId, {
				name,
				color: DEFAULT_TAG_COLOR,
			})
		},
		getTagName() {
			return `flow.${this.flow.id}.giveaway`
		},
		findTag() {
			return this.chatAccountAttributesStore
				.getTagsByChatAccountId(this.flow.chatAccountId)
				.find((tag) => tag.name === this.getTagName())
		},
	},
}
</script>

<style scoped></style>
