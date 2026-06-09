import { BaseClass } from '~/models/BaseClass'

export const LIBRARY_STATUS = {
	PENDING: 0,
	ACTIVE: 1,
	REJECTED: 2,
}

export class SharedFlow extends BaseClass {
	id: number | null
	flowId: number | null
	flowVersion: { id: number; version: string } | null
	status: number | null
	isPublished: boolean | null
	approvedAt: Date | null
	slug: string | null

	constructor(sharedFlow: any = {}) {
		super(sharedFlow?.uuid ?? null)

		this.id = sharedFlow?.id ?? null
		this.flowId = sharedFlow?.flowId ?? sharedFlow?.flow_id ?? null
		this.flowVersion = sharedFlow?.sharedFlow?.flowVersion ?? sharedFlow?.shared_flow?.flow_version ?? null
		this.status = sharedFlow?.status ?? null
		this.isPublished = sharedFlow?.isPublished ?? sharedFlow?.is_published ?? null
		this.approvedAt = sharedFlow?.approvedAt ?? (sharedFlow?.approved_at ? new Date(sharedFlow.approved_at) : null)
		this.slug = sharedFlow?.slug ?? null
	}

	toJSON() {
		return {
			uuid: this.uuid,
			id: this.id,
			flowId: this.flowId,
			flowVersion: this.flowVersion,
			status: this.status,
			isPublished: this.isPublished,
			approvedAt: this.approvedAt,
			slug: this.slug,
		}
	}
}
