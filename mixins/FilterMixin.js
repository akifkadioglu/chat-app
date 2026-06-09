export default {
	methods: {
		parseFiltersFromQuery(query = {}) {
			const filters = []
			Object.keys(query || {}).forEach((key) => {
				if (!key.startsWith('filter_')) return
				const value = query[key]
				const parts = (value || '').toString().split(':')
				if (parts.length < 3) return

				filters.push({
					field: parts[0],
					operator: parts[1],
					value: parts.slice(2).join(':'),
				})
			})
			return filters
		},
		getActiveFiltersFromRoute() {
			const query = this.$route?.query || {}
			return this.parseFiltersFromQuery(query)
		},
		resolveFieldValue(entity, field) {
			if (field.startsWith('ig.')) {
				const igKey = field.replace('ig.', '')
				return entity[igKey] ?? entity.instagram?.[igKey] ?? entity.platformAccountsInstagram?.[igKey]
			}
			if (field.startsWith('custom.')) {
				const customKey = field.replace('custom.', '')
				// Support both object-style and array-style custom fields
				if (entity.customFieldsValues) {
					const cfv = entity.customFieldsValues.find((cf) => cf.customFieldKey === customKey || cf.key === customKey)
					return cfv?.value?.toString() || ''
				}
				return entity.customFields?.[customKey]
			}
            if (field === 'tag') return entity.tagValues
			if (field === 'first_name') return entity.firstName || ''
			if (field === 'last_name') return entity.lastName || ''
			return entity[field]
		},
		evaluateOperator(fieldValue, operator, value) {
			const strVal = (fieldValue ?? '').toString().toLowerCase()
			const compareVal = (value ?? '').toString().toLowerCase()
			const numField = parseFloat(fieldValue)
			const numValue = parseFloat(value)

			switch (operator) {
				// String operators
				case 'equals': return strVal === compareVal
				case 'not_equals': return strVal !== compareVal
				case 'contains': return strVal.includes(compareVal)
				case 'not_contains': return !strVal.includes(compareVal)
				case 'starts_with': return strVal.startsWith(compareVal)
				case 'ends_with': return strVal.endsWith(compareVal)
				case 'is_empty': return !strVal || strVal.trim() === ''
				case 'is_not_empty': return strVal && strVal.trim() !== ''

				// Bool operators
				case 'is_true': return strVal === 'true' || strVal === '1' || fieldValue === true
				case 'is_false': return strVal === 'false' || strVal === '0' || !fieldValue

				// Integer operators
				case 'greater_than': return numField > numValue
				case 'less_than': return numField < numValue
				case 'greater_than_or_equal': return numField >= numValue
				case 'less_than_or_equal': return numField <= numValue

				// Date operators
				case 'before': return new Date(fieldValue) < new Date(value)
				case 'after': return new Date(fieldValue) > new Date(value)
				case 'on': return new Date(fieldValue).toDateString() === new Date(value).toDateString()
				case 'within_days': {
					const days = parseInt(value)
					const diffDays = Math.floor((new Date() - new Date(fieldValue)) / (1000 * 60 * 60 * 24))
					return diffDays <= days
				}
				case 'older_than_days': {
					const days = parseInt(value)
					const diffDays = Math.floor((new Date() - new Date(fieldValue)) / (1000 * 60 * 60 * 24))
					return diffDays > days
				}

				// Sentiment operators
				case 'positive': return strVal === 'positive'
				case 'negative': return strVal === 'negative'
				case 'neutral': return strVal === 'neutral'

				// Tag / collection operators
				case 'has': return Array.isArray(fieldValue) ? fieldValue.includes(value) : strVal === compareVal
				case 'not_has': return Array.isArray(fieldValue) ? !fieldValue.includes(value) : strVal !== compareVal

				default: return true
			}
		},
	},
}
