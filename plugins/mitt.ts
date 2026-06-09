// plugins/emitter.ts
import { defineNuxtPlugin } from '#app'
import mitt, { type Emitter } from 'mitt'
import type { AppEvents } from '~/types/emitterEvents'

export default defineNuxtPlugin((nuxtApp) => {
	const emitter: Emitter<AppEvents> = mitt<AppEvents>()
	nuxtApp.provide('emitter', emitter)
})
