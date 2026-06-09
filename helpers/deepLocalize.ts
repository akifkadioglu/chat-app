import traverse from 'traverse'

export function deepLocalize(
	obj: any,
	{ t, te }: { t: (key: string, params?: Record<string, string>) => string; te: (key: string) => boolean },
) {
	traverse(obj).forEach(function (value) {
		// TODO :: te(value) ile kontrol edilebilir tr.json'u da hallettikten sonra
		if (typeof value === 'string') {
			this.update(t(value, { igUsername: '{{ig.username}}' }))
			return
		}
	})
	return obj
}
