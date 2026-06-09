<template>
	<Collapse
		:title="$t('components.flow.quick.components.question.afterQuiz.title')"
		open
		showArrow
		class="border border-subtle rounded-lg"
	>
		<div class="space-y-5">
			<!-- Success Message -->
			<QuickFlowElement
				v-if="successNode?.uuid"
				:node-uuid="successNode.uuid"
				:title="$t('components.flow.quick.components.question.afterQuiz.successMessage.title')"
				show-content
				show-helper-text
				:helper-text="$t('components.flow.quick.components.question.afterQuiz.successMessage.helperText')"
				:pointer-enabled="false"
			>
				<template #icon>
					<i class="fa-solid fa-trophy text-success" />
				</template>
				<template #content>
					<TextMessage :content="successNode?.config?.contents?.[0]" :node="successNode" />
				</template>
			</QuickFlowElement>
			<!-- Score Threshold Setting -->
			<QuickFlowElement
				v-if="scoreCheckNode"
				:node-uuid="scoreCheckNode?.uuid"
				titleClass="truncate"
				:title="$t('components.flow.quick.components.question.afterQuiz.scoreThreshold.title')"
				:helperText="$t('components.flow.quick.components.question.afterQuiz.scoreThreshold.helperText')"
				showHelperText
			>
				<template #icon> <i class="fa-solid fa-bullseye text-warning" /> </template>
				<template #trailing>
					<input
						type="number"
						@focus="$event.target.select()"
						v-model="scoreCheckNode.config.value"
						class="input w-14"
						min="0"
						step="10"
					/>
				</template>
			</QuickFlowElement>
			<!-- Failure Message -->
			<QuickFlowElement
				v-if="failNode?.uuid"
				:node-uuid="failNode.uuid"
				:title="$t('components.flow.quick.components.question.afterQuiz.failureMessage.title')"
				show-content
				show-helper-text
				:helper-text="$t('components.flow.quick.components.question.afterQuiz.failureMessage.helperText')"
				:pointer-enabled="false"
			>
				<template #icon>
					<i class="fa-solid fa-heart-crack text-error" />
				</template>
				<template #content>
					<TextMessage :content="failNode?.config?.contents?.[0]" :node="failNode" />
				</template>
			</QuickFlowElement>
		</div>
	</Collapse>
</template>
<script>
import TextMessage from '~/components/Flow/Node/Actions/SendMessagePartials/TextMessage.vue'
import Collapse from '~/components/GlobalComponents/Collapse.vue'
import QuickFlowElement from '~/components/Flow/Quick/Components/QuickFlowElement.vue'
import { Flow } from '~/models/Flow/Flow.ts'
import { Node } from '~/models/Flow/Node.ts'

export default {
	components: { QuickFlowElement, Collapse, TextMessage },
	props: {
		flow: {
			type: Flow,
			required: true,
		},
		scoreCheckNode: {
			type: Node,
			required: true,
		},
		successNode: {
			type: Node,
			required: true,
		},
		failNode: {
			type: Node,
			required: true,
		},
	},
}
</script>

<style scoped></style>
