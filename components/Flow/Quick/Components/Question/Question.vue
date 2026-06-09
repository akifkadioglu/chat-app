<template>
	<!-- Question Setup -->
	<QuickFlowElement
		:node-uuid="questionNode?.uuid"
		show-content
		show-helper-text
		:helper-text="$t('components.flow.quick.components.question.helperText')"
		:pointer-enabled="false"
	>
		<div class="flex items-center justify-between">
			<div>
				<i class="fa-solid fa-question-circle text-blue-500" />
				<span>{{ $t('components.flow.quick.components.question.title') }}</span>
			</div>
			<div class="flex items-baseline justify-between w-fit gap-1">
				<!--				<button class="btn-link" @click="pointNode.config.value += 5">-->
				<!--					<i class="fa fa-plus" />-->
				<!--				</button>-->
				<input
					@focus="$event.target.select()"
					v-model="pointNode.config.value"
					type="number"
					class="input input-xs w-12"
					:min="0"
				/>
				<span class="text-sm">{{ $t('components.flow.quick.components.question.pointLabel') }}</span>
				<!--				<button class="btn-link" @click="pointNode.config.value -= 5">-->
				<!--					<i class="fa fa-minus" />-->
				<!--				</button>-->
			</div>
		</div>
		<template #content>
			<div class="space-y-4">
				<!-- Question Preview -->
				<TextMessage :content="questionNodeConfigContent" :node="questionNode" hideButtons />
				<!-- Answer Options -->
				<div class="space-y-3">
					<div class="flex items-baseline justify-between">
						<h4 class="font-medium text-sm">{{ $t('components.flow.quick.components.question.answersTitle') }}</h4>
						<button
							class="btn btn-xs btn-outline btn-primary"
							@click="addQuickReply"
							:disabled="questionNodeConfigContent?.quick_replies?.length >= 10"
						>
							<i class="fa-solid fa-plus mr-1" />
							{{ $t('components.flow.quick.components.question.addAnswerButton') }}
						</button>
					</div>

					<QuickReply
						v-for="(quickReply, index) in questionNode?.config?.quickReplies || []"
						:key="index"
						:quickReply="quickReply"
						:incrementContactFieldNodeGuard="incrementContactFieldNodeGuard"
						:wrongAnswerGuard="wrongAnswerGuard"
						:index="index"
						:questionReplies="questionNode?.config?.quickReplies"
					/>

					<div
						v-if="!questionNode?.config?.quickReplies || questionNode?.config?.quickReplies?.length === 0"
						class="text-center py-4 text-base-content/60"
					>
						<i class="fa-solid fa-list-ul text-2xl mb-2 block" />
						<p class="text-sm">{{ $t('components.flow.quick.components.question.noAnswersYet') }}</p>
					</div>
				</div>
			</div>
		</template>
	</QuickFlowElement>
</template>
<script>
import CustomDropdown from '~/components/GlobalComponents/CustomDropdown.vue'
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import QuickReply from '~/components/Flow/Quick/Components/Question/QuickReply.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import { Node } from '~/models/Flow/Node.ts'
import { v4 } from 'uuid'

export default {
	components: { QuickReply, QuickFlowElement, TextMessage, CustomDropdown },
	props: {
		flow: {
			type: Flow,
			required: true,
		},
		questionNumber: {
			type: Number,
			required: true,
		},
		pointNode: {
			type: Node,
			required: true,
		},
	},

	computed: {
		questionNodeConfigContent() {
			return this.questionNode?.config?.contents?.[0]
		},
		questionNode() {
			return this.flow.nodes.find(
				(node) => node.config.questionNumber === this.questionNumber && node.config.isQuestion,
			)
		},
		incrementContactFieldNode() {
			return this.flow.nodes.find((node) => node.config.questionNumber === this.questionNumber && node.config.increment)
		},
		incrementContactFieldNodeGuard() {
			return this.flow.edges.find((edge) => edge.toNodeUuid === this.incrementContactFieldNode?.uuid)?.guard
		},
		wrongAnswerNode() {
			return this.flow.nodes.find(
				(node) => node.config.questionNumber === this.questionNumber && !node.config.isCorrect && node.config.isAnswer,
			)
		},
		wrongAnswerGuard() {
			return this.flow.edges.find((edge) => edge.toNodeUuid === this.wrongAnswerNode?.uuid)?.guard
		},
	},

	methods: {
		addQuickReply() {
			if (!this.questionNode?.config?.quickReplies) {
				this.questionNode.config.quickReplies = []
			}

			this.questionNode?.config.quickReplies.push({
				uuid: v4(),
				title: '',
				payload: this.wrongAnswerGuard,
				content_type: 'text',
			})
		},
	},
}
</script>

<style scoped></style>
