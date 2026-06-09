<template>
	<label class="swap swap-rotate">
		<!-- this hidden checkbox controls the state -->
		<input :id="inputId" :checked="isLight" type="checkbox" class="hidden" @change="toggleTheme" />

		<!-- sun icon -->
		<svg class="swap-on size-7 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path
				d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
			/>
		</svg>

		<!-- moon icon -->
		<svg class="swap-off size-7 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path
				d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
			/>
		</svg>
		<!--	<div class="switch">-->
		<!--		<input-->
		<!--			:id="inputId"-->
		<!--			type="checkbox"-->
		<!--			class="switch__input"-->
		<!--			:checked="isLight"-->
		<!--			:aria-label="$t('components.baseComponents.themeToggler.ariaLabel')"-->
		<!--			@change="toggleTheme"-->
		<!--		/>-->
		<!--		<label class="switch__label" :for="inputId">-->
		<!--			<span class="switch__indicator" />-->
		<!--			<span class="switch__decoration" />-->
		<!--		</label>-->
		<!--		&lt;!&ndash;  {{ colorMode.preference }}&ndash;&gt;-->
		<!--	</div>-->
	</label>
</template>

<script>
const LIGHT_THEME_KEY = 'light'
export default {
	data() {
		return {
			inputId: 'Switch',
			defaultPreferenceTheme: LIGHT_THEME_KEY,
		}
	},
	computed: {
		inputValue() {
			if (this.defaultPreferenceTheme === LIGHT_THEME_KEY) {
				return 'system'
			}
			return LIGHT_THEME_KEY
		},
		isLight: {
			get() {
				return (
					this.colorMode.preference === LIGHT_THEME_KEY ||
					(this.colorMode.preference === 'system' && this.defaultPreferenceTheme === LIGHT_THEME_KEY)
				)
			},
			set(value) {
				if (this.defaultPreferenceTheme === LIGHT_THEME_KEY && value) {
					this.colorMode.preference = 'system'
				} else if (this.defaultPreferenceTheme === 'dark' && !value) {
					this.colorMode.preference = 'system'
				} else {
					this.colorMode.preference = value ? LIGHT_THEME_KEY : 'dark'
				}
				this.setSystemTheme()
			},
		},
	},
	setup() {
		const colorMode = useColorMode()
		const rootPreferredTheme = useCookie('root-preferred-theme', {
			path: '/',
		})
		if (rootPreferredTheme.value) {
			colorMode.preference = rootPreferredTheme.value
		}

		return {
			colorMode,
		}
	},
	mounted() {
		if (import.meta.client) {
			this.inputId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

			this.setSystemTheme()
		}
	},
	methods: {
		async toggleTheme() {
			this.isLight = !this.isLight
			if (window) {
				const rootPreferredTheme = useCookie('root-preferred-theme', {
					path: '/',
					maxAge: 31536000,
				})
				rootPreferredTheme.value = this.colorMode.preference
			}
		},
		setSystemTheme() {
			this.defaultPreferenceTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : LIGHT_THEME_KEY
		},
	},
}
</script>

<style scoped lang="css">
.switch {
	display: inline-flex;
	position: relative;
	height: 2rem;
	width: 3.7rem;
}

.switch__input {
	clip: rect(0.5px, 0.5px, 0.5px, 0.5px);
	clip-path: inset(50%);
	height: 0.5px;
	width: 0.5px;
	margin: -0.5px;
	overflow: hidden;
	padding: 0;
	position: absolute;
}

.switch__label {
	position: relative;
	display: inline-block;
	width: 60px; /* 120 * 0.5px */
	height: 30px; /* 60 * 0.5px */
	background-color: #2b2b2b;
	border: 1px solid #5b5b5b; /* 2 * 0.5px */
	border-radius: 9999px;
	cursor: pointer;
	transition: all 0.4s cubic-bezier(0.46, 0.03, 0.52, 0.96);
}

.switch__indicator {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) translateX(-72%);
	display: block;
	width: 20px; /* 40 * 0.5px */
	height: 20px; /* 40 * 0.5px */
	background-color: #7b7b7b;
	border-radius: 9999px;
	box-shadow: 5px 0 0 0 rgba(0, 0, 0, 0.2) inset; /* 10 * 0.5px */
	transition: all 0.4s cubic-bezier(0.46, 0.03, 0.52, 0.96);
}

.switch__indicator::before,
.switch__indicator::after {
	position: absolute;
	content: '';
	display: block;
	background-color: #ffffff;
	border-radius: 9999px;
	transition: all 0.4s cubic-bezier(0.46, 0.03, 0.52, 0.96);
}

.switch__indicator::before {
	top: 3.5px; /* 7 * 0.5px */
	left: 3.5px; /* 7 * 0.5px */
	width: 4.5px; /* 9 * 0.5px */
	height: 4.5px; /* 9 * 0.5px */
	opacity: 0.6;
}

.switch__indicator::after {
	bottom: 4px; /* 8 * 0.5px */
	right: 3px; /* 6 * 0.5px */
	width: 7px; /* 14 * 0.5px */
	height: 7px; /* 14 * 0.5px */
	opacity: 0.8;
}

.switch__decoration {
	position: absolute;
	top: 65%;
	left: 50%;
	display: block;
	width: 2.5px; /* 5 * 0.5px */
	height: 2.5px; /* 5 * 0.5px */
	background-color: #ffffff;
	border-radius: 9999px;
}

.switch__decoration::before,
.switch__decoration::after {
	position: absolute;
	display: block;
	content: '';
	width: 2.5px; /* 5 * 0.5px */
	height: 2.5px; /* 5 * 0.5px */
	background-color: #ffffff;
	border-radius: 9999px;
}

.switch__decoration::before {
	top: -10px; /* -20 * 0.5px */
	left: 5px; /* 10 * 0.5px */
	opacity: 1;
	/* animation: twinkle 0.6s infinite; */
}

.switch__decoration::after {
	top: -3.5px; /* -7 * 0.5px */
	left: 15px; /* 30 * 0.5px */
	/* animation: twinkle 0.6s infinite -0.2s; */
}

.switch__input:checked + .switch__label {
	background-color: #8fb5f5;
	border-color: #347cf8;
}

.switch__input:checked + .switch__label .switch__indicator {
	background-color: #ecd21f;
	box-shadow: none;
	transform: translate(-50%, -50%) translateX(72%);
}

.switch__input:checked + .switch__label .switch__indicator::before,
.switch__input:checked + .switch__label .switch__indicator::after {
	display: none;
}

.switch__input:checked + .switch__label .switch__decoration {
	top: 50%;
	transform: translate(0%, -50%);
	width: 10px; /* 20 * 0.5px */
	height: 10px; /* 20 * 0.5px */
	border-radius: 9999px 9999px 0 0;
}

.switch__input:checked + .switch__label .switch__decoration::before {
	width: 5px; /* 10 * 0.5px */
	height: 5px; /* 10 * 0.5px */
	top: auto;
	bottom: 0;
	left: -4px; /* -8 * 0.5px */
}

.switch__input:checked + .switch__label .switch__decoration::after {
	width: 7.5px; /* 15 * 0.5px */
	height: 7.5px; /* 15 * 0.5px */
	top: auto;
	bottom: 0;
	left: 8px; /* 16 * 0.5px */
	border-bottom-right-radius: 9999px;
}

/* Optional animations (disabled)
@keyframes twinkle { 50% { opacity: 0.2; } }
@keyframes cloud {
  0% { transform: translate(0%, -50%); }
  50% { transform: translate(-100%, -50%); }
  100% { transform: translate(0%, -50%); }
}
*/
</style>
