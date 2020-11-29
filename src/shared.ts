export type CaptureArea = 'captureArea' | 'captureViewport'
export type Target = 'download' | 'tab' | 'clipboard'

export const SETTINGS_KEYS: readonly (keyof Settings)[] = [
	'minifySvg',
	'keepLinks',
	'inlineResources',
	'prettyPrintSvg',
	'target',
]

/**
 * The user settings stored in `browser.storage.sync`
 */
export interface Settings {
	minifySvg?: boolean
	inlineResources?: boolean
	prettyPrintSvg?: boolean
	keepLinks?: boolean
	target?: Target
}

export const applyDefaults = ({
	inlineResources = true,
	minifySvg = false,
	prettyPrintSvg = true,
	keepLinks = true,
	target = 'download',
}: Settings): Required<Settings> => ({
	inlineResources,
	minifySvg,
	keepLinks,
	prettyPrintSvg,
	target,
})
