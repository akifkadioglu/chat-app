import { guardKeys, nodeTypes, randomizerConstants, triggerTypes } from '~/models/Flow/utils/utils.js'

export const guardStyles = {
	[guardKeys.button]: {
		key: guardKeys.button,
		color: '#0ea5e9',
		icon: 'fa fa-hand-pointer',
	},
	[guardKeys.quickReply]: {
		color: '#10b981',
		icon: 'fa fa-reply',
	},
	[guardKeys.invalidReply]: {
		color: '#ef4444',
		icon: 'fa fa-times-circle',
	},
	[guardKeys.expired]: {
		color: '#f59e0b',
		icon: 'fa fa-clock',
	},
	[guardKeys.variation]: {
		color: '#8b5cf6',
		icon: 'fa fa-random',
	},
	[guardKeys.else]: {
		color: '#6b7280',
		icon: 'fa fa-code-branch',
	},
	[guardKeys.consent]: {
		color: '#0ea5e9',
		icon: 'fa fa-arrow-right',
	},
}

export default {
	data() {
		return {
			guardStyles,
			guardKeys,
		}
	},
	methods: {
		getGuardLabel(guardKey) {
			return this.$t(`mixins.flowDiagramMixin.guardStyles.${guardKey}`)
		},
		getNodeGuardElements(node) {
			const quickReplies = node.config?.quickReplies ?? []
			const options = node.config?.options ?? []
			const buttons = node.config?.contents?.flatMap((c) => c.buttons ?? []) ?? node.config?.buttons ?? []
			const elements = node.config?.contents?.flatMap((c) => c.elements ?? []) ?? []
			const elementButtons = elements?.flatMap((e) => e.buttons ?? []) ?? []
			buttons.push(...elementButtons)

			const variations = node.config?.variations ?? []

			return { quickReplies, buttons, variations, options }
		},

		getGuardStyleForEdge(nodeUuid, guard) {
			const node = this.flowStore?.flow?.nodes?.find((n) => n.uuid === nodeUuid)
			if (!node || !guard) return null

			const { quickReplies, buttons, variations, options } = this.getNodeGuardElements(node)

			const quickReply = quickReplies.find((qr) => qr.payload === guard)
			const button = buttons.find((b) => b.guard === guard)
			const variantId = variations.findIndex((v) => v.uuid === guard)
			const option = options.find((o) => o.payload === guard)

			const isSendPrivateReply = node.type.key === nodeTypes.commentActions.sendPrivateReply.key

			if (isSendPrivateReply) return guardStyles[guardKeys.consent]
			if (quickReply || option) return guardStyles[guardKeys.quickReply]
			if (button) return guardStyles[guardKeys.button]
			if (variantId >= 0) {
				const { variationColors } = randomizerConstants
				return {
					...guardStyles[guardKeys.variation],
					color: variationColors[variantId % variationColors.length],
				}
			}

			// Special guards
			if (guard === guardKeys.else) return guardStyles[guardKeys.else]
			if (guard === guardKeys.invalidReply) return guardStyles[guardKeys.invalidReply]
			if (guard === guardKeys.expired) return guardStyles[guardKeys.expired]

			return null
		},

		getPostbackTriggers(node) {
			const triggers =
				node.triggers?.filter(
					(t) => t.type.key === triggerTypes.postback.key || t.type.key === triggerTypes.quickReply.key,
				) ?? []
			const { quickReplies, buttons, variations, options } = this.getNodeGuardElements(node)

			const { variationLabels, variationColors } = randomizerConstants

			return triggers
				.map((trigger) => {
					const postback = trigger.config?.postback
					const quickReply = quickReplies.find((qr) => qr.payload === postback)
					const button = buttons.find((b) => b.guard === postback)
					const option = options.find((o) => o.payload === postback)
					const variantId = variations.findIndex((v) => v.uuid === postback)
					const variantLabel = variantId >= 0 ? variationLabels[variantId % variationLabels.length] : null
					const variantColor = variantId >= 0 ? variationColors[variantId % variationColors.length] : null

					const isSendPrivateReply = node.type.key === nodeTypes.commentActions.sendPrivateReply.key

					let color = null
					let icon = null
					let name = ''
					if (quickReply || option) {
						color = guardStyles[guardKeys.quickReply]?.color
						icon = guardStyles[guardKeys.quickReply]?.icon
						name = quickReply?.title || option?.title || this.getGuardLabel(guardKeys.quickReply)
					}
					if (button) {
						color = guardStyles[guardKeys.button]?.color
						icon = guardStyles[guardKeys.button]?.icon
						name = button.text || this.getGuardLabel(guardKeys.button)
					}
					if (variantColor) {
						color = variantColor
						icon = guardStyles[guardKeys.variation]?.icon
						name = variantLabel
					}
					if (isSendPrivateReply) {
						color = guardStyles[guardKeys.consent]?.color
						icon = guardStyles[guardKeys.consent]?.icon
						const isConsentButton = !!buttons.find((b) => b.guard === postback && b.consentButton)
						if (isConsentButton) {
							name = this.getGuardLabel(guardKeys.consent)
						} else {
							name = button?.text ?? ''
						}
					}

					return {
						...trigger,
						name: name,
						color,
						postback,
						icon: icon || 'fa fa-reply',
					}
				})
				.filter((t) => t.config?.postback)
		},
	},
}
