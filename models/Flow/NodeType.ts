import { BaseClass } from '~/models/BaseClass'

export interface NodeTypeChild {
	key: string
	icon: string
	labelKey: string
	presetContentType?: string
}

export class NodeType extends BaseClass {
	id: number | null
	label: string
	key: string
	needsPro: boolean = false
	children?: NodeTypeChild[]

	constructor(nodeType: any) {
		super(nodeType?.uuid ?? null)

		this.id = nodeType?.id ?? null
		this.label = nodeType?.label ?? ''
		this.key = nodeType?.key ?? ''
	}
}
