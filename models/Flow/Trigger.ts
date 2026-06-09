import { BaseClass } from '~/models/BaseClass'
import type { Reactive } from 'vue'

import { TriggerType } from '~/models/Flow/TriggerType'
import { defaultTriggerConfigs } from '~/models/Flow/utils/defaultConfigs'
import { deepMerge, triggerTypes } from '~/models/Flow/utils/utils'

export class Trigger extends BaseClass {
	id: number | null
	type: TriggerType
	name: string
	config: Reactive<any>
	createdAt: Date | null
	selectedPosts: Array<object> | null

	constructor(trigger: any) {
		super(trigger?.uuid ?? null)

		this.id = trigger?.id ?? null
		this.type = new TriggerType(trigger?.type ?? trigger?.trigger_type ?? {})
		this.name = trigger?.name ?? ''

		const defaultConfig = defaultTriggerConfigs()[this.type.key] ?? {}
		const triggerConfig = trigger?.config ?? {}

		const isCommentTrigger = this.type.key === triggerTypes.commentOnPost.key
		const isExistingFlow = !!triggerConfig
		if (isCommentTrigger && isExistingFlow && triggerConfig.showSignature === undefined) {
			triggerConfig.showSignature = false
		}

		// Deep merge config to properly handle nested objects like filters
		this.config = deepMerge(defaultConfig, triggerConfig)
		this.selectedPosts = trigger?.selectedPosts

		this.createdAt = trigger?.createdAt ?? null
	}

	toJSON() {
		return {
			uuid: this.uuid,
			id: this.id,
			type: this.type,
			name: this.name,
			config: toRaw(this.config),
		}
	}
}
