import { BaseClass } from '~/models/BaseClass'

export class ChatAccountSetting extends BaseClass {
	id: number | null
	key: string
	value: string

	constructor(data: any) {
		super(data?.uuid ?? null)

		this.id = data.id
		this.key = data.key
		this.value = data.value
	}
}

export const ChatAccountSettingKeys = {
	TIMEZONE_OFFSET: 'timezoneOffset',
	DEFAULT_LOCALE: 'defaultLocale',
	TARGET_LANGUAGE: 'targetLanguage',
	REGIONAL_LANGUAGE: 'regionalLanguage',
	AGENT_MESSAGE_PAUSE_DURATION: 'agentMessagePauseDuration',
	// DATE_FORMAT: 'dateFormat',
	// TIME_FORMAT: 'timeFormat',

	//Notification
	NOTIFICATIONS_DAILY: 'notificationsDaily',
	NOTIFICATIONS_WEEKLY: 'notificationsWeekly',
	NOTIFICATIONS_MONTHLY: 'notificationsMonthly',
	NOTIFICATIONS_NEW_FEATURES: 'notificationsNewFeatures',
	NOTIFICATIONS_FLOW_ACHIEVEMENT: 'notificationsFlowAchievement',
}