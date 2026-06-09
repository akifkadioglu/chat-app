<template>
	<div class="w-full">
		<Collapse
			v-if="pointNode"
			class="border border-subtle !rounded-lg"
			:open="isNewFlow"
			content-class="space-y-6"
			showArrow
		>
			<template #title>
				<div class="flex items-center justify-between">
					<div class="truncate">
						<div>
							{{ $t('components.flow.quick.components.question.questionGroup.questionNumber', { index: index + 1 }) }}
						</div>
						<small class="text-muted">
							{{ questionNodeConfigContent?.text }}
						</small>
					</div>
					<div class="badge badge-sm badge-info badge-soft flex-shrink-0">
						{{
							$t('components.flow.quick.components.question.questionGroup.points', { points: pointNode.config.value })
						}}
					</div>
				</div>
			</template>
			<Question :flow="flow" :questionNumber="questionNumber" :pointNode="pointNode" />

			<!-- Answer -->
			<QuickFlowElement
				:node-uuid="questionNode?.uuid"
				:title="$t('components.flow.quick.components.question.questionGroup.correctAnswerMessage.title')"
				show-content
				show-helper-text
				:helper-text="$t('components.flow.quick.components.question.questionGroup.correctAnswerMessage.helperText')"
			>
				<template #trailing>
					<input
						class="toggle toggle-sm"
						type="checkbox"
						:checked="!!answerNode"
						@change="toggleAnswer($event.target.checked)"
					/>
				</template>
				<template #icon>
					<i class="fa-solid fa-check-circle text-success" />
				</template>
				<template #content v-if="answerNode">
					<TextMessage :content="answerNodeConfigContent" :node="answerNode" hideButtons />
				</template>
			</QuickFlowElement>

			<!-- Wrong Answer -->
			<QuickFlowElement
				:node-uuid="questionNode?.uuid"
				:title="$t('components.flow.quick.components.question.questionGroup.wrongAnswerMessage.title')"
				show-content
				show-helper-text
				:helper-text="$t('components.flow.quick.components.question.questionGroup.wrongAnswerMessage.helperText')"
			>
				<template #trailing>
					<input
						class="toggle toggle-sm"
						type="checkbox"
						:checked="!!wrongAnswerNode"
						@change="toggleWrongAnswer($event.target.checked)"
					/>
				</template>
				<template #icon>
					<i class="fa-solid fa-times-circle text-error" />
				</template>
				<template #content v-if="wrongAnswerNode">
					<TextMessage :content="wrongAnswerNodeConfigContent" :node="wrongAnswerNode" hideButtons />
				</template>
			</QuickFlowElement>

			<!-- follow up Message -->
			<QuickFlowElement
				:node-uuid="questionNode?.uuid"
				:title="$t('components.flow.quick.components.question.questionGroup.followUpMessage.title')"
				show-content
				show-helper-text
				:helper-text="$t('components.flow.quick.components.question.questionGroup.followUpMessage.helperText')"
			>
				<template #icon>
					<i class="fa-solid fa-arrow-right text-info" />
				</template>
				<template #trailing>
					<input
						class="toggle toggle-sm"
						type="checkbox"
						:checked="!!followUpNode"
						@change="toggleFollowUpNode($event.target.checked)"
					/>
				</template>

				<template #content v-if="followUpNode">
					<TextMessage :content="followUpNodeConfigContent" :node="followUpNode" hideButtons />
				</template>
			</QuickFlowElement>

			<div class="flex justify-end">
				<button
					class="btn btn-error btn-soft btn-sm btn-transition"
					@click.prevent="$emit('deleteQuestion', questionNumber)"
				>
					<i class="fa fa-trash" />
				</button>
			</div>
		</Collapse>
	</div>
</template>
<script>
import { Flow } from '~/models/Flow/Flow.ts'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import Question from '~/components/Flow/Quick/Components/Question/Question.vue'
import { Node } from '~/models/Flow/Node.ts'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'

export default {
	components: {
		Question,
		Collapse,
		QuickFlowElement,
		TextMessage,
	},
	props: {
		questionNumber: {
			type: Number,
			required: true,
		},
		flow: {
			type: Flow,
			required: true,
		},
		questionNumbers: {
			type: Array,
			required: true,
		},
		index: {
			type: Number,
		},
	},
	data() {
		return {
			isNewFlow: !this.flow.id,
		}
	},
	computed: {
		questionNode() {
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === this.questionNumber && n.config.isQuestion,
			)
		},
		questionNodeConfigContent() {
			return this.questionNode?.config?.contents?.[0]
		},
		pointNode() {
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === this.questionNumber && n.config.increment,
			)
		},
		answerNode() {
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === this.questionNumber && n.config.isCorrect && n.config.isAnswer,
			)
		},
		answerNodeConfigContent() {
			return this.answerNode?.config?.contents?.[0]
		},
		wrongAnswerNode() {
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === this.questionNumber && !n.config.isCorrect && n.config.isAnswer,
			)
		},
		wrongAnswerNodeConfigContent() {
			return this.wrongAnswerNode?.config?.contents?.[0]
		},
		followUpNode() {
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === this.questionNumber && n.config.isQuestionFollowUp,
			)
		},
		followUpNodeConfigContent() {
			return this.followUpNode?.config?.contents?.[0]
		},

		// --- Navigation ---

		nextQuestionNode() {
			const nextIndex = this.questionNumbers.indexOf(this.questionNumber) + 1
			const nextNumber = this.questionNumbers[nextIndex]
			return this.flow.nodes.find(
				(n) => n.config.questionNumber === nextNumber && n.config.isQuestion,
			)
		},
		scoreCheckNode() {
			return this.flow.nodes.find((n) => n.config.isScoreCheck)
		},
		// Where this question group's exit paths should lead
		destination() {
			return this.nextQuestionNode || this.scoreCheckNode
		},

		// --- Path guards (derived from triggers, so they survive edge removals) ---

		correctPathGuard() {
			return this.questionNode?.toEdges?.find((e) => e.toNodeUuid === this.pointNode?.uuid)?.guard
		},
		wrongPathGuard() {
			const triggers = this.questionNode?.triggers || []
			for (const trigger of triggers) {
				const postback = trigger.config?.postback
				if (postback && postback !== this.correctPathGuard) return postback
			}
			return null
		},
	},

	methods: {
		// ┌─────────────────────────────────────────────────────────────────┐
		// │ Question group edge structure:                                  │
		// │                                                                │
		// │ Correct path:                                                  │
		// │   questionNode →(correctGuard)→ pointNode → [answerNode]  ─┐   │
		// │                                                            │   │
		// │ Wrong path:                                        converge│   │
		// │   questionNode →(wrongGuard)→ [wrongAnswerNode] ──────────→┤   │
		// │                                                            │   │
		// │                                    [followUpNode] ←────────┘   │
		// │                                         │                      │
		// │                                    destination                  │
		// │                                                                │
		// │ Brackets [] = optional (toggled by user)                       │
		// └─────────────────────────────────────────────────────────────────┘

		// --- Core: declarative edge rebuild ---

		rebuildQuestionEdges() {
			// The node where both paths converge
			const convergence = this.followUpNode || this.destination

			// 1. Clear all dynamic edges (keep only questionNode → pointNode)
			this.removeOutgoingEdges(this.pointNode)
			this.removeOutgoingEdges(this.answerNode)
			this.removeOutgoingEdges(this.wrongAnswerNode)
			this.removeOutgoingEdges(this.followUpNode)

			const wrongEdge = this.questionNode?.toEdges?.find((e) => e.toNodeUuid !== this.pointNode?.uuid)
			if (wrongEdge) this.flow.removeEdge(wrongEdge)

			// 2. Correct path: pointNode → [answerNode] → convergence
			if (this.answerNode) {
				this.flow.addEdge(this.pointNode, this.answerNode)
				this.flow.addEdge(this.answerNode, convergence)
			} else {
				this.flow.addEdge(this.pointNode, convergence)
			}

			// 3. Wrong path: questionNode →(wrongGuard)→ [wrongAnswerNode] → convergence
			if (this.wrongAnswerNode) {
				this.flow.addEdge(this.questionNode, this.wrongAnswerNode, this.wrongPathGuard)
				this.flow.addEdge(this.wrongAnswerNode, convergence)
			} else {
				this.flow.addEdge(this.questionNode, convergence, this.wrongPathGuard)
			}

			// 4. Follow-up → destination (if follow-up exists, it IS the convergence)
			if (this.followUpNode) {
				this.flow.addEdge(this.followUpNode, this.destination)
			}
		},

		// --- Node helpers ---

		removeOutgoingEdges(node) {
			if (!node) return
			const edges = this.flow.edges.filter((e) => e.fromNodeUuid === node.uuid)
			edges.forEach((e) => this.flow.removeEdge(e))
		},

		removeNodeFromFlow(node) {
			const edges = this.flow.edges.filter(
				(e) => e.fromNodeUuid === node.uuid || e.toNodeUuid === node.uuid,
			)
			edges.forEach((e) => this.flow.removeEdge(e))
			const idx = this.flow.nodes.indexOf(node)
			if (idx !== -1) this.flow.nodes.splice(idx, 1)
		},

		// --- Toggle methods (add/remove node → rebuild all edges) ---

		toggleAnswer(should) {
			if (should && !this.answerNode) {
				this.flow.nodes.push(
					new Node({
						type: nodeTypes.actions.sendMessage,
						config: {
							questionNumber: this.questionNumber,
							isAnswer: true,
							isCorrect: true,
							contents: [
								{
									type: 'text',
									text: this.$t('components.flow.quick.components.question.questionGroup.correctAnswerDefaultText'),
									buttons: [],
								},
							],
						},
					}),
				)
			} else if (!should && this.answerNode) {
				this.removeNodeFromFlow(this.answerNode)
			}
			this.rebuildQuestionEdges()
		},

		toggleWrongAnswer(should) {
			if (should && !this.wrongAnswerNode) {
				this.flow.nodes.push(
					new Node({
						type: nodeTypes.actions.sendMessage,
						config: {
							questionNumber: this.questionNumber,
							isAnswer: true,
							isCorrect: false,
							contents: [
								{
									type: 'text',
									text: this.$t('components.flow.quick.components.question.questionGroup.wrongAnswerDefaultText'),
									buttons: [],
								},
							],
						},
					}),
				)
			} else if (!should && this.wrongAnswerNode) {
				this.removeNodeFromFlow(this.wrongAnswerNode)
			}
			this.rebuildQuestionEdges()
		},

		toggleFollowUpNode(should) {
			if (should && !this.followUpNode) {
				this.flow.nodes.push(
					new Node({
						type: nodeTypes.actions.sendMessage,
						config: {
							questionNumber: this.questionNumber,
							isQuestionFollowUp: true,
							contents: [
								{
									type: 'text',
									text: this.$t('components.flow.quick.components.question.questionGroup.followUpDefaultText', {
										score: '{{custom.point}}',
									}),
									buttons: [],
								},
							],
						},
					}),
				)
			} else if (!should && this.followUpNode) {
				this.removeNodeFromFlow(this.followUpNode)
			}
			this.rebuildQuestionEdges()
		},
	},
}
</script>
