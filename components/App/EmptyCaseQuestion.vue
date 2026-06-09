<template>
	<div class="mx-auto flex flex-col flex-1 max-w-xl w-full">
		<div class="my-auto">
			<QuestionElement
				:canContinue="!!modelValue"
				:isLoading="isLoading"
				@continue="$emit('continue')"
				:question="$t(`components.app.emptyCase.questions.${question.key}.question`)"
				:description="$t(`components.app.emptyCase.questions.${question.key}.description`)"
			>
				<div class="space-y-2 mt-5 text-base">
					<AnswerElement
						v-for="option in question.options"
						:key="option.value"
						:value="option.value"
						:label="$t(`components.app.emptyCase.questions.${question.key}.options.${option.value}`)"
						:iconClass="option.icon"
						:modelValue="modelValue"
						@update:modelValue="$emit('update:modelValue', $event)"
					/>
				</div>
			</QuestionElement>
		</div>
	</div>
</template>
<script>
import QuestionElement from '~/components/App/QuestionElement.vue'
import AnswerElement from '~/components/App/AnswerElement.vue'

export default {
	components: { QuestionElement, AnswerElement },
	props: {
		question: { type: Object, required: true },
		modelValue: { type: [String, Number, Boolean], default: null },
		isLoading: { type: Boolean, default: false },
	},
	emits: ['update:modelValue', 'continue'],
}
</script>
