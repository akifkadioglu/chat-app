import traverse from 'traverse'
import defaultConfigs from '~/models/Flow/utils/defaultConfigs'

export function ensureQuickFlows(flow: any, translateFunc: any) {
	traverse(flow).forEach(function (value) {
		if (this.key === 'key' && this.parent && this.parent.parent && this.parent.key === 'type') {
			if (!this.parent.parent.node.config) {
				this.parent.parent.node.config = defaultConfigs(translateFunc)[value]
			}
		}
	})
	return flow
}
