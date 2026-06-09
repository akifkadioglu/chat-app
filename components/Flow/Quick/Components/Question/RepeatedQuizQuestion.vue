<template>
	<QuickFlowElement
		:showContent="!!sendMessageNode"
		:title="$t('components.flow.quick.components.question.repeatedQuizQuestion.title')"
		:pointerEnabled="!(!flow.id && isFlowSavingAtFirst)"
	>
		<template #leading>
			<LoadingElement :isLoading="!flow.id && isFlowSavingAtFirst" />
		</template>
		<template #trailing>
			<input
				:checked="!!sendMessageNode"
				@change="blockRepeat($event.target.checked)"
				type="checkbox"
				class="checkbox"
			/>
		</template>
		<template #content>
			<TextMessage :content="sendMessageNode.config.contents[0]" :node="sendMessageNode" />
		</template>
	</QuickFlowElement>
</template>
<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import { Node } from '~/models/Flow/Node.ts'
import { DEFAULT_TAG_COLOR } from '~/stores/chatAccountAttributes.ts'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'

export default {
	components: { LoadingElement, QuickFlowElement, TextMessage },
	props: {
		flow: {
			type: Flow,
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
	computed: {
		sendMessageNode() {
			return this.flow.nodes.find((node) => node.config.repeatedQuizMessage)
		},
		triggerNode() {
			return this.flow.nodes.find((node) => node.type.key === nodeTypes.trigger.key)
		},
		comparisonNode() {
			return this.flow.nodes.find((node) => node.type.key === nodeTypes.conditions.comparison.key)
		},
		addTagNode() {
			return this.flow.nodes.find((node) => node.type.key === nodeTypes.actions.addTag.key)
		},
	},
	watch: {
		'flow.id': {
			async handler(newVal) {
				if (newVal) {
					const tagName = this.getTagName()
					if (!this.comparisonNode.config.value) {
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
		async blockRepeat(should) {
			if (should) {
				if (!this.flow.id) {
					this.$emitter.emit('saveFlow')
					this.isFlowSavingAtFirst = true
					await this.waitForFlowSave()
					if (!this.findTag()) {
						await this.addTag(this.getTagName())
					}
				}
				this.addBlockRepeatMessage()
				return
			}
			this.deleteBlockRepeatMessage()
		},
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

		addBlockRepeatMessage() {
			const comparison = new Node({
				type: nodeTypes.conditions.comparison,
				config: {
					field: {
						key: 'tag',
						icon: 'fa fa-tag',
						type: 'tag',
						comparisonType: 'tag',
						name: this.$t('fields.tag.name'),
						description: this.$t('fields.tag.description'),
					},
					value: this.findTag().name,
					operator: 'not_has',
				},
			})
			const addTagNode = new Node({
				type: nodeTypes.actions.addTag,
				config: {
					tags: [this.findTag()],
				},
			})
			const sendMessageNode = new Node({
				type: nodeTypes.actions.sendMessage,
				config: {
					repeatedQuizMessage: true,
					contents: [
						{
							type: 'text',
							text: this.$t('components.flow.quick.components.question.repeatedQuizQuestion.alreadyTakenMessage'),
							buttons: [],
						},
					],
				},
			})
			this.flow.addNode(comparison, this.triggerNode)
			this.flow.addNode(addTagNode, comparison)
			this.flow.addNode(sendMessageNode, comparison, 'else')
		},
		deleteBlockRepeatMessage() {
			this.flow.removeNode(this.sendMessageNode)
			this.flow.removeNode(this.addTagNode)
			this.flow.removeNode(this.comparisonNode)
		},
		async addTag(name) {
			await this.chatAccountAttributesStore.createTagRequest(this.flow.chatAccountId, {
				name,
				color: DEFAULT_TAG_COLOR,
			})
		},

		getTagName() {
			return `flow.${this.flow.id}.quiz_started`
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
