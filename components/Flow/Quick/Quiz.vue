<template>
	<div class="w-full">
		<div class="p-5">
			<div class="space-y-6" v-auto-animate>
				<!-- Dev: Quiz Test Runner -->
				<div v-if="isDev" class="border border-warning rounded-xl p-4 space-y-3 bg-warning/5">
					<div class="flex items-center justify-between">
						<div class="font-semibold text-warning text-sm">DEV: Quiz Test Runner</div>
						<div class="flex gap-2">
							<button @click="runAllTests" class="btn btn-warning btn-soft btn-xs" :disabled="testRunning">
								<i class="fa-solid fa-play" />
								Run All Tests
							</button>
							<button @click="runValidation" class="btn btn-outline btn-xs">
								<i class="fa-solid fa-stethoscope" />
								Validate Only
							</button>
						</div>
					</div>

					<div v-if="testLog.length > 0" class="text-xs font-mono space-y-0.5 max-h-60 overflow-y-auto">
						<div
							v-for="(log, i) in testLog"
							:key="i"
							:class="{
								'text-success': log.type === 'pass',
								'text-error': log.type === 'fail',
								'text-info': log.type === 'info',
								'text-warning': log.type === 'step',
							}"
						>
							<span v-if="log.type === 'pass'">PASS</span>
							<span v-else-if="log.type === 'fail'">FAIL</span>
							<span v-else-if="log.type === 'step'"> >> </span>
							<span v-else>INFO</span>
							{{ log.msg }}
						</div>
					</div>

					<div v-if="validationErrors.length > 0" class="border border-error rounded-lg p-3 space-y-1 bg-error/5">
						<div class="font-semibold text-error text-xs">Validation Errors ({{ validationErrors.length }})</div>
						<ul class="text-xs space-y-0.5 list-disc list-inside">
							<li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
						</ul>
					</div>
					<div v-else-if="hasValidated" class="text-xs text-success font-semibold">All validation checks passed</div>
				</div>

				<!-- Header -->
				<div class="flex items-center gap-3">
					<i class="fa-solid fa-reply text-blue-500" />
					<div class="text-lg">{{ $t('components.flow.quick.quiz.title') }}</div>
				</div>
				<div class="border border-muted rounded-xl shadow-xs px-3 py-4">
					<div class="mb-5">
						<div class="flex items-start justify-between gap-3">
							<div class="flex items-center gap-3 min-w-0 flex-1">
								<i class="fa fa-filter" />
								{{ $t('components.flow.node.triggers.receivedDM.filterMessages.title') }}
							</div>
						</div>
						<p class="text-xs text-base-content/70 mt-2">
							{{ $t('components.flow.node.triggers.receivedDM.filterMessages.description') }}
						</p>
					</div>
					<FilterRuleBuilder :options="triggerNodeTrigger.config.wordFilters" />
				</div>

				<!-- Dynamic Questions -->
				<QuestionElement
					v-for="(questionNumber, index) in questionNumbers"
					:key="questionNumber"
					:ref="`questionGroup_${questionNumber}`"
					@deleteQuestion="deleteQuestion"
					:questionNumber="questionNumber"
					:flow="flowStore.flow"
					:questionNumbers="questionNumbers"
					:index="index"
				/>

				<!-- Add Question Button -->
				<div class="text-center space-x-2">
					<button @click="addQuestion" class="btn btn-outline btn-primary" :disabled="questionNumbers.length >= 10">
						<i class="fa-solid fa-plus" />
						{{ $t('components.flow.quick.quiz.addNewQuestion') }}
					</button>
				</div>

				<AfterQuiz
					:failNode="failNode"
					:successNode="successNode"
					:scoreCheckNode="scoreCheckNode"
					:flow="flowStore.flow"
				/>
				<RepeatedQuizQuestion :flow="flowStore.flow" />

				<QuickSignature :flow="flowStore.flow" :fromNodes="[this.successNode, this.failNode]" />
				<PublishElementGroup />
			</div>
		</div>
	</div>
</template>
<script>
import QuickSignature from '~/components/Flow/Quick/Components/QuickSignature.vue'
import QuestionGroup from '~/components/Flow/Quick/Components/Question/QuestionGroup.vue'
import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node.ts'
import { nodeTypes } from '~/models/Flow/utils/utils.ts'
import RepeatedQuizQuestion from '~/components/Flow/Quick/Components/Question/RepeatedQuizQuestion.vue'
import AfterQuiz from '~/components/Flow/Quick/Components/Question/AfterQuiz.vue'
import FilterRuleBuilder from '~/components/Flow/Node/Triggers/Partials/FilterRuleBuilder.vue'
import PublishElementGroup from '~/components/Flow/Quick/PublishElementGroup.vue'
import { validateQuizFlow, runAllTests } from '~/components/Flow/Quick/quizTestHelper.js'

export default {
	components: {
		PublishElementGroup,
		FilterRuleBuilder,
		AfterQuiz,
		RepeatedQuizQuestion,
		QuestionElement: QuestionGroup,
		QuickSignature,
	},
	setup() {
		return {
			flowStore: useFlowStore(),
			chatAccountAttributesStore: useChatAccountAttributesStore(),
		}
	},
	inject: ['canPublish'],
	data() {
		return {
			isDev: import.meta.dev,
			validationErrors: [],
			hasValidated: false,
			testLog: [],
			testRunning: false,
		}
	},
	computed: {
		triggerNode() {
			return this.flowStore.flow?.nodes?.find((node) => node.type.key === nodeTypes.trigger.key)
		},
		triggerNodeTrigger() {
			return this.triggerNode?.triggers?.[0]
		},
		questionNumbers() {
			const questionNodes = this.flowStore.flow?.nodes?.filter((node) => node.config?.isQuestion === true) || []
			const numbers = questionNodes.map((node) => node.config.questionNumber)
			return [...new Set(numbers)].sort((a, b) => a - b)
		},
		lastQuestionNumber() {
			return this.questionNumbers[this.questionNumbers.length - 1]
		},
		nextQuestionNumber() {
			if (this.questionNumbers.length === 0) return 1
			return Math.max(...this.questionNumbers) + 1
		},

		// Connects before the first question
		scoreResetNode() {
			return this.flowStore.flow?.nodes?.find(
				(node) => node.type.key === nodeTypes.actions.setContactField.key && !node.config.questionNumber,
			)
		},
		// Connects after the last question
		scoreCheckNode() {
			return this.flowStore.flow?.nodes?.find((node) => node.config?.isScoreCheck)
		},
		successNode() {
			return this.flowStore.flow?.nodes?.find((node) => node.config?.isSuccess)
		},
		failNode() {
			return this.flowStore.flow?.nodes?.find((node) => node.config?.isFailed)
		},

		lastQuestionNode() {
			return this.findNodeByQuestion(this.lastQuestionNumber, (n) => n.config?.isQuestion)
		},
		lastQuestionFollowUpNode() {
			return this.findNodeByQuestion(this.lastQuestionNumber, (n) => n.config?.isQuestionFollowUp)
		},
		lastQuestionsAnswersNode() {
			return this.findNodeByQuestion(this.lastQuestionNumber, (n) => n.config?.isAnswer && n.config.isCorrect)
		},
		lastQuestionsWrongAnswersNode() {
			return this.findNodeByQuestion(this.lastQuestionNumber, (n) => n.config?.isAnswer && !n.config.isCorrect)
		},
		lastQuestionPointIncrementNode() {
			return this.findNodeByQuestion(this.lastQuestionNumber, (n) => n.config?.increment)
		},

		flowPointCustomField() {
			return this.chatAccountAttributesStore
				.getCustomFieldsByChatAccountId(this.flowStore.flow.chatAccountId)
				.find((field) => field.key === `flow.${this.flowStore.flow.id}.point`)
		},
	},

	watch: {
		'flowStore.flow.id': {
			async handler(newVal) {
				if (newVal) {
					await this.applyFlowPointField()
				}
			},
			immediate: true,
		},
		canPublish: {
			async handler(newVal) {
				if (newVal) {
					await this.applyFlowPointField()
				}
			},
		},
	},

	methods: {
		// Returns the QuestionGroup component instance for a given question number
		getQuestionGroupRef(questionNumber) {
			const refs = this.$refs[`questionGroup_${questionNumber}`]
			return Array.isArray(refs) ? refs[0] : refs
		},

		// --- Node lookup helpers ---

		findQuestionNodes(questionNumber) {
			return this.flowStore.flow?.nodes?.filter((n) => n.config?.questionNumber === questionNumber) || []
		},
		findNodeByQuestion(questionNumber, predicate) {
			return this.findQuestionNodes(questionNumber).find(predicate)
		},

		// Returns the last nodes of a question group (the exit points that connect to the next group)
		questionGroupLastNodes(questionNumber) {
			const nodes = this.findQuestionNodes(questionNumber)
			const followUpNode = nodes.find((n) => n.config.isQuestionFollowUp)
			if (followUpNode) return [followUpNode]

			const correctExit = nodes.find((n) => n.config.isAnswer && n.config.isCorrect)
				|| nodes.find((n) => n.config.increment)
			const wrongExit = nodes.find((n) => n.config.isAnswer && !n.config.isCorrect)
				|| nodes.find((n) => n.config.isQuestion)

			return [correctExit, wrongExit]
		},

		// Finds the guard on the edge from a question node to the current question being deleted
		findGuardToQuestion(lastNode, targetQuestionNode) {
			if (!lastNode.config.isQuestion) return null
			return lastNode.toEdges.find((edge) => edge.toNodeUuid === targetQuestionNode.uuid)?.guard || null
		},

		// --- Adding questions ---

		createQuestionNodes(questionNumber, correctPayload, wrongPayload) {
			const questionNode = new Node({
				type: nodeTypes.actions.sendMessage,
				name: this.$t('components.flow.quick.quiz.questionName', { questionNumber }),
				config: {
					contents: [
						{
							type: 'text',
							text: this.$t('components.flow.quick.quiz.questionText', { questionNumber }),
							buttons: [],
						},
					],
					quickReplies: [
						{ content_type: 'text', title: this.$t('components.flow.quick.quiz.defaultOption1'), payload: correctPayload },
						{ content_type: 'text', title: this.$t('components.flow.quick.quiz.defaultOption2'), payload: wrongPayload },
					],
					questionNumber,
				},
				triggers: [
					{ type: { key: 'quickReply' }, config: { postback: correctPayload } },
					{ type: { key: 'quickReply' }, config: { postback: wrongPayload } },
				],
			})

			const wrongAnswerNode = new Node({
				type: nodeTypes.actions.sendMessage,
				name: this.$t('components.flow.quick.quiz.wrongAnswerName', { questionNumber }),
				config: {
					questionNumber,
					isAnswer: true,
					isCorrect: false,
					contents: [{ type: 'text', text: this.$t('components.flow.quick.quiz.wrongAnswerText'), buttons: [] }],
				},
			})

			const pointNode = new Node({
				type: nodeTypes.actions.setContactField,
				name: '',
				config: {
					questionNumber,
					increment: true,
					field: {
						name: 'point',
						description: this.$t('components.flow.quick.quiz.customFieldDescription'),
						icon: 'fa fa-hashtag',
						type: 'integer',
						comparisonType: 'integer',
					},
					operation: 'increment',
					value: 1,
				},
			})

			const correctAnswerNode = new Node({
				type: nodeTypes.actions.sendMessage,
				name: this.$t('components.flow.quick.quiz.correctAnswerName', { questionNumber }),
				config: {
					questionNumber,
					isAnswer: true,
					isCorrect: true,
					contents: [{ type: 'text', text: this.$t('components.flow.quick.quiz.correctAnswerText'), buttons: [] }],
				},
			})

			const followUpNode = new Node({
				type: nodeTypes.actions.sendMessage,
				name: this.$t('components.flow.quick.quiz.followUpMessageName', { questionNumber }),
				config: {
					questionNumber,
					isQuestionFollowUp: true,
					contents: [{ type: 'text', text: this.$t('components.flow.quick.quiz.followUpMessageText'), buttons: [] }],
				},
			})

			return { questionNode, wrongAnswerNode, pointNode, correctAnswerNode, followUpNode }
		},

		connectNewQuestionToFlow(newQuestionNode) {
			this.flowStore.flow.nodes.push(newQuestionNode)

			// First question — connect from score reset
			if (!this.lastQuestionNode) {
				this.flowStore.flow.addEdge(this.scoreResetNode, newQuestionNode)
			}
			// Previous question has a follow-up — connect from it
			else if (this.lastQuestionFollowUpNode) {
				this.flowStore.flow.addEdge(this.lastQuestionFollowUpNode, newQuestionNode)
			}
			// Connect from both exit paths of the previous question
			else {
				this.connectWrongPath(newQuestionNode)
				this.connectCorrectPath(newQuestionNode)
			}

			newQuestionNode.config.value.isQuestion = true
		},

		connectWrongPath(targetNode) {
			if (this.lastQuestionsWrongAnswersNode) {
				this.flowStore.flow.addEdge(this.lastQuestionsWrongAnswersNode, targetNode)
				return
			}
			const guard = this.flowStore.flow.edges.find(
				(edge) => edge.fromNodeUuid === this.lastQuestionNode?.uuid && edge.toNodeUuid === this.scoreCheckNode?.uuid,
			)?.guard
			this.flowStore.flow.addEdge(this.lastQuestionNode, targetNode, guard)
		},

		connectCorrectPath(targetNode) {
			const fromNode = this.lastQuestionsAnswersNode || this.lastQuestionPointIncrementNode
			this.flowStore.flow.addEdge(fromNode, targetNode)
		},

		async addQuestion() {
			const questionNumber = this.nextQuestionNumber
			const correctPayload = v4()
			const wrongPayload = v4()

			const { questionNode, wrongAnswerNode, pointNode, correctAnswerNode, followUpNode } =
				this.createQuestionNodes(questionNumber, correctPayload, wrongPayload)

			this.connectNewQuestionToFlow(questionNode)

			this.flowStore.flow.addNode(wrongAnswerNode, questionNode, wrongPayload)
			this.flowStore.flow.addNode(pointNode, questionNode, correctPayload)
			this.flowStore.flow.addNode(correctAnswerNode, pointNode)
			this.flowStore.flow.addNode(followUpNode, correctAnswerNode)
			this.flowStore.flow.addEdge(wrongAnswerNode, followUpNode)

			this.reconnectToScoreCheck(followUpNode)
		},

		// --- Deleting questions ---

		deleteQuestion(questionNumber) {
			const questionNodes = this.findQuestionNodes(questionNumber)
			const currentQuestion = questionNodes.find((n) => n.config.isQuestion)
			const currentIndex = this.questionNumbers.indexOf(questionNumber)

			const prevNumber = this.questionNumbers[currentIndex - 1]
			const nextNumber = this.questionNumbers[currentIndex + 1]
			const nextQuestionNode = this.findNodeByQuestion(nextNumber, (n) => n.config.isQuestion)

			if (prevNumber) {
				const prevLastNodes = this.questionGroupLastNodes(prevNumber)

				prevLastNodes.forEach((lastNode) => {
					const guard = this.findGuardToQuestion(lastNode, currentQuestion)

					if (nextNumber) {
						this.flowStore.flow.addEdge(lastNode, nextQuestionNode, guard)
					} else {
						this.reconnectToScoreCheck(lastNode, guard)
					}
				})
			} else if (nextNumber) {
				this.flowStore.flow.addEdge(this.scoreResetNode, nextQuestionNode)
			}

			questionNodes.forEach((node) => {
				this.flowStore.flow.removeNode(node)
			})
		},

		// --- Score check ---

		reconnectToScoreCheck(fromNode, guard = null) {
			this.flowStore.flow.edges
				.filter((edge) => edge.toNodeUuid === this.scoreCheckNode.uuid)
				.forEach((edge) => {
					this.flowStore.flow.removeEdge(edge)
				})
			this.$nextTick(() => {
				this.flowStore.flow.addEdge(fromNode, this.scoreCheckNode, guard)
			})
		},

		// --- Dev: Validation & Testing ---

		runValidation() {
			this.hasValidated = true
			this.validationErrors = validateQuizFlow(this)
		},

		async runAllTests() {
			this.testRunning = true
			this.testLog = []
			this.validationErrors = []
			this.hasValidated = false

			const result = await runAllTests(this)

			this.testLog = result.testLog
			this.validationErrors = result.validationErrors
			this.hasValidated = true
			this.testRunning = false
		},

		// --- Custom field management ---

		async addCustomField(fieldKey) {
			await this.chatAccountAttributesStore.createCustomFieldRequest(
				this.flowStore.flow.chatAccountId,
				fieldKey,
				'integer',
			)
		},
		async applyFlowPointField() {
			const hasField = this.flowPointCustomField
			if (!hasField) {
				await this.addCustomField(`flow.${this.flowStore.flow.id}.point`)
			}
			const fieldKey = `custom.${this.flowPointCustomField.key}`
			this.flowStore.flow.nodes
				.filter((node) => node.type.key === nodeTypes.actions.setContactField.key)
				.forEach((node) => {
					if (!node.config.field.key) {
						node.config.field.key = fieldKey
					}
				})

			if (!this.scoreCheckNode?.config?.field.key) {
				this.scoreCheckNode.config.field.key = fieldKey
			}
		},
	},
}
</script>
