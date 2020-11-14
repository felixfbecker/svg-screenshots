import './polyfill'

import { applyDefaults, CaptureArea, Settings, SETTINGS_KEYS } from './shared'
import { logErrors, once } from './util'

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

	// Currently all boolean
	const settings = applyDefaults((await browser.storage.sync.get(SETTINGS_KEYS)) as Settings)
	for (const key of SETTINGS_KEYS) {
		const element = optionsForm.elements.namedItem(key)
		if (!element) {
			throw new Error(`Settings key ${key} not in form`)
		}
		if (!(element instanceof HTMLInputElement) || element.type !== 'checkbox') {
			throw new Error(`Settings key ${key} not a checkbox`)
		}
		element.checked = settings[key]
	}
	optionsForm.addEventListener(
		'change',
		logErrors(async event => {
			if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
				await browser.storage.sync.set({ [event.target.name]: event.target.checked })
			}
		})
	)
}
