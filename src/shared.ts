export type CaptureArea = 'captureArea' | 'capturePage'

export const SETTINGS_KEYS = ['minifySvg', 'inlineResources', 'prettyPrintSvg'] as const

/**
 * The user settings stored in `browser.storage.sync`
 */
export type Settings = Partial<Record<typeof SETTINGS_KEYS[number], boolean>>

export const applyDefaults = ({
	inlineResources = true,
	minifySvg = false,
	prettyPrintSvg = true,
}: Settings): Required<Settings> => ({
	inlineResources,
	minifySvg,
	prettyPrintSvg,
})
