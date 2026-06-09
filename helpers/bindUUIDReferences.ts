import traverse from 'traverse'
import { v4, validate } from 'uuid'

export function bindUuidReferences(flow: any) {
	const uuidMap: Record<string, string> = {}

	traverse(flow).forEach(function (value) {
		if (typeof value === 'string' && value.startsWith('generateUuid-')) {
			if (!uuidMap[value]) uuidMap[value] = v4()
			this.update(uuidMap[value])
		}
	})

	return flow
}

export function unbindUuidReferences(flow: any, excludeUuids: Set<string> = new Set()) {
	const uuidMap: Record<string, string> = {}
	let counter = 1

	traverse(flow).forEach(function (value) {
		if (typeof value === 'string' && validate(value) && !excludeUuids.has(value)) {
			if (!uuidMap[value]) uuidMap[value] = `generateUuid-${counter++}`
			this.update(uuidMap[value])
		}
	})

	return flow
}
