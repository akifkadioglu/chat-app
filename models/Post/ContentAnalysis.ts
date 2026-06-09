import { BaseClass } from '~/models/BaseClass'
import { ContentIntent } from '~/models/Post/ContentIntent'

export class ContentAnalysis extends BaseClass {
	id: number | null
	label: 'positive' | 'negative' | 'neutral'
	score: number | null
	scorePositive: number | null
	scoreNegative: number | null
	scoreToxicity: number | null
	hasQuestion: boolean
	analyzedText: string
	language: string
	intents: ContentIntent[]

	constructor(analysis: any) {
		super(analysis?.uuid ?? null)

		this.id = analysis?.id ?? null
		this.label = analysis?.label ?? 'neutral'
		this.score = analysis?.score ? parseFloat(analysis.score) : null
		this.scorePositive = analysis?.score_positive ? parseFloat(analysis.score_positive) : null
		this.scoreNegative = analysis?.score_negative ? parseFloat(analysis.score_negative) : null
		this.scoreToxicity = analysis?.score_toxicity ? parseFloat(analysis.score_toxicity) : null
		this.hasQuestion = analysis?.has_question ?? null
		this.analyzedText = analysis?.analyzed_text ?? ''
		this.language = analysis?.language ?? 'unknown'
		this.analyzedText = analysis?.analyzed_text ?? ''
		this.intents = analysis?.intents?.map((intent: any) => new ContentIntent(intent)) ?? []
	}

	get scorePercentage(): number {
		return Math.round(this.score * 100)
	}

	get isPositive(): boolean {
		return this.label === 'positive'
	}

	get isNegative(): boolean {
		return this.label === 'negative'
	}

	get isNeutral(): boolean {
		return this.label === 'neutral'
	}

	get colorClass(): string {
		switch (this.label) {
			case 'positive':
				return 'text-success'
			case 'negative':
				return 'text-error'
			case 'neutral':
				return 'text-neutral'
			default:
				return 'text-base-content'
		}
	}

	get badgeClass(): string {
		switch (this.label) {
			case 'positive':
				return 'badge-success'
			case 'negative':
				return 'badge-error'
			case 'neutral':
				return 'badge-neutral'
			default:
				return 'badge-ghost'
		}
	}

	get iconClass(): string {
		switch (this.label) {
			case 'positive':
				return 'fa-solid fa-smile'
			case 'negative':
				return 'fa-solid fa-frown'
			case 'neutral':
				return 'fa-solid fa-meh'
			default:
				return 'fa-solid fa-question'
		}
	}

	toJSON() {
		return {
			id: this.id,
			label: this.label,
			score: this.score.toString(),
			score_positive: this.scorePositive.toString(),
			score_negative: this.scoreNegative.toString(),
			score_toxicity: this.scoreToxicity.toString(),
			has_question: this.hasQuestion,
			analyzed_text: this.analyzedText,
		}
	}
}
