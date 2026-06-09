import traverse from 'traverse'

type QueryValue = string | string[] | null | undefined
type Query = Record<string, QueryValue>
type Placeholders = Record<string, string>

const TOKEN_PATTERN = /__([A-Za-z0-9_]+?)__/g

const RESERVED_QUERY_KEYS = new Set(['username'])

export function extractPlaceholderParams(query: Query): Placeholders {
	const params: Placeholders = {}

	for (const [key, value] of Object.entries(query || {})) {
		if (RESERVED_QUERY_KEYS.has(key)) continue
		params[key] = normalizeQueryValue(value)
	}

	return params
}

export function applyFlowPlaceholders<T>(flowObject: T, params: Placeholders): T {
	const hasParams = Object.keys(params).length > 0
	if (!flowObject || !hasParams) return flowObject

	traverse(flowObject).forEach(function (value) {
		if (typeof value !== 'string' || !value.includes('__')) return

		const replaced = replaceTokens(value, params)
		if (replaced !== value) this.update(replaced)
	})

	return flowObject
}

function normalizeQueryValue(value: QueryValue): string {
	const raw = Array.isArray(value) ? value[0] : value
	if (raw == null) return ''
	return String(raw)
}

function replaceTokens(text: string, params: Placeholders): string {
	return text.replace(TOKEN_PATTERN, (match, key) => {
		if (key in params) return params[key]
		return match
	})
}
