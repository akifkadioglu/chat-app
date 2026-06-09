import emojiRegex from 'emoji-regex'
import { errorsList } from '~/models/Flow/utils/defaultConfigs'
import { CommentOnPostType, nodeTypes, triggerTypes } from '~/models/Flow/utils/utils'
import type { Node } from '~/models/Flow/Node'

const calcCharCount = (text: string): number => {
	const igUsernameCount = text.split('{{ig.username}}').length - 1
	const regex = emojiRegex()

	const emojis = text.match(regex) || []
	const emojiCharCount = emojis.reduce((sum, emoji) => sum + emoji.length, 0)

	const textWithoutEmojis = text.replace(regex, '')

	return textWithoutEmojis.length + emojiCharCount + igUsernameCount * 15
}

type ValidationError = { type: string; messageKey: string; message: string }

const createError = ($t: (key: string) => string, errorType: string): ValidationError => ({
	...errorsList[errorType],
	message: $t(errorsList[errorType].messageKey),
})

export const validateButtons = ($t: (key: string) => string, buttons: any[], node: Node): ValidationError[] => {
	const errors: ValidationError[] = []

	buttons.forEach((btn: any) => {
		if (btn?.websiteLink) {
			if (!btn.url) errors.push(createError($t, errorsList.websiteLinkButtonUrlNotSet.type))
			return
		}
		if (!btn.text) {
			errors.push(createError($t, errorsList.buttonTextIsEmpty.type))
			return
		}
		if (!node.toEdges?.find((edge: any) => edge.guard === btn.guard)) {
			errors.push(createError($t, errorsList.buttonGuardNotMatch.type))
		}
	})

	return errors
}

export const validateSendMessage = ($t: (key: string) => string, node: Node): ValidationError[] => {
	const errors: ValidationError[] = []
	const contents = node.config?.contents ?? []

	if (contents.length === 0) {
		errors.push(createError($t, errorsList.sendMessageNeedsMessage.type))
		return errors
	}

	for (const content of contents) {
		const text = content.text?.trim() ?? ''
		const hasContent =
			text ||
			content.attachment ||
			content.elements ||
			content.image?.url ||
			content.dynamic?.url ||
			content.delay?.duration ||
			content.audio?.url ||
			content.video?.url ||
			content.file?.url

		if (!hasContent) {
			errors.push(createError($t, errorsList.sendMessageNeedsMessage.type))
			break
		}
		if (calcCharCount(text) > 1000) {
			errors.push(createError($t, errorsList.sendMessageTooLong.type))
		}
		if (content.buttons?.length > 0) {
			errors.push(...validateButtons($t, content.buttons, node))
		}
	}

	node.config.quickReplies?.forEach((quickReply: any) => {
		if (!quickReply.title) {
			if (errors.some((e) => e.type === errorsList.quickReplyTitleIsEmpty.type)) {
				return
			}
			errors.push(createError($t, errorsList.quickReplyTitleIsEmpty.type))
			return
		}
		if (!node.toEdges?.find((edge: any) => edge.guard === quickReply.payload)) {
			if (errors.some((e) => e.type === errorsList.quickReplyGuardNotMatch.type)) {
				return
			}
			errors.push(createError($t, errorsList.quickReplyGuardNotMatch.type))
			return
		}
	})

	return errors
}

export const validatePrivateReply = ($t: (key: string) => string, node: Node): ValidationError[] => {
	const errors: ValidationError[] = []
	const text = node.config.text?.trim() ?? ''

	if (!text) {
		errors.push(createError($t, errorsList.sendMessageNeedsMessage.type))
	}

	if (calcCharCount(text) > 1000) {
		errors.push(createError($t, errorsList.sendMessageTooLong.type))
	}

	if (node.config?.buttons?.length > 0) {
		errors.push(...validateButtons($t, node.config.buttons, node))
	}

	return errors
}

export const validateTrigger = ($t: (key: string) => string, node: Node): ValidationError[] => {
	const errors: ValidationError[] = []

	if (node.triggers.length === 0) {
		errors.push(createError($t, errorsList.triggersNeedsTrigger.type))
		return errors
	}

	node.triggers.forEach((trigger: any) => {
		if (trigger.type.key === triggerTypes.commentOnPost.key) {
			if (
				trigger.config?.selectedPostIds.length === 0 &&
				trigger.config?.postType === CommentOnPostType.SELECTED_POSTS
			) {
				errors.push(createError($t, errorsList.needsSelectAtLeastOnePost.type))
			}
		}
		if (trigger.type.key !== triggerTypes.receivedDM.key) return

		const hasWordFilter = (trigger.config?.wordFilters ?? []).some(
			(rule: any) => rule.type !== 'doesNotContain' && rule.keywords.length > 0,
		)
		const hasAiFilter = trigger.config?.intentFilter?.intention

		const isWordFilterValid = hasWordFilter && trigger.config?.filterByWords
		const isAiFilterValid = hasAiFilter && trigger.config?.filterByIntent

		if (!isWordFilterValid && !isAiFilterValid) {
			errors.push(createError($t, errorsList.receivedDMNeedsFilter.type))
		}
	})

	return errors
}

export const validateRequiredField = ($t: (key: string) => string, node: Node): ValidationError[] => {
	if (!node.config?.field?.key) {
		return [createError($t, errorsList.needsToSetField.type)]
	}
	return []
}

//TODO:: Bu eşleştirmeyi Flow.ts içerisinde yapmak daha doğru. Burası sadece validator fonksiyonlarını içermeli ve export etmeli.
export const nodeValidators: Record<string, ($t: (key: string) => string, node: Node) => ValidationError[]> = {
	[nodeTypes.actions.sendMessage.key]: validateSendMessage,
	[nodeTypes.commentActions.sendPrivateReply.key]: validatePrivateReply,
	[nodeTypes.trigger.key]: validateTrigger,
	[nodeTypes.conditions.comparison.key]: validateRequiredField,
	[nodeTypes.actions.setContactField.key]: validateRequiredField,
}
