<template>
	<div
		class="rounded-lg border border-base-200 p-2"
		:class="{
			'bg-success/10': isCorrect,
			'bg-error/10': !isCorrect,
		}"
	>
		<div class="flex items-center justify-between mb-2">
			<div class="text-xs flex-1">
				<span v-if="isCorrect" class="text-success">
					<i class="fa-solid fa-check-circle" />
					Correct answer
				</span>
				<span v-else class="text-error">
					<i class="fa-solid fa-times-circle" />
					Wrong answer
				</span>
			</div>
			<button @click="toggleCorrectAnswerPayload(quickReply)" class="btn btn-xs btn-ghost">
				<i class="fa-solid fa-right-left" />
				<span v-if="isCorrect">Set Wrong</span>
				<span v-else>Set Correct</span>
			</button>
		</div>
		<div class="flex items-baseline gap-1">
			<div class="flex-1 space-y-2">
				<div>
					<input
						v-model="quickReply.title"
						type="text"
						class="input input-sm w-full border"
						:class="{
							'border-success/50': isCorrect,
							'border-error/50': !isCorrect,
						}"
						:placeholder="`Answer ${index + 1}`"
						:maxlength="40"
						@blur="validateField(quickReply.uuid, quickReply.title)"
						@input="validateField(quickReply.uuid, quickReply.title)"
					/>
					<div v-if="getFieldError(quickReply.uuid)" class="text-error text-xs mt-1">
						{{ getFieldError(quickReply.uuid) }}
					</div>
				</div>
			</div>
			<button
				@click="deleteQuickReply(quickReply.uuid)"
				class="btn btn-xs btn-ghost text-error p-1"
				:disabled="questionReplies?.length <= 1"
			>
				<i class="fa-solid fa-trash" />
			</button>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		quickReply: {
			type: Object,
			required: true,
		},
		incrementContactFieldNodeGuard: {
			type: String,
			required: true,
		},
		wrongAnswerGuard: {
			type: String,
		},
		questionReplies: {
			type: Array,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	computed: {
		isCorrect() {
			return this.quickReply.payload === this.incrementContactFieldNodeGuard
		},
		getFieldError() {
			return (fieldUuid) => this.fieldErrors[fieldUuid] || null
		},
	},
	data() {
		return {
			fieldErrors: {},
		}
	},
	methods: {
		toggleCorrectAnswerPayload(quickReply) {
			quickReply.payload =
				quickReply.payload === this.incrementContactFieldNodeGuard
					? this.wrongAnswerGuard
					: this.incrementContactFieldNodeGuard
		},

		deleteQuickReply(uuid) {
			if (this.questionReplies) {
				const index = this.questionReplies.indexOf(this.questionReplies.find((reply) => reply.uuid === uuid))
				if (index > -1) {
					this.questionReplies.splice(index, 1)
				}
			}
		},
		validateField(fieldId, value) {
			// Required validation
			if (!value || value.trim() === '') {
				this.fieldErrors[fieldId] = this.$t('components.flow.node.actions.sendMessagePartials.quickReply.required')
				return false
			}

			// Max length validation
			if (value.length > 20) {
				this.fieldErrors[fieldId] = this.$t('components.flow.node.actions.sendMessagePartials.quickReply.maxLength')
				return false
			}

			// Clear error if validation passes
			this.fieldErrors[fieldId] = null
			return true
		},
	},
}
</script>
