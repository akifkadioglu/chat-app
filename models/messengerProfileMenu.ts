import { v4 } from 'uuid'
import { Node } from '~/models/Flow/Node'

export const MenuTypes = {
	PERSISTENT_MENU: 'persistent_menu',
	ICE_BREAKERS: 'ice_breakers',
}

export interface MenuLocale {
	locale: string
	call_to_actions: any[]
}

export interface MessengerProfileMenu {
	platform: string
	persistent_menu?: MenuLocale[]
	ice_breakers?: MenuLocale[]
}

export class CallToActionModel {
	type?: 'postback' | 'web_url' | 'ice_breakers'
	title?: string
	payload?: string
	url?: string
	// webview_height_ratio?: 'compact' | 'tall' | 'full'
	question?: string
	action?: Node | null

	constructor(data: Partial<CallToActionModel> = {}) {
		this.type = data.type
		this.title = data.title || ''
		this.payload = data.payload || ''
		this.url = data.url || ''
		// this.webview_height_ratio = data.webview_height_ratio || 'tall'
		this.question = data.question || ''
		this.action = data.action ? new Node(data.action) : null
	}

	static createPostback(title: string = '', payload: string = ''): CallToActionModel {
		return new CallToActionModel({
			type: 'postback',
			title,
			payload,
			action: null,
		})
	}

	static createWebUrl(title: string = '', url: string = ''): CallToActionModel {
		return new CallToActionModel({
			type: 'web_url',
			title,
			url,
			// webview_height_ratio: 'tall',
		})
	}

	static createIceBreaker(question: string = ''): CallToActionModel {
		return new CallToActionModel({
			question,
			payload: 'new_question',
			action: null,
		})
	}

	isValid(): boolean {
		if (this.type === 'postback') {
			return !!(this.title && (this.payload || this.action))
		}
		if (this.type === 'web_url') {
			return !!(this.title && this.url)
		}
		if (this.question !== undefined) {
			return !!this.question
		}
		return false
	}

	toJSON(): any {
		const result: any = {}
		if (this.type) result.type = this.type
		if (this.title) result.title = this.title
		if (this.payload) result.payload = this.payload
		if (this.url) result.url = this.url
		// if (this.webview_height_ratio) result.webview_height_ratio = this.webview_height_ratio
		if (this.question) result.question = this.question

		if (this.action) {
			result.action = { ...this.action, isSingle: true }
		}

		return result
	}
}

export class MenuLocaleModel {
	locale: string
	call_to_actions: CallToActionModel[]

	constructor(locale: string, callToActions: CallToActionModel[] = []) {
		this.locale = locale
		this.call_to_actions = callToActions
	}

	addCallToAction(cta: CallToActionModel): void {
		this.call_to_actions.push(new CallToActionModel(cta))
	}

	removeCallToAction(index: number): void {
		if (index >= 0 && index < this.call_to_actions.length) {
			this.call_to_actions.splice(index, 1)
		}
	}

	updateCallToAction(index: number, cta: Partial<CallToActionModel>): void {
		if (index >= 0 && index < this.call_to_actions.length) {
			Object.assign(this.call_to_actions[index], cta)
		}
	}

	getValidCallToActions(): CallToActionModel[] {
		return this.call_to_actions.filter((cta) => cta.isValid())
	}

	hasValidCallToActions(): boolean {
		return this.getValidCallToActions().length > 0
	}

	clone(): MenuLocaleModel {
		const callToActions = this.call_to_actions.map((cta) => {
			let actionClone = null
			if (cta.action) {
				//TODO::üzerinden geç çünkü toRaw çalışmadı
				actionClone = JSON.parse(JSON.stringify({ ...cta.action, isSingle: true }))
			}

			consoleLog('actionClone', actionClone)
			consoleLog('actionClone cta', cta.action)

			return new CallToActionModel({
				type: cta.type,
				title: cta.title,
				payload: v4(),
				url: cta.url,
				// webview_height_ratio: cta.webview_height_ratio,
				question: cta.question,
				action: actionClone,
			})
		})
		return new MenuLocaleModel(this.locale, callToActions)
	}

	toJSON(): MenuLocale {
		return {
			locale: this.locale,
			call_to_actions: this.call_to_actions.map((cta) => cta.toJSON()),
		}
	}
}

export class MessengerProfileMenuModel implements MessengerProfileMenu {
	platform: string
	persistent_menu: MenuLocaleModel[]
	ice_breakers: MenuLocaleModel[]

	constructor(data: Partial<MessengerProfileMenu> = {}) {
		this.platform = data.platform || 'instagram'
		this.persistent_menu = (data.persistent_menu || []).map(
			(menu) =>
				new MenuLocaleModel(
					menu.locale,
					(menu.call_to_actions || []).map((cta) => new CallToActionModel(cta)),
				),
		)
		this.ice_breakers = (data.ice_breakers || []).map(
			(menu) =>
				new MenuLocaleModel(
					menu.locale,
					(menu.call_to_actions || []).map((cta) => new CallToActionModel(cta)),
				),
		)
	}

	// Persistent Menu Methods
	addPersistentMenuLocale(locale: string, baseLocale?: string): void {
		if (this.hasPersistentMenuLocale(locale)) return

		const baseMenu = this.getMenuByType(MenuTypes.PERSISTENT_MENU).find((menu) => menu.locale === baseLocale)
		if (baseMenu) {
			const clonedMenu = baseMenu.clone()
			clonedMenu.locale = locale
			this.persistent_menu.push(clonedMenu)
			return
		}
		this.persistent_menu.push(new MenuLocaleModel(locale, []))
	}

	removePersistentMenuLocale(locale: string): void {
		this.persistent_menu = this.persistent_menu.filter((menu) => menu.locale !== locale)
	}

	getPersistentMenuByLocale(locale: string): MenuLocaleModel | undefined {
		return this.persistent_menu.find((menu) => menu.locale === locale)
	}

	hasPersistentMenuLocale(locale: string): boolean {
		return this.persistent_menu.some((menu) => menu.locale === locale)
	}

	getPersistentMenuLocales(): string[] {
		return this.persistent_menu.map((menu) => menu.locale)
	}

	// Ice Breakers Methods
	addIceBreakerLocale(locale: string, baseLocale?: string): void {
		if (this.hasIceBreakerLocale(locale)) return

		const baseMenu = this.getMenuByType('ice_breakers').find((menu) => menu.locale === baseLocale)
		if (baseMenu) {
			const clonedMenu = baseMenu.clone()
			clonedMenu.locale = locale
			this.ice_breakers.push(clonedMenu)
			return
		}
		this.ice_breakers.push(new MenuLocaleModel(locale, []))
	}

	removeIceBreakerLocale(locale: string): void {
		this.ice_breakers = this.ice_breakers.filter((menu) => menu.locale !== locale)
	}

	getIceBreakerByLocale(locale: string): MenuLocaleModel | undefined {
		return this.ice_breakers.find((menu) => menu.locale === locale)
	}

	hasIceBreakerLocale(locale: string): boolean {
		return this.ice_breakers.some((menu) => menu.locale === locale)
	}

	getIceBreakerLocales(): string[] {
		return this.ice_breakers.map((menu) => menu.locale)
	}

	// General Methods
	getMenuByType(type: string): MenuLocaleModel[] {
		return type === MenuTypes.PERSISTENT_MENU ? this.persistent_menu : this.ice_breakers
	}

	setMenuByType(type: string, menus: MenuLocaleModel[]): void {
		if (type === MenuTypes.PERSISTENT_MENU) {
			this.persistent_menu = menus
			return
		}

		this.ice_breakers = menus
	}

	hasAnyMenu(): boolean {
		return this.persistent_menu.length > 0 || this.ice_breakers.length > 0
	}

	hasPersistentMenu(): boolean {
		return this.persistent_menu.some((menu) => menu.hasValidCallToActions())
	}

	hasIceBreakers(): boolean {
		return this.ice_breakers.some((menu) => menu.hasValidCallToActions())
	}

	getTotalCallToActions(type: string): number {
		return this.getMenuByType(type).reduce((total, menu) => total + menu.call_to_actions.length, 0)
	}

	getValidCallToActionsCount(type: string): number {
		return this.getMenuByType(type).reduce((total, menu) => total + menu.getValidCallToActions().length, 0)
	}

	clone(): MessengerProfileMenuModel {
		return new MessengerProfileMenuModel({
			platform: this.platform,
			persistent_menu: this.persistent_menu.map((menu) => menu.toJSON()),
			ice_breakers: this.ice_breakers.map((menu) => menu.toJSON()),
		})
	}

	toJSON(): MessengerProfileMenu {
		const result: MessengerProfileMenu = {
			platform: this.platform,
		}

		if (this.persistent_menu.length > 0) {
			result.persistent_menu = this.persistent_menu.map((menu) => menu.toJSON())
		}

		if (this.ice_breakers.length > 0) {
			result.ice_breakers = this.ice_breakers.map((menu) => menu.toJSON())
		}

		return result
	}

	// Static factory methods
	static createEmpty(platform: string = 'instagram'): MessengerProfileMenuModel {
		return new MessengerProfileMenuModel({ platform })
	}

	static fromJSON(data: MessengerProfileMenu): MessengerProfileMenuModel {
		return new MessengerProfileMenuModel(data)
	}
}

export function getMaxCallToActionsLength(type: string): number {
	return type === 'persistent_menu' ? 20 : 4
}
