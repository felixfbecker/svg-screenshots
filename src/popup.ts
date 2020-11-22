import './polyfill'

import { applyDefaults, CaptureArea, Settings, SETTINGS_KEYS } from './shared'
import { assert, logErrors, once } from './util'

document.addEventListener('DOMContentLoaded', logErrors(main))

const createCaptureButtonHandler = (area: CaptureArea): (() => void) =>
	logErrors(async () => {
		console.log('Executing content script in tab')
		const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
		console.log('activeTab', activeTab)
		if (!activeTab?.id) {
			return
		}
		const started = once(
			browser.runtime.onMessage,
			(message, sender) => message.method === 'started' && sender.tab?.id === activeTab.id
		)
		await browser.tabs.executeScript(activeTab.id, {
			file: '/src/content.js',
		})
		const message = {
			method: 'capture',
			payload: {
				area,
			},
		}
		console.log('Waiting for content page to start capturing')
		await started
		await browser.tabs.sendMessage(activeTab.id, message)
		window.close()
	})

async function main(): Promise<void> {
	document
		.querySelector<HTMLButtonElement>('#capture-area-btn')!
		.addEventListener('click', createCaptureButtonHandler('captureArea'))
	document
		.querySelector<HTMLButtonElement>('#capture-page-btn')!
		.addEventListener('click', createCaptureButtonHandler('capturePage'))

	const optionsForm = document.forms.namedItem('options')!

	// Set initial settings in the DOM
	const settings = applyDefaults((await browser.storage.sync.get(SETTINGS_KEYS)) as Settings)
	for (const key of SETTINGS_KEYS) {
		const value = settings[key]
		const element = optionsForm.elements.namedItem(key)
		assert(element, `Expected ${key} to exist in options form`)
		if (typeof value === 'boolean') {
			assert(
				element instanceof HTMLInputElement && element.type === 'checkbox',
				'Expected element to be checkbox'
			)
			const checkbox = element as HTMLInputElement
			checkbox.checked = value
		} else if (typeof value === 'string') {
			assert(element instanceof RadioNodeList, 'Expected element to be RadioNodeList')
			element.value = value
		}
	}
	// Sync form changes to settings
	optionsForm.addEventListener(
		'change',
		logErrors(async ({ target }) => {
			if (!(target instanceof HTMLInputElement)) {
				return
			}
			if (target.type === 'checkbox') {
				await browser.storage.sync.set({ [target.name]: target.checked })
			} else if (target.type === 'radio') {
				await browser.storage.sync.set({ [target.name]: target.value })
			} else {
				throw new Error(`Unexpected form element ${target.type}`)
			}
		})
	)
}
