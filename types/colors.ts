export const ringColors = [
	'ring-rose-600',
	'ring-amber-600',
	'ring-emerald-600',
	'ring-sky-600',
	'ring-indigo-600',
	'ring-violet-600',
]

export const borderAccountColors = [
	'before:bg-rose-600',
	'before:bg-amber-600',
	'before:bg-emerald-600',
	'before:bg-sky-600',
	'before:bg-indigo-600',
	'before:bg-violet-600',
]

export const textColors = [
	'text-rose-600',
	'text-amber-600',
	'text-emerald-600',
	'text-sky-600',
	'text-indigo-600',
	'text-violet-600',
]

export const bgColors = [
	'bg-rose-600',
	'bg-amber-600',
	'bg-emerald-600',
	'bg-sky-600',
	'bg-indigo-600',
	'bg-violet-600',
]

export const badgeSoftColors = [
	'bg-rose-600/20 text-rose-700',
	'bg-amber-600/20 text-amber-700',
	'bg-emerald-600/20 text-emerald-700',
	'bg-sky-600/20 text-sky-700',
	'bg-indigo-600/20 text-indigo-700',
	'bg-violet-600/20 text-violet-700',
]

export function getBadgeSoftColor(id: number): string {
	return badgeSoftColors[id % badgeSoftColors.length]
}

export function getBgColor(id: number): string {
	return bgColors[id % bgColors.length]
}

export function getTextColor(id: number): string {
	return textColors[id % textColors.length]
}

export function getRingColor(id: number): string {
	return ringColors[id % ringColors.length]
}

export function getBorderAccountColor(id: number): string {
	return borderAccountColors[id % borderAccountColors.length]
}


export const colorVariants = {
	card: {
		hover: {
			primary: 'hover:border-primary/80',
			instagram: 'hover:border-instagram/80',
			twitter: 'hover:border-twitter/80',
			youtube: 'hover:border-youtube/80',
			tiktok: 'hover:border-tiktok/80',
			facebook: 'hover:border-facebook/80',
			blue: 'hover:border-blue/80',
		},
		active: {
			primary: 'border-primary bg-primary/10',
			instagram: 'border-instagram bg-instagram/10',
			twitter: 'border-twitter bg-twitter/10',
			youtube: 'border-youtube bg-youtube/10',
			tiktok: 'border-tiktok bg-tiktok/10',
			facebook: 'border-facebook bg-facebook/10',
			blue: 'border-blue bg-blue/10',
		},
	},
	iconContainer: {
		hover: {
			primary: 'group-hover:bg-primary/30',
			instagram: 'group-hover:bg-instagram/30',
			twitter: 'group-hover:bg-twitter/30',
			youtube: 'group-hover:bg-youtube/30',
			tiktok: 'group-hover:bg-tiktok/30',
			facebook: 'group-hover:bg-facebook/30',
			blue: 'group-hover:bg-blue/30',
		},
		active: {
			primary: 'bg-primary',
			instagram: 'bg-instagram',
			twitter: 'bg-twitter',
			youtube: 'bg-youtube',
			tiktok: 'bg-tiktok',
			facebook: 'bg-facebook',
			blue: 'bg-blue',
		},
	},
	icon: {
		hover: {
			primary: 'group-hover:text-primary',
			instagram: 'group-hover:text-instagram',
			twitter: 'group-hover:text-twitter',
			youtube: 'group-hover:text-youtube',
			tiktok: 'group-hover:text-tiktok',
			facebook: 'group-hover:text-facebook',
			blue: 'group-hover:text-blue',
		},
		active: {
			primary: 'text-primary-content',
			instagram: 'text-instagram',
			twitter: 'text-twitter',
			youtube: 'text-youtube',
			tiktok: 'text-tiktok',
			facebook: 'text-facebook',
			blue: 'text-blue',
		},
	},
}
