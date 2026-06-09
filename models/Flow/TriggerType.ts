import { NodeType } from '~/models/Flow/NodeType'

export const availableTriggerTypeKeys = ['storyMention', 'commentOnPost', 'replyToStory', 'receivedDM', 'commentOnLive']
export class TriggerType extends NodeType {
	availableInTriggers: boolean

	constructor(triggerType: any) {
		super(triggerType?.uuid ?? null)

		this.id = triggerType?.id ?? null
		this.label = triggerType?.label ?? ''
		this.key = triggerType?.key ?? ''
		this.availableInTriggers = availableTriggerTypeKeys.includes(this.key)
	}
}
